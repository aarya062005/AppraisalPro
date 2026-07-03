import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import axiosInstance from "../api/axiosInstance";

// Mirrors the backend's NotificationType enum (entity/enums/NotificationType.java)
export type NotificationType =
  | "CYCLE_STARTED"
  | "APPRAISAL_DUE"
  | "SELF_ASSESSMENT_SUBMITTED"
  | "MANAGER_REVIEW_DONE"
  | "APPRAISAL_APPROVED"
  | "FEEDBACK_RECEIVED"
  | "GOAL_ASSIGNED"
  | "GOAL_SUBMITTED"
  | "GOAL_CONFIRMED"
  | "GENERAL";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  timestamp: string;
  read: boolean;
}

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refresh: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

const formatTimestamp = (iso: string) => {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `Today, ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
   const rawId = localStorage.getItem("userId");
const userId = rawId ? Number(rawId) : null;
   const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
const token = localStorage.getItem("token");
if (!userId || !isAuthenticated || !token) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    try {
      const res = await axiosInstance.get(`/api/notifications/user/${userId}`);
      const mapped: Notification[] = res.data.map((n: any) => ({
        id: String(n.notificationId),
        type: n.type as NotificationType,
        title: n.title,
        timestamp: formatTimestamp(n.createdAt),
        read: Boolean(n.isRead),
      }));
      setNotifications(mapped);
    } catch {
      // Fail quietly here; notifications are a non-critical feature and
      // shouldn't block the rest of the app from rendering.
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 60s.
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await axiosInstance.patch(`/api/notifications/${id}/read`);
    } catch {
      // Revert on failure
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await axiosInstance.patch(`/api/notifications/user/${userId}/read-all`);
    } catch {
      fetchNotifications();
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, loading, markAsRead, markAllAsRead, refresh: fetchNotifications }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return ctx;
}