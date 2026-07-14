import { NavLink, Link } from "react-router-dom";
import { useNotifications } from "../context/NotificationsContext";

const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const AppraisalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 9h8M5 6h8M5 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const GoalsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="9" cy="9" r="1" fill="currentColor"/>
  </svg>
);

const NotificationsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 1.5a5.5 5.5 0 00-5.5 5.5v3l-1.5 2.5h14L14.5 10V7A5.5 5.5 0 009 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M7 13.5a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const ProfileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2 16c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="10" width="4" height="8" rx="1" fill="white" opacity="0.9"/>
    <rect x="8" y="6" width="4" height="12" rx="1" fill="white"/>
    <rect x="14" y="2" width="4" height="16" rx="1" fill="white" opacity="0.7"/>
  </svg>
);

export default function Sidebar() {
  const { unreadCount } = useNotifications();
  const firstName = localStorage.getItem("firstName") || "Employee";

  const navItems = [
    { label: "Dashboard",      icon: <DashboardIcon />,     path: "/dashboard" },
    { label: "Appraisal Guide",icon: <AppraisalIcon />,     path: "/appraisal-guide" },
    { label: "My Appraisal",   icon: <AppraisalIcon />,     path: "/my-appraisal" },
    { label: "Goals",          icon: <GoalsIcon />,         path: "/goals" },
    { label: "Notifications",  icon: <NotificationsIcon />, path: "/notifications", badge: unreadCount },
    { label: "Profile",        icon: <ProfileIcon />,       path: "/profile" },
  ];

  return (
    <aside className="w-52 min-h-screen bg-[#1a1c24] border-r border-white/[0.06] flex flex-col py-6 px-3">
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-md shadow-purple-900/40 flex-shrink-0">
          <BarChartIcon />
        </div>
        <span className="text-white font-semibold text-sm tracking-tight">
          AppraisalPro
        </span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative
              ${isActive
                ? "bg-purple-600/20 text-purple-300"
                : "text-[#6b7280] hover:text-[#9ca3af] hover:bg-white/[0.04]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? "text-purple-400" : ""}>{item.icon}</span>
                <span>{item.label}</span>
                {!!item.badge && (
                  <span className="ml-auto bg-purple-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Clickable user section → goes to profile */}
      <div className="px-3 mt-6">
        <Link
          to="/profile"
          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.04] transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {firstName[0].toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-white text-xs font-medium">{firstName}</span>
            <span className="text-[#6b7280] text-[10px]">Employee</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}