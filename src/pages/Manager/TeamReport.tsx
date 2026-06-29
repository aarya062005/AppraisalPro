import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

// ─── API Calls ───────────────────────────────────────
const fetchAppraisalsByManager = async (managerId: number) => {
  const response = await axiosInstance.get(`/api/appraisals/manager/${managerId}`);
  return response.data;
};

const fetchGoalsByEmployee = async (employeeId: number) => {
  const response = await axiosInstance.get(`/api/goals/employee/${employeeId}`);
  return response.data;
};

const fetchTeamByManager = async (managerId: number) => {
  const response = await axiosInstance.get(`/api/users/manager/${managerId}`);
  return response.data;
};

// ─── Status Styles ───────────────────────────────────
const statusStyles: Record<string, string> = {
  SELF_SUBMITTED:   "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  PENDING:          "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  ACKNOWLEDGED:     "bg-green-500/10 text-green-400 border border-green-500/20",
  APPROVED:         "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  EMPLOYEE_DRAFT:   "bg-[#2a2d3a] text-[#6b7280] border border-white/[0.06]",
  MANAGER_DRAFT:    "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  MANAGER_REVIEWED: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
};

const statusLabel: Record<string, string> = {
  SELF_SUBMITTED:   "Self Submitted",
  PENDING:          "Pending",
  ACKNOWLEDGED:     "Acknowledged",
  APPROVED:         "Approved",
  EMPLOYEE_DRAFT:   "Draft",
  MANAGER_DRAFT:    "Manager Draft",
  MANAGER_REVIEWED: "Manager Reviewed",
};

// ─── Star Rating ─────────────────────────────────────
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} width="13" height="13" viewBox="0 0 24 24"
        fill={i <= rating ? "#a855f7" : "none"}
        stroke={i <= rating ? "#a855f7" : "#374151"}
        strokeWidth="1.5"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

