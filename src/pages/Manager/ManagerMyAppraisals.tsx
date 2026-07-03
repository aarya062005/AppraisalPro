import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAppraisalsByEmployee } from "../../api/authApi";

type AppraisalStatus =
  | "PENDING"
  | "EMPLOYEE_DRAFT"
  | "SELF_SUBMITTED"
  | "MANAGER_DRAFT"
  | "MANAGER_REVIEWED"
  | "APPROVED"
  | "ACKNOWLEDGED";

interface Appraisal {
  appraisalId: number;
  cycleName: string;
  cycleStartDate: string;
  cycleEndDate: string;
  cycleStatus: string;
  appraisalStatus: AppraisalStatus;
  employeeEmail: string;
  managerEmail: string;
}

const STATUS_LABELS: Record<AppraisalStatus, string> = {
  PENDING: "Pending",
  EMPLOYEE_DRAFT: "Draft",
  SELF_SUBMITTED: "Submitted",
  MANAGER_DRAFT: "Manager Draft",
  MANAGER_REVIEWED: "Manager Reviewed",
  APPROVED: "Approved",
  ACKNOWLEDGED: "Acknowledged",
};

const statusStyles: Record<AppraisalStatus, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  EMPLOYEE_DRAFT: "bg-[#2a2d3a] text-[#6b7280] border border-white/[0.06]",
  SELF_SUBMITTED: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  MANAGER_DRAFT: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  MANAGER_REVIEWED: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
  APPROVED: "bg-green-500/10 text-green-400 border border-green-500/20",
  ACKNOWLEDGED: "bg-green-500/10 text-green-400 border border-green-500/20",
};

const ALL_STATUSES = "All statuses";

export default function ManagerMyAppraisals() {
  const navigate = useNavigate();
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES);
  const [cycleFilter, setCycleFilter] = useState("All cycles");

  useEffect(() => {
    const managerUserId = Number(localStorage.getItem("userId"));
    if (!managerUserId) return;

    // A manager has their own appraisal history as an employee too — same
    // endpoint as the employee "My Appraisals" page, just keyed off this
    // manager's own userId.
    fetchAppraisalsByEmployee(managerUserId)
      .then((data) => setAppraisals(data))
      .catch(() => setError("Failed to load your appraisals."))
      .finally(() => setLoading(false));
  }, []);

  const cycles = ["All cycles", ...Array.from(new Set(appraisals.map((a) => a.cycleName)))];

  const filtered = appraisals.filter((a) => {
    const matchStatus = statusFilter === ALL_STATUSES || a.appraisalStatus === statusFilter;
    const matchCycle = cycleFilter === "All cycles" || a.cycleName === cycleFilter;
    return matchStatus && matchCycle;
  });

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center h-64">
        <p className="text-[#6b7280]">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center h-64">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">My Appraisals</h1>
          <p className="text-[#6b7280] text-sm mt-1">
            Your own appraisal cycles — as an employee
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1e2029] border border-white/[0.06] text-[#9ca3af] text-sm rounded-xl px-3 py-2 outline-none hover:border-purple-500/30 transition-all"
          >
            <option>{ALL_STATUSES}</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            className="bg-[#1e2029] border border-white/[0.06] text-[#9ca3af] text-sm rounded-xl px-3 py-2 outline-none hover:border-purple-500/30 transition-all"
          >
            {cycles.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Appraisal Cards */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-12 text-center">
            <p className="text-[#6b7280] text-sm">No appraisals found.</p>
          </div>
        ) : (
          filtered.map((appraisal) => (
            <div
              key={appraisal.appraisalId}
              className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-4 flex items-center justify-between hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-semibold">{appraisal.cycleName}</p>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-lg ${statusStyles[appraisal.appraisalStatus]}`}>
                      {STATUS_LABELS[appraisal.appraisalStatus] || appraisal.appraisalStatus}
                    </span>
                  </div>
                  <p className="text-[#6b7280] text-xs mt-1">
                    Reviewed by: <span className="text-[#9ca3af]">{appraisal.managerEmail}</span>
                    <span className="mx-2">·</span>
                    {appraisal.cycleStartDate} — {appraisal.cycleEndDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/manager/my-appraisals/${appraisal.appraisalId}`)}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all"
              >
                {appraisal.appraisalStatus === "PENDING" || appraisal.appraisalStatus === "EMPLOYEE_DRAFT"
                  ? "Fill Self Assessment"
                  : "View"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}