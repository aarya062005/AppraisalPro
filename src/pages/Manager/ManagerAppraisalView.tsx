import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchAppraisalById } from "../../api/authApi";

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

const StarDisplay = ({ rating }: { rating: number }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg key={star} width="20" height="20" viewBox="0 0 24 24"
        fill={star <= rating ? "#a855f7" : "none"}
        stroke={star <= rating ? "#a855f7" : "#374151"}
        strokeWidth="1.5"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

export default function ManagerAppraisalView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appraisal, setAppraisal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || id === "undefined") {
      setError("Invalid appraisal ID.");
      setLoading(false);
      return;
    }
    fetchAppraisalById(Number(id))
      .then((data) => setAppraisal(data))
      .catch(() => setError("Appraisal not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="w-full flex items-center justify-center h-64">
      <p className="text-[#6b7280]">Loading...</p>
    </div>
  );

  if (error || !appraisal) return (
    <div className="text-white p-6">{error || "Appraisal not found."}</div>
  );

  return (
    <div className="w-full max-w-3xl">
      {/* Back button */}
      <button
        onClick={() => navigate("/manager/dashboard")}
        className="flex items-center gap-2 text-[#6b7280] hover:text-white text-sm mb-6 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to Dashboard
      </button>

      {/* Appraisal Details */}
      <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-6 py-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[#6b7280] text-xs uppercase tracking-widest font-medium">Appraisal Details</p>
          <span className={`text-xs font-medium px-3 py-1 rounded-lg ${statusStyles[appraisal.appraisalStatus]}`}>
            {STATUS_LABELS[appraisal.appraisalStatus] || appraisal.appraisalStatus}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">Employee</p>
            <p className="text-white text-sm font-semibold">{appraisal.employeeEmail}</p>
          </div>
          <div>
            <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">Cycle</p>
            <p className="text-white text-sm font-semibold">{appraisal.cycleName}</p>
          </div>
          <div>
            <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">Start Date</p>
            <p className="text-white text-sm font-semibold">{appraisal.cycleStartDate}</p>
          </div>
          <div>
            <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">End Date</p>
            <p className="text-white text-sm font-semibold">{appraisal.cycleEndDate}</p>
          </div>
        </div>
      </div>

      {/* Self Assessment (read-only) */}
      <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-6 py-5 mb-4">
        <p className="text-[#6b7280] text-xs uppercase tracking-widest font-medium mb-4">Self Assessment</p>

        {appraisal.appraisalStatus === "PENDING" || appraisal.appraisalStatus === "EMPLOYEE_DRAFT" ? (
          <p className="text-[#4b5563] text-sm italic">
            Employee hasn't submitted their self-assessment yet.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-white text-sm font-medium mb-1.5">What Went Well</p>
              <p className="text-[#9ca3af] text-sm bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-3">
                {appraisal.whatWentWell || "—"}
              </p>
            </div>
            <div>
              <p className="text-white text-sm font-medium mb-1.5">What To Improve</p>
              <p className="text-[#9ca3af] text-sm bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-3">
                {appraisal.whatToImprove || "—"}
              </p>
            </div>
            <div>
              <p className="text-white text-sm font-medium mb-1.5">Achievements</p>
              <p className="text-[#9ca3af] text-sm bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-3">
                {appraisal.achievements || "—"}
              </p>
            </div>
            <div>
              <p className="text-white text-sm font-medium mb-1.5">Self Rating</p>
              {appraisal.selfRating > 0 ? <StarDisplay rating={appraisal.selfRating} /> : <span className="text-[#4b5563] text-sm">—</span>}
            </div>
          </div>
        )}
      </div>

      {/* Manager Review (read-only) */}
      <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-6 py-5">
        <p className="text-[#6b7280] text-xs uppercase tracking-widest font-medium mb-4">Manager Review</p>

        {appraisal.managerRating ? (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-white text-sm font-medium mb-1.5">Rating</p>
              <StarDisplay rating={appraisal.managerRating} />
            </div>
            {appraisal.managerStrengths && (
              <div>
                <p className="text-white text-sm font-medium mb-1.5">Strengths</p>
                <p className="text-[#9ca3af] text-sm bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-3">
                  {appraisal.managerStrengths}
                </p>
              </div>
            )}
            {appraisal.managerImprove && (
              <div>
                <p className="text-white text-sm font-medium mb-1.5">Areas to Improve</p>
                <p className="text-[#9ca3af] text-sm bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-3">
                  {appraisal.managerImprove}
                </p>
              </div>
            )}
            {appraisal.managerComments && (
              <div>
                <p className="text-white text-sm font-medium mb-1.5">Comments</p>
                <p className="text-[#9ca3af] text-sm bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-3">
                  {appraisal.managerComments}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[#4b5563] text-sm italic">
            You haven't reviewed this appraisal yet.
          </p>
        )}
      </div>
    </div>
  );
}