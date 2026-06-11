import { UploadItem } from "@/types/dashboard";
import { AuthStateStore, DragDropStore, UploadStore } from "@/types/store";
import { create } from "zustand";

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

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

const activeControllers = new Map<string, AbortController>();

export const useUploadStore = create<UploadStore>((set, get) => ({
  isWidgetVisible: false,
  uploads: {},
  pendingQueue: [],
  isProcessing: false,

  closeWidget: () => set({ isWidgetVisible: false, uploads: {} }),

  abortUpload: (fileName: string) => {
    const controller = activeControllers.get(fileName);
    if (controller) {
      controller.abort();
      activeControllers.delete(fileName);
    }

    set((state) => ({
      pendingQueue: state.pendingQueue.filter((f) => f.name !== fileName),
      uploads: {
        ...state.uploads,
        [fileName]: {
          ...state.uploads[fileName],
          state: "aborted",
        },
      },
    }));
  },

  startUploads: (files: File[]) => {
    const newUploads: Record<string, UploadItem> = {};
    files.forEach((file) => {
      newUploads[file.name] = {
        id: file.name,
        name: file.name,
        size: formatBytes(file.size),
        state: "queued",
        pct: 0,
        eta: undefined,
      };
    });

    set((state) => ({
      isWidgetVisible: true,
      uploads: { ...state.uploads, ...newUploads },
      pendingQueue: [...state.pendingQueue, ...files],
    }));

    get().processQueue();
  },

  processQueue: async () => {
    const state = get();

    if (state.isProcessing || state.pendingQueue.length === 0) return;

    set({ isProcessing: true });

    const file = state.pendingQueue[0];

    const controller = new AbortController();
    activeControllers.set(file.name, controller);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload-files", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!response.body) throw new Error("No stream available");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed) continue;

          let jsonString = trimmed;

          if (trimmed.startsWith("data:")) {
            jsonString = trimmed.replace("data:", "").trim();
          } else if (
            trimmed.startsWith("event:") ||
            trimmed.startsWith("id:") ||
            trimmed.startsWith("retry:")
          ) {
            continue;
          }

          try {
            const event = JSON.parse(jsonString);

            if (event.type === "file_start") {
              set((s) => ({
                uploads: {
                  ...s.uploads,
                  [event.name]: {
                    ...s.uploads[event.name],
                    state: "uploading",
                    pct: 0,
                    eta: event.eta,
                  },
                },
              }));
            } else if (event.type === "progress") {
              set((s) => ({
                uploads: {
                  ...s.uploads,
                  [event.name]: {
                    ...s.uploads[event.name],
                    pct: event.percentage,
                    eta: event.eta,
                  },
                },
              }));
            } else if (event.type === "complete") {
              set((s) => ({
                uploads: {
                  ...s.uploads,
                  [file.name]: {
                    ...s.uploads[file.name],
                    state: "done",
                    pct: 100,
                    eta: undefined,
                  },
                },
              }));
            } else if (event.type === "error") {
              throw new Error(event.message);
            }
          } catch (err) {}
        }
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        set((s) => ({
          uploads: {
            ...s.uploads,
            [file.name]: { ...s.uploads[file.name], state: "error" },
          },
        }));
      }
    } finally {
      activeControllers.delete(file.name);
      set((s) => ({
        pendingQueue: s.pendingQueue.slice(1),
        isProcessing: false,
      }));
      get().processQueue();
    }
  },
}));
