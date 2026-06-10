import { AuthStateStore, DragDropStore } from "@/types/store";
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
