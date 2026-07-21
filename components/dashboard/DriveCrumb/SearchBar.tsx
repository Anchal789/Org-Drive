'use client';

import {
  ChevronRight,
  File,
  Folder,
  History,
  Search,
  Settings,
  Sparkle,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Badge from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFileSearch } from '@/hooks/use-file-search';
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
  const comboboxRef = useRef<HTMLDivElement>(null);

  const {
    searchTerm,
    activeQuery,
    results,
    isSearching,
    recentSearches,
    saveRecentSearch,
    handleInputChange: onInputChange,
    handleSuggestionClick,
    handleInputKeyDown,
    clearSearch,
  } = useFileSearch();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsOpen(true);
    onInputChange(e);
  };

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
        {searchTerm ? (
          <Button
            type='button'
            onClick={clearSearch}
            className={styles.clearBtn}
            aria-label='Clear search'
          >
            <X size={14} />
          </Button>
        ) : (
          <>
            <Badge tone='violet' className={styles.badge}>
              <Sparkle size={9} /> Smart
            </Badge>
            <Settings size={14} className={styles.icon} />
          </>
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
                      <Button
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
                      </Button>
                    ))}
                  </div>
                )}

                <div>
                  <h3 className={styles.sectionTitle}>Suggested</h3>
                  <div className={styles.chipGroup}>
                    {SUGGESTED_SEARCHES.map((sug) => (
                      <Button
                        type='button'
                        key={sug}
                        onClick={() => handleSuggestionClick(sug)}
                        className={styles.chip}
                      >
                        {sug}
                      </Button>
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
                      <Button
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
                            `/my-drive/folder?folderId=${folder.id}&folderName=${encodeURIComponent(folder.name)}`,
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
                      </Button>
                    ))}
                  </div>
                )}

                {/* Files */}
                {results?.files?.length > 0 && (
                  <div>
                    <h3 className={styles.sectionTitle}>Files</h3>
                    {results?.files?.map((file) => (
                      <Button
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
                      </Button>
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
