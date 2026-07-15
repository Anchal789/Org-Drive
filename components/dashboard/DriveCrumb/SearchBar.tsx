'use client';

import { ChevronRight, File, Folder, History, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Badge from '@/components/ui/badge';
import { fetchData } from '@/lib/api-fn';
import { encrypt } from '@/lib/utils';
import type { UploadedFile, UploadedFolder } from '@/types/files';
import FileMenu from '../FileSection/FileMenu';
import FolderMenu from '../FolderSection/FolderMenu/FolderMenu';
import styles from './SearchBar.module.scss';

const SUGGESTED_SEARCHES = [
  'files I shared last week',
  'PDFs in Engineering',
  'drafts',
  'contracts expiring soon',
];

export default function SearchBar({
  variant = 'mobile',
}: {
  variant?: 'desktop' | 'mobile';
}) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [results, setResults] = useState<{
    files: Array<UploadedFile>;
    folders: Array<UploadedFolder>;
  }>({ files: [], folders: [] });
  const [isSearching, setIsSearching] = useState(false);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const comboboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        comboboxRef.current &&
        !comboboxRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const savedSearches = window.localStorage.getItem(
      'smart_drive_recent_searches:v1',
    );
    if (savedSearches) {
      try {
        return JSON.parse(savedSearches) as string[];
      } catch {
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

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const filtered = recentSearches.filter(
      (t) => t.toLowerCase() !== trimmed.toLowerCase(),
    );
    setRecentSearches([trimmed, ...filtered].slice(0, 3));
  };

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
    } catch (error) {
      void error;
    }
    setIsSearching(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    setIsOpen(true);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setActiveQuery(val);
      performSearch(val);
    }, 300);
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

  const isIdle = !activeQuery.trim();

  return (
    <div
      ref={comboboxRef}
      className={`${styles.container} ${
        variant === 'desktop' ? styles.desktopContainer : styles.mobileContainer
      }`}
    >
      <div
        className={`${styles.searchBox} ${
          variant === 'desktop' ? styles.desktopSearchBox : ''
        }`}
      >
        <Search size={14} strokeWidth={1.6} className={styles.searchIcon} />

        <input
          type='text'
          placeholder={
            variant === 'desktop' ? 'Search in Org Drive' : 'Search files'
          }
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
          className={styles.searchInput}
        />

        {searchTerm && (
          <button
            type='button'
            onClick={clearSearch}
            className={styles.clearBtn}
            aria-label='Clear search'
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ─── DROPDOWN OVERLAY ─── */}
      {isOpen && (
        <div className={styles.dropdown}>
          {isSearching && (
            <div className={styles.loadingText}>Searching your drive...</div>
          )}

          <div className={styles.scrollArea}>
            {/* IDLE STATE */}
            {!isSearching && isIdle && (
              <>
                {recentSearches.length > 0 && (
                  <div>
                    <h3 className={styles.sectionTitle}>Recent</h3>
                    {recentSearches.map((term) => (
                      <button
                        type='button'
                        key={term}
                        onClick={() => handleSuggestionClick(term)}
                        className={styles.listItem}
                      >
                        <span className={styles.itemInfo}>
                          <History size={14} className={styles.searchIcon} />
                          <span className={styles.truncate}>{term}</span>
                        </span>
                        <ChevronRight size={14} className={styles.searchIcon} />
                      </button>
                    ))}
                  </div>
                )}

                <div>
                  <h3 className={styles.sectionTitle}>Suggested</h3>
                  <div className={styles.chipGroup}>
                    {SUGGESTED_SEARCHES.map((sug) => (
                      <button
                        type='button'
                        key={sug}
                        onClick={() => handleSuggestionClick(sug)}
                        className={styles.chip}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ACTIVE STATE */}
            {!isSearching && !isIdle && (
              <>
                {/* Folders */}
                {results?.folders?.length > 0 && (
                  <div>
                    <h3 className={styles.sectionTitle}>Folders</h3>
                    {results?.folders?.map((folder) => (
                      <button
                        type='button'
                        key={folder.id}
                        onClick={(e) => {
                          if (
                            (e.target as HTMLElement).closest('button')?.dataset
                              .menu
                          )
                            return;
                          saveRecentSearch(activeQuery);
                          router.push(
                            `/my-drive/folder?folderId=${encrypt(String(folder.id))}&folderName=${folder.name}`,
                          );
                          setIsOpen(false);
                        }}
                        className={styles.listItem}
                      >
                        <div className={styles.itemInfo}>
                          <Folder
                            size={16}
                            className={styles.folderIconBlue}
                            fill='currentColor'
                            fillOpacity={0.2}
                          />
                          <span className={styles.truncate}>{folder.name}</span>
                        </div>
                        <div data-menu='true'>
                          <FolderMenu folder={folder} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Files */}
                {results?.files?.length > 0 && (
                  <div>
                    <h3 className={styles.sectionTitle}>Files</h3>
                    {results?.files?.map((file) => (
                      <button
                        type='button'
                        key={file.id}
                        onClick={(e) => {
                          if (
                            (e.target as HTMLElement).closest('button')?.dataset
                              .menu
                          )
                            return;
                          saveRecentSearch(activeQuery);
                          setIsOpen(false);
                          // Handle file click/preview here
                        }}
                        className={styles.listItem}
                      >
                        <div className={styles.itemInfo}>
                          <File size={16} className={styles.searchIcon} />
                          <div className={styles.itemTextGroup}>
                            <span className={styles.truncate}>{file.name}</span>
                          </div>
                        </div>
                        {file.isDeleted ? (
                          <Badge tone='red'>Deleted</Badge>
                        ) : (
                          <div data-menu='true'>
                            <FileMenu file={file} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {results?.files?.length === 0 &&
                  results?.folders?.length === 0 && (
                    <div className={styles.noResults}>
                      No results found for &quot;{activeQuery}&quot;
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
