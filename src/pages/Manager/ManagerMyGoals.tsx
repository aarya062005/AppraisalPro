import { useState } from "react";

type GoalStatus = "Not Started" | "In Progress" | "Submitted" | "Completed" | "Not Completed" | "Cancelled";

interface Goal {
  id: number;
  title: string;
  appraisal: string;
  dueDate: string;
  daysLeft: number | null;
  status: GoalStatus;
}

const initialGoals: Goal[] = [
  { id: 1, title: "Improve team velocity by 15%", appraisal: "2026 Annual Review", dueDate: "30 Jun 2026", daysLeft: 8, status: "In Progress" },
  { id: 2, title: "Complete leadership training", appraisal: "2026 Annual Review", dueDate: "20 Jul 2026", daysLeft: 28, status: "Not Started" },
  { id: 3, title: "Grow team to 4 members", appraisal: "2025 Annual Review", dueDate: "30 Sept 2025", daysLeft: null, status: "Completed" },
];

const statusStyles: Record<GoalStatus, string> = {
  "In Progress": "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  "Not Started": "bg-[#2a2d3a] text-[#6b7280] border border-white/[0.06]",
  "Submitted": "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  "Completed": "bg-green-500/10 text-green-400 border border-green-500/20",
  "Not Completed": "bg-red-500/10 text-red-400 border border-red-500/20",
  "Cancelled": "bg-[#2a2d3a] text-[#6b7280] border border-white/[0.06]",
};

const filters: ("All" | GoalStatus)[] = ["All", "Not Started", "In Progress", "Submitted", "Completed", "Not Completed", "Cancelled"];

export default function ManagerMyGoals() {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [activeFilter, setActiveFilter] = useState<"All" | GoalStatus>("All");
  const [updateModal, setUpdateModal] = useState<Goal | null>(null);
  const [completed, setCompleted] = useState<boolean | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filtered = activeFilter === "All" ? goals : goals.filter((g) => g.status === activeFilter);

  const totalGoals = goals.length;
  const completedCount = goals.filter((g) => g.status === "Completed").length;
  const inProgress = goals.filter((g) => g.status === "In Progress").length;
  const notStarted = goals.filter((g) => g.status === "Not Started").length;

  const handleSubmitUpdate = () => {
    if (!updateModal || completed === null) return;
    setSubmitting(true);
    setTimeout(() => {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === updateModal.id
            ? { ...g, status: completed ? "Completed" : "Not Completed", daysLeft: null }
            : g
        )
      );
      setUpdateModal(null);
      setCompleted(null);
      setNote("");
      setSubmitting(false);
    }, 800);
  };

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
        {/* Header */}
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr] px-5 py-3 border-b border-white/[0.06]">
          {["Goal", "Appraisal", "Due Date", "Days Left", "Status", "Action"].map((h) => (
            <span key={h} className="text-[#6b7280] text-xs uppercase tracking-widest font-medium">{h}</span>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-[#6b7280] text-sm">No goals found.</div>
        ) : (
          filtered.map((goal, index) => (
            <div
              key={goal.id}
              className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr] px-5 py-4 items-center hover:bg-white/[0.02] transition-all ${
                index !== filtered.length - 1 ? "border-b border-white/[0.04]" : ""
              }`}
            >
              <span className="text-white text-sm font-medium">{goal.title}</span>
              <span className="text-[#6b7280] text-sm">{goal.appraisal}</span>
              <span className="text-[#6b7280] text-sm">{goal.dueDate}</span>
              <span className="text-[#9ca3af] text-sm">
                {goal.daysLeft !== null ? `${goal.daysLeft} days` : "—"}
              </span>
              <span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${statusStyles[goal.status]}`}>
                  {goal.status}
                </span>
              </span>
              <span>
                <button
                  onClick={() => { setUpdateModal(goal); setCompleted(null); setNote(""); }}
                  disabled={goal.status === "Completed" || goal.status === "Cancelled" || goal.status === "Not Completed"}
                  className="text-xs font-medium px-4 py-1.5 rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Update
                </button>
              </span>
            </div>
          ))
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
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5 8l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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

            <p className="text-[#4b5563] text-xs mb-5">
              Once submitted, your manager will review and confirm the final status. You can update your response until they finalize it.
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