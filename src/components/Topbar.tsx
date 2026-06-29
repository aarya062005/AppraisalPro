import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../context/NotificationsContext";
import NotificationsDropdown from "./NotificationsDropdown";

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
    <path d="M9 1.5a5.5 5.5 0 00-5.5 5.5v3l-1.5 2.5h14L14.5 10V7A5.5 5.5 0 009 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M7 13.5a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export default function Topbar() {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-end gap-4 pb-6">
      {/* Bell icon */}
      <div className="relative" ref={wrapperRef}>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-white/[0.06] bg-[#1e2029] text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-all"
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 z-50">
            <NotificationsDropdown onClose={() => setOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
}