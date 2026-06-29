import { NavLink, Link } from "react-router-dom";

const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const TeamIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1 15c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M11 15c0-2.761 2.239-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const GoalsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="9" cy="9" r="1" fill="currentColor"/>
  </svg>
);

const ReportIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 12l2.5-3 2.5 2 3-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AppraisalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 9h8M5 6h8M5 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="10" width="4" height="8" rx="1" fill="white" opacity="0.9"/>
    <rect x="8" y="6" width="4" height="12" rx="1" fill="white"/>
    <rect x="14" y="2" width="4" height="16" rx="1" fill="white" opacity="0.7"/>
  </svg>
);

const navItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/manager/dashboard" },
  { label: "My Team", icon: <TeamIcon />, path: "/manager/team" },
  { label: "Goals", icon: <GoalsIcon />, path: "/manager/goals" },
  { label: "Team Report", icon: <ReportIcon />, path: "/manager/team-report" },
  { label: "My Appraisals", icon: <AppraisalIcon />, path: "/manager/my-appraisals" },
  { label: "My Goals", icon: <GoalsIcon />, path: "/manager/my-goals" },
];

export default function ManagerSidebar() {
  return (
    <aside className="w-52 min-h-screen bg-[#1a1c24] border-r border-white/[0.06] flex flex-col py-6 px-3">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-md shadow-purple-900/40 flex-shrink-0">
          <BarChartIcon />
        </div>
        <span className="text-white font-semibold text-sm tracking-tight">
          AppraisalPro
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
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
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User avatar at bottom — links to the manager profile page */}
      <div className="px-3 mt-6">
        <Link
          to="/manager/profile"
          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            D
          </div>
          <div className="flex flex-col">
            <span className="text-white text-xs font-medium">Doremon</span>
            <span className="text-[#6b7280] text-[10px]">Manager</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}