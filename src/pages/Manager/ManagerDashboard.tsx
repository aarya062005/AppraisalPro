import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserById, fetchAppraisalsByEmployee } from "../../api/authApi";
import axiosInstance from "../../api/axiosInstance";

// ─── API Calls ───────────────────────────────────────
const fetchAppraisalsByManager = async (managerId: number) => {
  const response = await axiosInstance.get(`/api/appraisals/manager/${managerId}`);
  return response.data;
};

const fetchTeamByManager = async (managerId: number) => {
  const response = await axiosInstance.get(`/api/users/manager/${managerId}`);
  return response.data;
};

const submitManagerReview = async (appraisalId: number, dto: {
  managerStrengths: string;
  managerImprove: string;
  managerComments: string;
  managerRating: number;
}) => {
  const response = await axiosInstance.put(
    `/api/appraisals/${appraisalId}/manager-review/submit`,
    dto
  );
  return response.data;
};

// ─── Status Styles ───────────────────────────────────
const statusStyles: Record<string, string> = {
  ACKNOWLEDGED:     "bg-green-500/10 text-green-400 border border-green-500/20",
  SELF_SUBMITTED:   "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  PENDING:          "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  EMPLOYEE_DRAFT:   "bg-[#2a2d3a] text-[#6b7280] border border-white/[0.06]",
  MANAGER_DRAFT:    "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  MANAGER_REVIEWED: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  APPROVED:         "bg-teal-500/10 text-teal-400 border border-teal-500/20",
};

const statusLabel: Record<string, string> = {
  ACKNOWLEDGED:     "Acknowledged",
  SELF_SUBMITTED:   "Self Submitted",
  PENDING:          "Pending",
  EMPLOYEE_DRAFT:   "Draft",
  MANAGER_DRAFT:    "Manager Draft",
  MANAGER_REVIEWED: "Manager Reviewed",
  APPROVED:         "Approved",
};

