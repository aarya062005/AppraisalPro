import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

// ─── API Calls ───────────────────────────────────────
const fetchGoalsByEmployee = async (employeeId: number) => {
  const response = await axiosInstance.get(`/api/goals/employee/${employeeId}`);
  return response.data;
};

const submitGoalCompletion = async (goalId: number, completed: boolean, note: string) => {
  const response = await axiosInstance.patch(
    `/api/goals/${goalId}/submit?completed=${completed}${note ? `&note=${encodeURIComponent(note)}` : ""}`
  );
  return response.data;
};

// ─── Status Mapping ───────────────────────────────────
const statusStyles: Record<string, string> = {
  IN_PROGRESS:        "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  NOT_STARTED:        "bg-[#2a2d3a] text-[#6b7280] border border-white/[0.06]",
  EMPLOYEE_SUBMITTED: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  COMPLETED:          "bg-green-500/10 text-green-400 border border-green-500/20",
  NOT_COMPLETED:      "bg-red-500/10 text-red-400 border border-red-500/20",
  CANCELLED:          "bg-[#2a2d3a] text-[#6b7280] border border-white/[0.06]",
};

const statusLabel: Record<string, string> = {
  IN_PROGRESS:        "In Progress",
  NOT_STARTED:        "Not Started",
  EMPLOYEE_SUBMITTED: "Submitted",
  COMPLETED:          "Completed",
  NOT_COMPLETED:      "Not Completed",
  CANCELLED:          "Cancelled",
};

const filters = ["All", "Not Started", "In Progress", "Submitted", "Completed", "Not Completed", "Cancelled"];

// ─── Main Component ──────────────────────────────────
export default function Goals() {
  const employeeId = Number(localStorage.getItem("userId"));

  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [updateModal, setUpdateModal] = useState<any | null>(null);
  const [note, setNote] = useState("");
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!employeeId) return;
    loadGoals();
  }, [employeeId]);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const data = await fetchGoalsByEmployee(employeeId);
      setGoals(data || []);
    } catch (e) {
      console.error("Failed to load goals", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!updateModal) return;
    setSubmitting(true);
    setError("");
    try {
      await submitGoalCompletion(updateModal.goalId, completed, note);
      await loadGoals();
      setUpdateModal(null);
      setNote("");
      setCompleted(false);
    } catch (e) {
      setError("Failed to update goal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysLeft = (dueDate: string) => {
    if (!dueDate) return null;
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : null;
  };

  const filtered = activeFilter === "All"
    ? goals
    : goals.filter((g) => statusLabel[g.status] === activeFilter);

  const totalGoals     = goals.length;
  const completedCount = goals.filter((g) => g.status === "COMPLETED").length;
  const inProgress     = goals.filter((g) => g.status === "IN_PROGRESS").length;
  const notStarted     = goals.filter((g) => g.status === "NOT_STARTED").length;

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
        <p className="text-[#6b7280] text-sm mt-1">{totalGoals} goals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Goals", value: totalGoals,     color: "text-white" },
          { label: "Completed",   value: completedCount, color: "text-green-400" },
          { label: "In Progress", value: inProgress,     color: "text-blue-400" },
          { label: "Not Started", value: notStarted,     color: "text-[#6b7280]" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-4">
            <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-2">{stat.label}</p>
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
            <span key={h} className="text-[#6b7280] text-xs uppercase tracking-widest font-medium">{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-[#6b7280] text-sm">
            No goals found for this filter.
          </div>
        ) : (
          filtered.map((goal, index) => {
            const daysLeft = getDaysLeft(goal.dueDate);
            const isDisabled = ["EMPLOYEE_SUBMITTED", "COMPLETED", "CANCELLED", "NOT_COMPLETED"].includes(goal.status);
            return (
              <div
                key={goal.goalId}
                className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr] px-5 py-4 items-center ${
                  index !== filtered.length - 1 ? "border-b border-white/[0.04]" : ""
                } hover:bg-white/[0.02] transition-all`}
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
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${statusStyles[goal.status]}`}>
                    {statusLabel[goal.status] || goal.status}
                  </span>
                </span>
                <span>
                  <button
                    disabled={isDisabled}
                    onClick={() => {
                      setUpdateModal(goal);
                      setNote(goal.employeeNote || "");
                      setCompleted(goal.employeeCompleted || false);
                      setError("");
                    }}
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
            <h2 className="text-white text-lg font-bold mb-1">Update Goal</h2>
            <p className="text-[#6b7280] text-sm mb-5">{updateModal.title}</p>

            {/* Completed Toggle */}
            <div className="flex items-center justify-between mb-4 bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-3">
              <span className="text-[#9ca3af] text-sm">Mark as Completed</span>
              <button
                onClick={() => setCompleted((p) => !p)}
                className={`w-10 h-5 rounded-full transition-all relative ${
                  completed ? "bg-purple-600" : "bg-[#374151]"
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                  completed ? "left-5" : "left-0.5"
                }`} />
              </button>
            </div>

            {/* Note */}
            <div className="mb-5">
              <label className="text-[#9ca3af] text-xs mb-1.5 block">Note (optional)</label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this goal..."
                className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm resize-none outline-none focus:border-purple-500/50"
              />
            </div>

            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => { setUpdateModal(null); setError(""); }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] text-[#9ca3af] text-sm hover:bg-white/[0.04] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all disabled:opacity-50"
              >
                {submitting ? "Updating..." : "Submit Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}