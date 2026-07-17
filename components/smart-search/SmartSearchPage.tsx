'use client';

import {
  ChevronRight,
  File,
  Folder,
  History,
  Search,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { fetchData } from '@/lib/api-fn';
import { encrypt } from '@/lib/utils';
import type { UploadedFile, UploadedFolder } from '@/types/files';
import FileMenu from '../dashboard/FileSection/FileMenu';
import FolderMenu from '../dashboard/FolderSection/FolderMenu/FolderMenu';
import { Button } from '../ui/button';
import styles from './SmartSearch.module.scss';

const SUGGESTED_SEARCHES = [
  'files I shared last week',
  'PDFs in Engineering',
  'drafts',
  'contracts expiring soon',
];

export default function SmartSearchPage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [isSmartMode, setIsSmartMode] = useState(true);
  const [results, setResults] = useState<{
    files: Array<UploadedFile>;
    folders: Array<UploadedFolder>;
  }>({ files: [], folders: [] });
  const [isSearching, setIsSearching] = useState(false);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];

    const savedSearches = window.localStorage.getItem(
      'smart_drive_recent_searches:v1',
    );
    if (savedSearches) {
      try {
        return JSON.parse(savedSearches) as string[];
      } catch (e: unknown) {
        void e;
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(
      'smart_drive_recent_searches:v1',
      JSON.stringify(recentSearches),
    );
  }, [recentSearches]);

  // ─── 1. SAVE SEARCH FUNCTION (KEEPS TOP 3) ───
  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (t) => t.toLowerCase() !== trimmed.toLowerCase(),
      );
      return [trimmed, ...filtered].slice(0, 3);
    });
  };

  // ─── 2. PERFORM SEARCH API CALL ───
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults({ files: [], folders: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetchData<{
        files: Array<UploadedFile>;
        folders: Array<UploadedFolder>;
      }>({
        url: `/api/search?q=${encodeURIComponent(query)}`,
      });

      if (response.success && response.data) {
        setResults(response.data);
      }
    } catch (error: unknown) {
      void error;
    }
    setIsSearching(false);
  };

  // ─── HANDLERS ───
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      setActiveQuery(val);
      performSearch(val);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    saveRecentSearch(suggestion);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    setActiveQuery(suggestion);
    performSearch(suggestion);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveRecentSearch(searchTerm);
    }
  };

  const isIdle = !activeQuery.trim();
  const displayFolders = results.folders.slice(0, 6);
  const displayFiles = results.files.slice(0, 6);

  return (
    <div className={styles.pageContainer}>
      {/* ─── Header ─── */}
      <div className={styles.headerSection}>
        <div className={styles.iconWrapper}>
          <Search size={26} strokeWidth={1.6} />
        </div>
        <h1 className={styles.title}>Search across your drive</h1>
        <p className={styles.subtitle}>
          Find files by name, content, or meaning. Toggle <strong>Smart</strong>{' '}
          for natural-language queries.
        </p>
      </div>

      <div className={styles.searchBoxContainer}>
        {/* ─── Sticky Search Bar ─── */}
        <div className={styles.inputWrapper}>
          <Search size={18} strokeWidth={1.6} className={styles.searchIcon} />
          <input
            type='text'
            aria-label='Search across your drive'
            placeholder='Try "compliance risks in Q3"…'
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            className={styles.searchInput}
          />

          {isSearching && <span className={styles.loader}>Searching...</span>}

          {!isSearching && (
            <>
              <span className={styles.smartBadge}>
                <Sparkles size={10} strokeWidth={1.6} /> Smart
              </span>
              <Switch checked={isSmartMode} onCheckedChange={setIsSmartMode} />
            </>
          )}
        </div>

        <div className={styles.contentArea}>
          {/* ─── IDLE STATE: Recent & Suggested ─── */}
          {isIdle && (
            <>
              {recentSearches.length > 0 && (
                <>
                  <div className={styles.sectionTitle}>Recent searches</div>
                  {recentSearches.map((term) => (
                    <Button
                      type='button'
                      key={term}
                      className={styles.resultItem}
                      onClick={() => handleSuggestionClick(term)}
                    >
                      <History
                        size={13}
                        strokeWidth={1.6}
                        className={styles.searchIcon}
                      />
                      <span className={styles.resultText}>{term}</span>
                      <ChevronRight
                        size={14}
                        strokeWidth={1.6}
                        className={styles.searchIcon}
                      />
                    </Button>
                  ))}
                </>
              )}

              <div className={styles.suggestionsWrapper}>
                <span className={styles.suggestionLabel}>Suggested:</span>
                {SUGGESTED_SEARCHES.map((suggestion) => (
                  <Button
                    type='button'
                    key={suggestion}
                    className={styles.suggestionChip}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </>
          )}

          {/* ─── ACTIVE STATE: Search Results ─── */}
          {!isIdle && (
            <div className={styles.resultsDropdown}>
              {/* Folders Section */}
              {displayFolders.length > 0 && (
                <div className={styles.resultGroup}>
                  <div className={styles.sectionTitle}>Folders</div>
                  {displayFolders.map((folder) => (
                    <Button
                      type='button'
                      key={folder.id}
                      className={styles.resultItem}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (
                          target.closest('button') ||
                          target.closest('[role="dialog"]') ||
                          target.closest('[data-slot="dialog-content"]')
                        ) {
                          return;
                        }
                        saveRecentSearch(activeQuery);
                        router.push(
                          `/my-drive/folder?folderId=${encrypt(String(folder.id))}&folderName=${folder.name}`,
                        );
                      }}
                    >
                      <div className={styles.info}>
                        <Folder size={14} className={styles.searchIcon} />
                        <span className={styles.folderName}>{folder.name}</span>
                      </div>
                      <FolderMenu folder={folder} />
                    </Button>
                  ))}
                </div>
              )}

              {/* Files Section */}
              {displayFiles.length > 0 && (
                <div className={styles.resultGroup}>
                  <div className={styles.sectionTitle}>Files</div>
                  {displayFiles.map((file: UploadedFile) => (
                    <Button
                      type='button'
                      key={file.id}
                      className={styles.resultItem}
                      onClick={() => {
                        saveRecentSearch(activeQuery);
                      }}
                    >
                      <div className={styles.info}>
                        <File size={14} className={styles.searchIcon} />
                        <span className={styles.resultText}>{file.name}</span>
                      </div>
                      <FileMenu file={file} />
                    </Button>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isSearching &&
                displayFiles.length === 0 &&
                displayFolders.length === 0 && (
                  <div className={styles.noResults}>
                    No files or folders found matching &quot;
                    {activeQuery}&quot;
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
