import { useEffect } from "react";
import { useNotificationStore } from "@/store/notificationStore";

export const Toast = () => {
  const message = useNotificationStore((state) => state.message);
  const isVisible = useNotificationStore((state) => state.isVisible);
  const hideNotification = useNotificationStore(
    (state) => state.hideNotification
  );

  useEffect(() => {
    if (!isVisible) return;
    const timer = window.setTimeout(() => {
      hideNotification();
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [isVisible, message, hideNotification]);

  if (!isVisible || !message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-slate-900 text-white border-slate-700 text-xs font-medium max-w-sm"
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={hideNotification}
        className="text-slate-400 hover:text-white font-bold cursor-pointer"
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