// ─── Icons ───────────────────────────────────────────
const StarRating = ({ rating, max = 5 }: { rating: number; max?: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <svg key={i} width="14" height="14" viewBox="0 0 24 24"
        fill={i < rating ? "#a855f7" : "none"}
        stroke={i < rating ? "#a855f7" : "#374151"}
        strokeWidth="1.5"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

const TeamIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="7" cy="6" r="3" stroke="#6b7280" strokeWidth="1.5"/>
    <circle cx="13" cy="6" r="3" stroke="#6b7280" strokeWidth="1.5"/>
    <path d="M1 18c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M13 18c0-3.314 2.686-6 6-6" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ReviewIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="3" width="14" height="14" rx="2" stroke="#6b7280" strokeWidth="1.5"/>
    <path d="M7 10h6M7 7h6M7 13h3" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const PendingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="7" stroke="#6b7280" strokeWidth="1.5"/>
    <path d="M10 6v4l2.5 2.5" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="7" stroke="#6b7280" strokeWidth="1.5"/>
    <path d="M7 10l2.5 2.5 3.5-4" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Main Component ──────────────────────────────────
export default function ManagerDashboard() {
  const navigate = useNavigate();
  const managerId = Number(localStorage.getItem("userId"));

  const [managerName, setManagerName] = useState("Manager");
  const [designation, setDesignation] = useState("Team Lead");
  const [myAppraisals, setMyAppraisals] = useState<any[]>([]);
  const [teamAppraisals, setTeamAppraisals] = useState<any[]>([]);
  const [teamSize, setTeamSize] = useState(0);
  const [reviewModal, setReviewModal] = useState<any | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [reviewForm, setReviewForm] = useState({
    managerStrengths: "",
    managerImprove: "",
    managerComments: "",
    managerRating: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!managerId) return;

    // Fetch manager user info
    fetchUserById(managerId).then((user) => {
      setManagerName(user.firstName || "Manager");
      setDesignation(user.designation || "Team Lead");
    }).catch(console.error);

    // Fetch manager's own appraisals (as employee)
    fetchAppraisalsByEmployee(managerId).then((data) => {
      if (data) setMyAppraisals(data);
    }).catch(console.error);

    // Fetch team appraisals
    fetchAppraisalsByManager(managerId).then((data) => {
      if (data) {
        setTeamAppraisals(data);
        // Unique employees = team size
        const uniqueEmployees = new Set(data.map((a: any) => a.employeeEmail));
        setTeamSize(uniqueEmployees.size);
      }
    }).catch(console.error);
  }, [managerId]);

  const handleSubmitReview = async () => {
    if (!reviewModal) return;
    if (reviewForm.managerRating === 0) {
      setError("Please select a rating");
      return;
    }
    if (!reviewForm.managerStrengths.trim()) {
      setError("Please fill in strengths");
      return;
    }
    if (!reviewForm.managerImprove.trim()) {
      setError("Please fill in improvements");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await submitManagerReview(reviewModal.appraisalId, reviewForm);
      // Refresh team appraisals
      const updated = await fetchAppraisalsByManager(managerId);
      setTeamAppraisals(updated);
      setReviewModal(null);
      setReviewForm({ managerStrengths: "", managerImprove: "", managerComments: "", managerRating: 0 });
    } catch (e) {
      setError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeReviews = teamAppraisals.filter(
    (t) => t.appraisalStatus !== "ACKNOWLEDGED" && t.appraisalStatus !== "PENDING"
  ).length;
  const awaitingReview = teamAppraisals.filter(
    (t) => t.appraisalStatus === "SELF_SUBMITTED"
  ).length;
  const completed = teamAppraisals.filter(
    (t) => t.appraisalStatus === "ACKNOWLEDGED"
  ).length;

  const stats = [
    { label: "Team Size",          value: teamSize,      icon: <TeamIcon /> },
    { label: "Active Reviews",     value: activeReviews, icon: <ReviewIcon /> },
    { label: "Awaiting My Review", value: awaitingReview,icon: <PendingIcon /> },
    { label: "Completed",          value: completed,     icon: <CheckIcon /> },
  ];

  return (
    <div className="w-full">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold tracking-tight">
          Welcome, {managerName}
        </h1>
        <p className="text-[#6b7280] text-sm mt-1">{designation}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-white text-3xl font-bold">{stat.value}</p>
            </div>
            {stat.icon}
          </div>
        ))}
      </div>

      {/* My Appraisals */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <p className="text-white text-sm font-semibold uppercase tracking-widest">My Appraisals</p>
          <p className="text-[#6b7280] text-xs">— as an employee reporting to your manager</p>
        </div>
        <div className="flex flex-col gap-3">
          {myAppraisals.length === 0 ? (
            <p className="text-[#6b7280] text-xs text-center py-4">No appraisals found</p>
          ) : (
            myAppraisals.map((appraisal) => (
              <div key={appraisal.appraisalId} className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-semibold">{appraisal.cycleName}</p>
                  <p className="text-[#6b7280] text-xs mt-0.5">
                    Reviewed by: {appraisal.managerEmail} · {appraisal.cycleStartDate} — {appraisal.cycleEndDate}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-3 py-1 rounded-lg ${statusStyles[appraisal.appraisalStatus]}`}>
                    {statusLabel[appraisal.appraisalStatus]}
                  </span>
                  <button
                    onClick={() => navigate(`/manager/my-appraisals/${appraisal.appraisalId}`)}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all"
                  >
                    Fill Self Assessment
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Team Appraisals */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <p className="text-white text-sm font-semibold uppercase tracking-widest">Team Appraisals</p>
          <p className="text-[#6b7280] text-xs">— reviews you need to complete</p>
        </div>

        <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1.5fr_1fr_1.5fr_1.5fr_1fr] px-5 py-3 border-b border-white/[0.06]">
            {["Employee", "Cycle", "Status", "Appraisal Status", "Actions"].map((h) => (
              <span key={h} className="text-[#6b7280] text-xs uppercase tracking-widest font-medium">{h}</span>
            ))}
          </div>

          {teamAppraisals.length === 0 ? (
            <p className="text-[#6b7280] text-xs text-center py-6">No team appraisals found</p>
          ) : (
            teamAppraisals.map((row, index) => (
              <div
                key={row.appraisalId}
                className={`grid grid-cols-[1.5fr_1fr_1.5fr_1.5fr_1fr] px-5 py-4 items-center ${
                  index !== teamAppraisals.length - 1 ? "border-b border-white/[0.04]" : ""
                } hover:bg-white/[0.02] transition-all`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {row.employeeEmail?.[0]?.toUpperCase() || "?"}
                  </div>
                  <span className="text-white text-sm font-medium">{row.employeeEmail}</span>
                </div>
                <span className="text-[#6b7280] text-sm">{row.cycleName}</span>
                <span className="text-[#6b7280] text-sm">{row.cycleStatus}</span>
                <span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${statusStyles[row.appraisalStatus]}`}>
                    {statusLabel[row.appraisalStatus]}
                  </span>
                </span>
                <span>
                  {row.appraisalStatus === "SELF_SUBMITTED" || row.appraisalStatus === "MANAGER_DRAFT" ? (
                    <button
                      onClick={() => {
                        setReviewModal(row);
                        setReviewForm({ managerStrengths: "", managerImprove: "", managerComments: "", managerRating: 0 });
                        setError("");
                      }}
                      className="text-xs font-medium px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-all"
                    >
                      Review
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/manager/team-appraisal/${row.appraisalId}`)}
                      className="text-xs font-medium px-4 py-1.5 rounded-lg border border-white/[0.08] text-[#9ca3af] hover:bg-white/[0.04] transition-all"
                    >
                      View
                    </button>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#1e2029] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-white text-lg font-bold mb-1">Review Employee</h2>
            <p className="text-[#6b7280] text-sm mb-5">
              {reviewModal.employeeEmail} — {reviewModal.cycleName}
            </p>

            {/* Strengths */}
            <div className="mb-4">
              <label className="text-[#9ca3af] text-xs mb-1.5 block">Strengths *</label>
              <textarea
                rows={2}
                className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm resize-none outline-none focus:border-purple-500/50"
                placeholder="What did the employee do well?"
                value={reviewForm.managerStrengths}
                onChange={(e) => setReviewForm((p) => ({ ...p, managerStrengths: e.target.value }))}
              />
            </div>

            {/* Improvements */}
            <div className="mb-4">
              <label className="text-[#9ca3af] text-xs mb-1.5 block">Areas to Improve *</label>
              <textarea
                rows={2}
                className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm resize-none outline-none focus:border-purple-500/50"
                placeholder="What can the employee improve?"
                value={reviewForm.managerImprove}
                onChange={(e) => setReviewForm((p) => ({ ...p, managerImprove: e.target.value }))}
              />
            </div>

            {/* Comments */}
            <div className="mb-4">
              <label className="text-[#9ca3af] text-xs mb-1.5 block">Comments</label>
              <textarea
                rows={2}
                className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm resize-none outline-none focus:border-purple-500/50"
                placeholder="Any additional comments?"
                value={reviewForm.managerComments}
                onChange={(e) => setReviewForm((p) => ({ ...p, managerComments: e.target.value }))}
              />
            </div>

            {/* Rating */}
            <p className="text-[#9ca3af] text-xs mb-2">Your Rating *</p>
            <div className="flex gap-2 mb-5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewForm((p) => ({ ...p, managerRating: star }))}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(null)}
                  className="transition-transform hover:scale-110"
                >
                  <svg width="32" height="32" viewBox="0 0 24 24"
                    fill={star <= (hovered ?? reviewForm.managerRating) ? "#a855f7" : "none"}
                    stroke={star <= (hovered ?? reviewForm.managerRating) ? "#a855f7" : "#374151"}
                    strokeWidth="1.5"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}
            </div>

            {/* Error */}
            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => { setReviewModal(null); setError(""); }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] text-[#9ca3af] text-sm hover:bg-white/[0.04] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}