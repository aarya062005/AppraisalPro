import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAppraisalsByEmployee } from "../api/authApi";

type AppraisalStatus = "PENDING" | "EMPLOYEE_DRAFT" | "SELF_SUBMITTED" | "MANAGER_DRAFT" | "MANAGER_REVIEWED" | "APPROVED" | "ACKNOWLEDGED";

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

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  EMPLOYEE_DRAFT: "Draft",
  SELF_SUBMITTED: "Submitted",
  MANAGER_DRAFT: "Manager Draft",
  MANAGER_REVIEWED: "Manager Reviewed",
  APPROVED: "Approved",
  ACKNOWLEDGED: "Acknowledged",
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  EMPLOYEE_DRAFT: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  SELF_SUBMITTED: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  MANAGER_DRAFT: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  MANAGER_REVIEWED: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
  APPROVED: "bg-green-500/10 text-green-400 border border-green-500/20",
  ACKNOWLEDGED: "bg-green-500/10 text-green-400 border border-green-500/20",
};

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function MyAppraisals() {
  const navigate = useNavigate();
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const employeeId = Number(localStorage.getItem("userId"));
    if (!employeeId) return;

    fetchAppraisalsByEmployee(employeeId)
      .then((data) => setAppraisals(data))
      .catch(() => setError("Failed to load appraisals."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="w-full flex items-center justify-center h-64">
      <p className="text-[#6b7280]">Loading...</p>
    </div>
  );

  if (error) return (
    <div className="w-full flex items-center justify-center h-64">
      <p className="text-red-400">{error}</p>
    </div>
  );

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold tracking-tight">My Appraisal</h1>
        <p className="text-[#6b7280] text-sm mt-1">{appraisals.length} appraisal cycles</p>
      </div>

      {appraisals.length === 0 ? (
        <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-6 py-10 text-center">
          <p className="text-[#6b7280] text-sm">No appraisals found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {appraisals.map((appraisal) => (
            <div
              key={appraisal.appraisalId}
              className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-4 flex items-center justify-between hover:border-purple-500/30 transition-all"
            >
              <div className="flex flex-col gap-1">
                <span className="text-white text-sm font-semibold">{appraisal.cycleName}</span>
                <span className="text-[#6b7280] text-xs">
                  {appraisal.cycleStartDate} — {appraisal.cycleEndDate}
                </span>
                <span className="text-[#6b7280] text-xs">Manager: {appraisal.managerEmail}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-3 py-1 rounded-lg ${statusStyles[appraisal.appraisalStatus]}`}>
                  {STATUS_LABELS[appraisal.appraisalStatus] || appraisal.appraisalStatus}
                </span>
                <button
                  onClick={() => navigate(`/my-appraisal/${appraisal.appraisalId}`)}
                  className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                >
                  View <ChevronIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}