import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type NotificationType = "appraisal_cycle" | "reminder" | "manager_assigned";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  timestamp: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: "n1",
    type: "appraisal_cycle",
    title: "Appraisal cycle 2026 opened by HR",
    timestamp: "2 days ago",
    read: false,
  },
  {
    id: "n2",
    type: "reminder",
    title: "Reminder: Self-assessment due in 18 days",
    timestamp: "Today, 9:00 AM",
    read: false,
  },
  {
    id: "n3",
    type: "manager_assigned",
    title: "Manager Priya Sharma assigned to your review",
    timestamp: "1 week ago",
    read: true,
  },
  {
    id: "n4",
    type: "reminder",
    title: "Goal check-in scheduled for next week",
    timestamp: "3 days ago",
    read: false,
  },
  {
    id: "n5",
    type: "appraisal_cycle",
    title: "Mid-year review template updated by HR",
    timestamp: "5 days ago",
    read: false,
  },
];

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead }}
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