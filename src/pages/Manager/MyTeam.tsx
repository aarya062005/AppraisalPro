import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

// ─── API Call ────────────────────────────────────────
const fetchTeamByManager = async (managerId: number) => {
  const response = await axiosInstance.get(`/api/users/manager/${managerId}`);
  return response.data;
};

// ─── Icons ───────────────────────────────────────────
const DesignationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="1" width="12" height="12" rx="2" stroke="#6b7280" strokeWidth="1.2"/>
    <path d="M4 7h6M4 5h6M4 9h3" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const DepartmentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1L1 4v6l6 3 6-3V4L7 1z" stroke="#6b7280" strokeWidth="1.2" strokeLinejoin="round"/>
  </svg>
);

const EmailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="#6b7280" strokeWidth="1.2"/>
    <path d="M1 5l6 4 6-4" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

// ─── Main Component ──────────────────────────────────
export default function MyTeam() {
  const [teammates, setTeammates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const managerId = Number(localStorage.getItem("userId"));
    if (!managerId) return;

    fetchTeamByManager(managerId)
      .then((data) => {
        setTeammates(data || []);
      })
      .catch(() => setError("Failed to load team members"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <p className="text-[#6b7280] text-sm">Loading team...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold tracking-tight">My Team</h1>
        <p className="text-[#6b7280] text-sm mt-1">{teammates.length} direct reports</p>
      </div>

      {/* Team Cards Grid */}
      {teammates.length === 0 ? (
        <p className="text-[#6b7280] text-sm text-center py-10">No team members found</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {teammates.map((member) => (
            <div
              key={member.userId}
              className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-5 hover:border-purple-500/30 transition-all"
            >
              {/* Avatar + Name + Status */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {member.firstName?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">
                    {member.firstName} {member.lastName}
                  </p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    member.isActive
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    {member.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/[0.06] mb-4" />

              {/* Details */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <DesignationIcon />
                  <span className="text-[#9ca3af] text-xs">
                    {member.designation || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DepartmentIcon />
                  <span className="text-[#9ca3af] text-xs">
                    {member.deptName || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <EmailIcon />
                  <span className="text-[#9ca3af] text-xs truncate">
                    {member.email}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}