// ─── Main Component ──────────────────────────────────
export default function TeamReport() {
  const managerId = Number(localStorage.getItem("userId"));

  const [cycles, setCycles] = useState<string[]>([]);
  const [selectedCycle, setSelectedCycle] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [reportRows, setReportRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [allAppraisals, setAllAppraisals] = useState<any[]>([]);
  const [teamMap, setTeamMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!managerId) return;
    loadInitialData();
  }, [managerId]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [appraisals, team] = await Promise.all([
        fetchAppraisalsByManager(managerId),
        fetchTeamByManager(managerId),
      ]);

      setAllAppraisals(appraisals || []);

      // Build team map: email → user
      const map: Record<string, any> = {};
      (team || []).forEach((u: any) => {
        map[u.email] = u;
      });
      setTeamMap(map);

      // Extract unique cycle names
      const uniqueCycles = [...new Set((appraisals || []).map((a: any) => a.cycleName))] as string[];
      setCycles(uniqueCycles);
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCycleSelect = async (cycle: string) => {
    setSelectedCycle(cycle);
    setDropdownOpen(false);
    setSearch("");
    setReportLoading(true);

    try {
      const cycleAppraisals = allAppraisals.filter((a: any) => a.cycleName === cycle);

      const rows = await Promise.all(
        cycleAppraisals.map(async (a: any) => {
          const user = teamMap[a.employeeEmail];
          let goals = { completed: 0, total: 0 };
          try {
            if (user?.userId) {
              const goalsData = await fetchGoalsByEmployee(user.userId);
              goals = {
                total: goalsData?.length || 0,
                completed: (goalsData || []).filter((g: any) => g.status === "COMPLETED").length,
              };
            }
          } catch {}
          return {
            employeeEmail: a.employeeEmail,
            name: user ? `${user.firstName} ${user.lastName}` : a.employeeEmail,
            jobTitle: user?.designation || "—",
            appraisalStatus: a.appraisalStatus,
            selfRating: a.selfRating || 0,      // ✅ real data
            myRating: a.managerRating || 0,      // ✅ real data
            goals,
          };
        })
      );
      setReportRows(rows);
    } catch (e) {
      console.error("Failed to load report", e);
    } finally {
      setReportLoading(false);
    }
  };

  const avgRating = (() => {
    const rated = reportRows.filter((m) => m.myRating > 0);
    return rated.length > 0
      ? (rated.reduce((sum, m) => sum + m.myRating, 0) / rated.length).toFixed(1)
      : "—";
  })();

  const filteredCycles = cycles.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <p className="text-[#6b7280] text-sm">Loading report data...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold tracking-tight">Team Report</h1>
        <p className="text-[#6b7280] text-sm mt-1">Performance overview for your team by cycle</p>
      </div>

      {/* Cycle Selector */}
      <div className="mb-6 relative w-64">
        <label className="text-[#6b7280] text-xs uppercase tracking-widest mb-2 block">Select Cycle</label>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full bg-[#1e2029] border border-white/[0.06] rounded-xl px-4 py-2.5 text-left text-sm flex items-center justify-between transition-all hover:border-purple-500/30"
        >
          <span className={selectedCycle ? "text-white" : "text-[#4b5563]"}>
            {selectedCycle || "Choose a cycle..."}
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute top-full mt-1 w-full bg-[#1e2029] border border-white/[0.08] rounded-xl overflow-hidden z-10 shadow-xl">
            <div className="px-3 py-2 border-b border-white/[0.06]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cycles..."
                className="w-full bg-[#16181f] text-white text-sm px-3 py-1.5 rounded-lg outline-none placeholder-[#4b5563]"
              />
            </div>
            {filteredCycles.length === 0 ? (
              <p className="text-[#6b7280] text-xs text-center py-3">No cycles found</p>
            ) : (
              filteredCycles.map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => handleCycleSelect(cycle)}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#9ca3af] hover:bg-white/[0.04] hover:text-white transition-all"
                >
                  {cycle}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {!selectedCycle ? (
        <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-16 text-center">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mx-auto mb-3 opacity-30">
            <rect x="4" y="20" width="8" height="16" rx="2" fill="#6b7280"/>
            <rect x="16" y="12" width="8" height="24" rx="2" fill="#6b7280"/>
            <rect x="28" y="4" width="8" height="32" rx="2" fill="#6b7280"/>
          </svg>
          <p className="text-[#6b7280] text-sm">Select a cycle to view your team report</p>
        </div>
      ) : reportLoading ? (
        <div className="w-full flex items-center justify-center py-20">
          <p className="text-[#6b7280] text-sm">Loading cycle data...</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">Team Members</p>
                <p className="text-white text-3xl font-bold">{reportRows.length}</p>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="8" cy="7" r="4" stroke="#6b7280" strokeWidth="1.5"/>
                <circle cx="16" cy="7" r="4" stroke="#6b7280" strokeWidth="1.5"/>
                <path d="M2 21c0-4 2.686-7 6-7s6 3 6 7" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M16 21c0-4 2.686-7 6-7" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">Avg Rating</p>
                <p className="text-white text-3xl font-bold">{avgRating}</p>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#6b7280" strokeWidth="1.5"/>
              </svg>
            </div>
            <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">Cycle</p>
                <p className="text-white text-3xl font-bold">{selectedCycle}</p>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="#6b7280" strokeWidth="1.5"/>
                <path d="M7 14l3-4 3 3 4-5" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Team Members Table */}
          <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <p className="text-white text-sm font-semibold">Team Members</p>
            </div>
            <div className="grid grid-cols-[1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_1fr] px-5 py-3 border-b border-white/[0.06]">
              {["Employee", "Job Title", "Status", "Self Rating", "My Rating", "Goals"].map((h) => (
                <span key={h} className="text-[#6b7280] text-xs uppercase tracking-widest font-medium">{h}</span>
              ))}
            </div>
            {reportRows.length === 0 ? (
              <p className="text-[#6b7280] text-xs text-center py-6">No data found for this cycle</p>
            ) : (
              reportRows.map((member, index) => (
                <div
                  key={member.employeeEmail}
                  className={`grid grid-cols-[1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_1fr] px-5 py-4 items-center hover:bg-white/[0.02] transition-all ${
                    index !== reportRows.length - 1 ? "border-b border-white/[0.04]" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold">
                      {member.name[0]?.toUpperCase() || "?"}
                    </div>
                    <span className="text-white text-sm font-medium">{member.name}</span>
                  </div>
                  <span className="text-[#6b7280] text-sm">{member.jobTitle}</span>
                  <span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${statusStyles[member.appraisalStatus]}`}>
                      {statusLabel[member.appraisalStatus] || member.appraisalStatus}
                    </span>
                  </span>
                  <span>
                    {member.selfRating > 0
                      ? <StarRating rating={member.selfRating} />
                      : <span className="text-[#4b5563] text-xs">—</span>}
                  </span>
                  <span>
                    {member.myRating > 0
                      ? <StarRating rating={member.myRating} />
                      : <span className="text-[#4b5563] text-xs">—</span>}
                  </span>
                  <span className="text-[#6b7280] text-xs">
                    <span className={member.goals.completed > 0 ? "text-green-400" : "text-[#6b7280]"}>
                      {member.goals.completed}
                    </span>
                    /{member.goals.total}
                  </span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}