"use client";

import { useState, useEffect } from "react";
import {
  Search,
  File,
  Folder,
  History,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { fetchData } from "@/lib/api-fn";
import { UploadedFile, UploadedFolder } from "@/types/files";
import { Switch } from "@/components/ui/switch";
import styles from "./SmartSearch.module.scss";
import FolderMenu from "../dashboard/FolderSection/FolderMenu/FolderMenu";
import FileMenu from "../dashboard/FileSection/FileMenu";
import { useRouter } from "next/navigation";
import { encrypt } from "@/lib/utils";

const SUGGESTED_SEARCHES = [
  "files I shared last week",
  "PDFs in Engineering",
  "drafts",
  "contracts expiring soon",
];

export default function SmartSearchPage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [isSmartMode, setIsSmartMode] = useState(true);
  const [results, setResults] = useState<{
    files: Array<UploadedFile>;
    folders: Array<UploadedFolder>;
  }>({ files: [], folders: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // ─── 1. LOAD RECENT SEARCHES ON MOUNT ───
  useEffect(() => {
    const savedSearches = localStorage.getItem("smart_drive_recent_searches");
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  // ─── 2. SAVE SEARCH FUNCTION (KEEPS TOP 3) ───
  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      // Remove the term if it already exists to prevent duplicates
      const filtered = prev.filter(
        (t) => t.toLowerCase() !== trimmed.toLowerCase(),
      );
      // Prepend the new term and slice to keep only the top 3
      const updated = [trimmed, ...filtered].slice(0, 3);

      localStorage.setItem(
        "smart_drive_recent_searches",
        JSON.stringify(updated),
      );
      return updated;
    });
  };

  // ─── 3. PERFORM SEARCH API CALL ───
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm.trim()) {
        setResults({ files: [], folders: [] });
        return;
      }

      setIsSearching(true);

      const response = await fetchData<{
        files: Array<UploadedFile>;
        folders: Array<UploadedFolder>;
      }>({
        url: `/api/search?q=${encodeURIComponent(debouncedSearchTerm)}`,
      });

      if (response.success && response.data) {
        setResults(response.data);
      }

      setIsSearching(false);
    };

    performSearch();
  }, [debouncedSearchTerm]);

  // ─── HANDLERS ───
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    saveRecentSearch(suggestion);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveRecentSearch(searchTerm);
    }
  };

  const isIdle = !debouncedSearchTerm.trim();
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
          Find files by name, content, or meaning. Toggle <strong>Smart</strong>{" "}
          for natural-language queries.
        </p>
      </div>

      <div className={styles.searchBoxContainer}>
        {/* ─── Sticky Search Bar ─── */}
        <div className={styles.inputWrapper}>
          <Search size={18} strokeWidth={1.6} className={styles.searchIcon} />
          <input
            type="text"
            placeholder='Try "compliance risks in Q3"…'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className={styles.searchInput}
            autoFocus
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
                  {recentSearches.map((term, index) => (
                    <div
                      key={`recent-${index}`}
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
                    </div>
                  ))}
                </>
              )}

              <div className={styles.suggestionsWrapper}>
                <span className={styles.suggestionLabel}>Suggested:</span>
                {SUGGESTED_SEARCHES.map((suggestion) => (
                  <button
                    key={suggestion}
                    className={styles.suggestionChip}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
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
                    <div
                      key={folder.id}
                      className={styles.resultItem}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (
                          target.closest("button") ||
                          target.closest('[role="dialog"]') ||
                          target.closest('[data-slot="dialog-content"]')
                        ) {
                          return;
                        }
                        saveRecentSearch(debouncedSearchTerm);
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
                    </div>
                  ))}
                </div>
              )}

              {/* Files Section */}
              {displayFiles.length > 0 && (
                <div className={styles.resultGroup}>
                  <div className={styles.sectionTitle}>Files</div>
                  {displayFiles.map((file: any) => (
                    <div
                      key={file.id}
                      className={styles.resultItem}
                      onClick={() => {
                        saveRecentSearch(debouncedSearchTerm);
                      }}
                    >
                      <div className={styles.info}>
                        <File size={14} className={styles.searchIcon} />
                        <span className={styles.resultText}>{file.name}</span>
                        {file.isShared && (
                          <span className={styles.tag}>Shared</span>
                        )}
                      </div>
                      <FileMenu file={file} />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isSearching &&
                displayFiles.length === 0 &&
                displayFolders.length === 0 && (
                  <div className={styles.noResults}>
                    No files or folders found matching &quot;
                    {debouncedSearchTerm}&quot;
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
