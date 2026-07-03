import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

// ─── API Calls ───────────────────────────────────────
const fetchGoalsByEmployee = async (employeeId: number) => {
  const response = await axiosInstance.get(`/api/goals/employee/${employeeId}`);
  return response.data;
};

const submitGoalCompletion = async (goalId: number, completed: boolean, note: string) => {
  const response = await axiosInstance.patch(
    `/api/goals/${goalId}/submit?completed=${completed}${
      note ? `&note=${encodeURIComponent(note)}` : ""
    }`
  );
  return response.data;
};

type GoalStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "EMPLOYEE_SUBMITTED"
  | "COMPLETED"
  | "NOT_COMPLETED"
  | "CANCELLED";

interface Goal {
  goalId: number;
  appraisalId: number | null;
  title: string;
  status: GoalStatus;
  dueDate: string | null;
  employeeCompleted?: boolean;
  employeeNote?: string;
}

const statusStyles: Record<GoalStatus, string> = {
  IN_PROGRESS: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  NOT_STARTED: "bg-[#2a2d3a] text-[#6b7280] border border-white/[0.06]",
  EMPLOYEE_SUBMITTED: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  COMPLETED: "bg-green-500/10 text-green-400 border border-green-500/20",
  NOT_COMPLETED: "bg-red-500/10 text-red-400 border border-red-500/20",
  CANCELLED: "bg-[#2a2d3a] text-[#6b7280] border border-white/[0.06]",
};

const statusLabel: Record<GoalStatus, string> = {
  IN_PROGRESS: "In Progress",
  NOT_STARTED: "Not Started",
  EMPLOYEE_SUBMITTED: "Submitted",
  COMPLETED: "Completed",
  NOT_COMPLETED: "Not Completed",
  CANCELLED: "Cancelled",
};

const filters = [
  "All",
  "Not Started",
  "In Progress",
  "Submitted",
  "Completed",
  "Not Completed",
  "Cancelled",
];

export default function ManagerMyGoals() {
  const managerUserId = Number(localStorage.getItem("userId"));

  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [updateModal, setUpdateModal] = useState<Goal | null>(null);
  const [completed, setCompleted] = useState<boolean | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!managerUserId) return;
    loadGoals();
  }, [managerUserId]);

  const loadGoals = async () => {
    setLoading(true);
    try {
      // A manager has their own goals as an employee too — same endpoint
      // as the employee Goals page, keyed off the manager's own userId.
      const data = await fetchGoalsByEmployee(managerUserId);
      setGoals(data || []);
    } catch (e) {
      console.error("Failed to load goals", e);
    } finally {
      setLoading(false);
    }
  };

  const getDaysLeft = (dueDate: string | null) => {
    if (!dueDate) return null;
    const days = Math.ceil(
      (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days > 0 ? days : null;
  };

  const handleSubmitUpdate = async () => {
    if (!updateModal || completed === null) return;
    setSubmitting(true);
    setError("");
    try {
      await submitGoalCompletion(updateModal.goalId, completed, note);
      await loadGoals();
      setUpdateModal(null);
      setCompleted(null);
      setNote("");
    } catch {
      setError("Failed to update goal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered =
    activeFilter === "All"
      ? goals
      : goals.filter((g) => statusLabel[g.status] === activeFilter);

  const totalGoals = goals.length;
  const completedCount = goals.filter((g) => g.status === "COMPLETED").length;
  const inProgress = goals.filter((g) => g.status === "IN_PROGRESS").length;
  const notStarted = goals.filter((g) => g.status === "NOT_STARTED").length;

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <p className="text-[#6b7280] text-sm">Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold tracking-tight">My Goals</h1>
        <p className="text-[#6b7280] text-sm mt-1">{totalGoals} goals across all cycles</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Goals", value: totalGoals, color: "text-white" },
          { label: "Completed", value: completedCount, color: "text-green-400" },
          { label: "In Progress", value: inProgress, color: "text-blue-400" },
          { label: "Not Started", value: notStarted, color: "text-[#6b7280]" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-4"
          >
            <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-2">
              {stat.label}
            </p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
              activeFilter === filter
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-transparent text-[#6b7280] border-white/[0.08] hover:text-white hover:border-white/20"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Goals Table */}
      <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr] px-5 py-3 border-b border-white/[0.06]">
          {["Goal", "Appraisal", "Due Date", "Days Left", "Status", "Action"].map((h) => (
            <span
              key={h}
              className="text-[#6b7280] text-xs uppercase tracking-widest font-medium"
            >
              {h}
            </span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-[#6b7280] text-sm">
            No goals found.
          </div>
        ) : (
          filtered.map((goal, index) => {
            const daysLeft = getDaysLeft(goal.dueDate);
            const isDisabled = [
              "EMPLOYEE_SUBMITTED",
              "COMPLETED",
              "CANCELLED",
              "NOT_COMPLETED",
            ].includes(goal.status);
            return (
              <div
                key={goal.goalId}
                className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr] px-5 py-4 items-center hover:bg-white/[0.02] transition-all ${
                  index !== filtered.length - 1 ? "border-b border-white/[0.04]" : ""
                }`}
              >
                <span className="text-white text-sm font-medium">{goal.title}</span>
                <span className="text-[#6b7280] text-sm">
                  {goal.appraisalId ? `Appraisal #${goal.appraisalId}` : "—"}
                </span>
                <span className="text-[#6b7280] text-sm">{goal.dueDate || "—"}</span>
                <span className="text-[#9ca3af] text-sm">
                  {daysLeft !== null ? `${daysLeft} days` : "—"}
                </span>
                <span>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-lg ${statusStyles[goal.status]}`}
                  >
                    {statusLabel[goal.status] || goal.status}
                  </span>
                </span>
                <span>
                  <button
                    onClick={() => {
                      setUpdateModal(goal);
                      setCompleted(null);
                      setNote(goal.employeeNote || "");
                      setError("");
                    }}
                    disabled={isDisabled}
                    className="text-xs font-medium px-4 py-1.5 rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Update
                  </button>
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Update Modal */}
      {updateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#1e2029] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-white text-lg font-bold mb-1">{updateModal.title}</h2>
            <p className="text-[#6b7280] text-sm mb-5">Did you complete this goal?</p>

            {/* Yes / No */}
            <div className="flex gap-3 mb-5">
              <button
                onClick={() => setCompleted(true)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  completed === true
                    ? "bg-green-500/20 border-green-500/40 text-green-400"
                    : "border-white/[0.08] text-[#9ca3af] hover:bg-white/[0.04]"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M5 8l2.5 2.5 3.5-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Yes, completed
              </button>
              <button
                onClick={() => setCompleted(false)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  completed === false
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : "border-white/[0.08] text-[#9ca3af] hover:bg-white/[0.04]"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M5.5 5.5l5 5M10.5 5.5l-5 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                No, not done
              </button>
            </div>

            {/* Note */}
            <div className="mb-4">
              <label className="text-[#9ca3af] text-sm mb-1.5 block">
                Add a note <span className="text-[#4b5563]">(optional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any additional context..."
                rows={3}
                className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-[#4b5563] text-sm outline-none focus:border-purple-500/50 transition-all resize-none"
              />
            </div>

            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

            <p className="text-[#4b5563] text-xs mb-5">
              Once submitted, your manager will review and confirm the final status. You
              can update your response until they finalize it.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setUpdateModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] text-[#9ca3af] text-sm hover:bg-white/[0.04] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitUpdate}
                disabled={completed === null || submitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}