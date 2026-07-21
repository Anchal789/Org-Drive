'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchData } from '@/lib/api-fn';
import type { UploadedFile, UploadedFolder } from '@/types/files';

const RECENT_SEARCHES_KEY = 'smart_drive_recent_searches:v1';
const DEBOUNCE_MS = 300;
const MAX_RECENT = 3;

type SearchResults = {
  files: Array<UploadedFile>;
  folders: Array<UploadedFolder>;
};

/**
 * Shared debounced file/folder search: used by both the topbar SearchBar and
 * the full-page SmartSearchPage. Guards against out-of-order responses via
 * AbortController — a slower earlier request can no longer overwrite the
 * results of a faster, more recent one.
 */
export function useFileSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    files: [],
    folders: [],
  });
  const [isSearching, setIsSearching] = useState(false);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = window.localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (t) => t.toLowerCase() !== trimmed.toLowerCase(),
      );
      return [trimmed, ...filtered].slice(0, MAX_RECENT);
    });
  };

  const performSearch = async (query: string) => {
    abortControllerRef.current?.abort();

    if (!query.trim()) {
      setResults({ files: [], folders: [] });
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsSearching(true);
    try {
      const response = await fetchData<SearchResults>({
        url: `/api/search?q=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      if (response.success && response.data) {
        setResults(response.data);
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      void error;
    } finally {
      if (!controller.signal.aborted) {
        setIsSearching(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setActiveQuery(val);
      performSearch(val);
    }, DEBOUNCE_MS);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    saveRecentSearch(suggestion);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    setActiveQuery(suggestion);
    performSearch(suggestion);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') saveRecentSearch(searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setActiveQuery('');
    setResults({ files: [], folders: [] });
  };

  return {
    searchTerm,
    activeQuery,
    results,
    isSearching,
    recentSearches,
    saveRecentSearch,
    handleInputChange,
    handleSuggestionClick,
    handleInputKeyDown,
    clearSearch,
  };
}
