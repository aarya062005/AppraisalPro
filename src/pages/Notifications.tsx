import { useNotifications } from "../context/NotificationsContext";
import type { NotificationType } from "../context/NotificationsContext";

const dotColor: Record<NotificationType, string> = {
  appraisal_cycle: "bg-blue-400",
  reminder: "bg-amber-400",
  manager_assigned: "bg-purple-400",
};

const typeLabel: Record<NotificationType, string> = {
  appraisal_cycle: "Appraisal Cycle",
  reminder: "Reminder",
  manager_assigned: "Manager Update",
};

export default function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-[#6b7280] text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl overflow-hidden">
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => markAsRead(n.id)}
            className="w-full flex items-start gap-4 px-5 py-4 text-left border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.03] transition-colors"
          >
            <span
              className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                n.read ? "bg-transparent border border-white/20" : dotColor[n.type]
              }`}
            />
            <span className="flex flex-col gap-1 flex-1">
              <span className="flex items-center gap-2">
                <span className={`text-sm ${n.read ? "text-[#9ca3af]" : "text-white font-medium"}`}>
                  {n.title}
                </span>
                {!n.read && (
                  <span className="bg-purple-500/15 text-purple-300 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    New
                  </span>
                )}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[#6b7280] text-xs">{typeLabel[n.type]}</span>
                <span className="text-[#6b7280] text-xs">·</span>
                <span className="text-[#6b7280] text-xs">{n.timestamp}</span>
              </span>
            </span>
          </button>
        ))}

        {notifications.length === 0 && (
          <div className="px-5 py-10 text-center text-[#6b7280] text-sm">
            No notifications yet.
          </div>
        )}
      </div>
    </div>
  );
}