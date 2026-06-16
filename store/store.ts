import { toast } from 'sonner';
import { create } from 'zustand';
import type { UploadItem } from '@/types/dashboard';
import type {
  AuthStateStore,
  DragDropStore,
  FileLayoutStore,
  QueuedFile,
  UploadStore,
} from '@/types/store';

export const useAuthStore = create<AuthStateStore>((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
  clearAuth: () => set({ accessToken: null }),
}));

export const useDragDropStore = create<DragDropStore>((set) => ({
  isDragging: false,
  setIsDragging: (dragging) => set({ isDragging: dragging }),
  files: [],
  setFiles: (files) => set({ files }),
}));

export const useFileLayout = create<FileLayoutStore>((set) => ({
  fileLayout: 'grid',
  setFileLayout: (layout) => set({ fileLayout: layout }),
}));

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Number.parseFloat((bytes / k ** i).toFixed(1)) + ' ' + sizes[i];
}

const activeControllers = new Map<string, AbortController>();

export const useUploadStore = create<UploadStore>((set, get) => ({
  isWidgetVisible: false,
  uploads: {},
  pendingQueue: [],
  isProcessing: false,

  closeWidget: () => set({ isWidgetVisible: false, uploads: {} }),

  abortUpload: (uniqueId: string) => {
    const controller = activeControllers.get(uniqueId);
    if (controller) {
      controller.abort();
      activeControllers.delete(uniqueId);
    }

    set((state) => ({
      pendingQueue: state.pendingQueue.filter((f) => f.uniqueId !== uniqueId),
      uploads: {
        ...state.uploads,
        [uniqueId]: {
          ...state.uploads[uniqueId],
          state: 'aborted',
        },
      },
    }));
  },

  startUploads: (files: File[], folderName?: string, fileCount?: number) => {
    const newUploads: Record<string, UploadItem> = {};
    const newQueueItems: QueuedFile[] = [];
    files.forEach((file) => {
      const uniqueId = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      newUploads[uniqueId] = {
        id: uniqueId,
        name: file.name,
        size: formatBytes(file.size),
        state: 'queued',
        pct: 0,
        eta: undefined,
        folderName: folderName,
        rawSize: file.size,
        isFolderGroup: false,
      };
      newQueueItems.push({
        file,
        folderName,
        fileCount,
        isFolder: folderName !== undefined,
        uniqueId,
      });
    });

    set((state) => ({
      isWidgetVisible: true,
      uploads: { ...state.uploads, ...newUploads },
      pendingQueue: [...state.pendingQueue, ...newQueueItems],
    }));

    get().processQueue();
  },

  processQueue: async () => {
    const state = get();

    if (state.isProcessing || state.pendingQueue.length === 0) return;

    set({ isProcessing: true });

    const { file, folderName, fileCount, uniqueId } = state.pendingQueue[0];

    const controller = new AbortController();
    activeControllers.set(file.name, controller);

    const formData = new FormData();
    formData.append('file', file);

    if (folderName) {
      formData.append('folderName', folderName);
      formData.append('fileCount', String(fileCount || 0));
    }

    try {
      const response = await fetch('/api/file/upload-files', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.message || errorData?.error || 'Server connection failed.';
        throw new Error(errorMessage);
      }
      if (!response.body) throw new Error('No stream available');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed) continue;

          let jsonString = trimmed;

          if (trimmed.startsWith('data:')) {
            jsonString = trimmed.replace('data:', '').trim();
          } else if (
            trimmed.startsWith('event:') ||
            trimmed.startsWith('id:') ||
            trimmed.startsWith('retry:')
          ) {
            continue;
          }

          let streamError: Error | null = null;

          try {
            const event = JSON.parse(jsonString);

            if (event.type === 'file_start') {
              set((s) => ({
                uploads: {
                  ...s.uploads,
                  [uniqueId]: {
                    ...s.uploads[uniqueId],
                    state: 'uploading',
                    pct: 0,
                    eta: event.eta,
                  },
                },
              }));
            } else if (event.type === 'progress') {
              set((s) => ({
                uploads: {
                  ...s.uploads,
                  [uniqueId]: {
                    ...s.uploads[uniqueId],
                    pct: event.percentage,
                    eta: event.eta,
                  },
                },
              }));
            } else if (event.type === 'complete') {
              set((s) => ({
                uploads: {
                  ...s.uploads,
                  [uniqueId]: {
                    ...s.uploads[uniqueId],
                    state: 'done',
                    pct: 100,
                    eta: undefined,
                  },
                },
              }));
            } else if (event.type === 'error') {
              streamError = new Error(event.message);
            }
          } catch (err) {}
          if (streamError) {
            throw streamError;
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        set((s) => ({
          uploads: {
            ...s.uploads,
            [uniqueId]: { ...s.uploads[uniqueId], state: 'error' },
          },
        }));
        toast.error(`Upload failed: ${error.message}`);
      }
    } finally {
      activeControllers.delete(uniqueId);
      set((s) => ({
        pendingQueue: s.pendingQueue.slice(1),
        isProcessing: false,
      }));
      get().processQueue();
    }
  },
}));
