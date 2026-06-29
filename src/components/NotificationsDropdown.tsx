import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationsContext";
import type { NotificationType } from "../context/NotificationsContext";

const dotColor: Record<NotificationType, string> = {
  appraisal_cycle: "bg-blue-400",
  reminder: "bg-amber-400",
  manager_assigned: "bg-purple-400",
};

interface NotificationsDropdownProps {
  onClose?: () => void;
}

export default function NotificationsDropdown({ onClose }: NotificationsDropdownProps) {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();

  const recent = notifications.slice(0, 3);

  return (
    <div className="w-80 bg-[#1e2029] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
        <p className="text-white text-sm font-semibold">Notifications</p>
        {unreadCount > 0 && (
          <span className="bg-purple-500/15 text-purple-300 text-xs font-medium px-2.5 py-1 rounded-full">
            {unreadCount} new
          </span>
        )}
      </div>

      <div className="flex flex-col">
        {recent.map((n) => (
          <button
            key={n.id}
            onClick={() => markAsRead(n.id)}
            className="flex items-start gap-3 px-4 py-3 text-left border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.03] transition-colors"
          >
            <span
              className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                n.read ? "bg-transparent border border-white/20" : dotColor[n.type]
              }`}
            />
            <span className="flex flex-col gap-0.5">
              <span className={`text-sm ${n.read ? "text-[#9ca3af]" : "text-white font-medium"}`}>
                {n.title}
              </span>
              <span className="text-[#6b7280] text-xs">{n.timestamp}</span>
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={() => {
          onClose?.();
          navigate("/notifications");
        }}
        className="w-full text-center text-purple-400 text-sm font-medium py-3 hover:bg-white/[0.03] transition-colors border-t border-white/[0.06]"
      >
        View all notifications
      </button>
    </div>
  );
}