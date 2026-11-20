import { create } from "zustand";

export interface NotificationState {
  message: string | null;
  visible: boolean;
  isVisible: boolean;
  showNotification: (message: string) => void;
  hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  message: null,
  visible: false,
  isVisible: false,
  showNotification: (message: string) =>
    set({ message, visible: true, isVisible: true }),
  hideNotification: () =>
    set({ message: null, visible: false, isVisible: false }),
}));
