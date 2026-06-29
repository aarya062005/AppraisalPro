import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

// ─── API Calls ───────────────────────────────────────
const fetchGoalsByManager = async (managerId: number) => {
  const response = await axiosInstance.get(`/api/appraisals/manager/${managerId}`);
  const appraisals = response.data;
  // Fetch goals for each appraisal
  const allGoals = await Promise.all(
    appraisals.map((a: any) =>
      axiosInstance.get(`/api/goals/appraisal/${a.appraisalId}`).then((r) => r.data)
    )
  );
  return allGoals.flat();
};

const fetchTeamByManager = async (managerId: number) => {
  const response = await axiosInstance.get(`/api/users/manager/${managerId}`);
  return response.data;
};

const createGoal = async (dto: {
  appraisalId: number;
  employeeId: number;
  title: string;
  description: string;
  dueDate: string;
}) => {
  const response = await axiosInstance.post(`/api/goals`, dto);
  return response.data;
};

const fetchAppraisalsByEmployee = async (employeeId: number) => {
  const response = await axiosInstance.get(`/api/appraisals/employee/${employeeId}`);
  return response.data;
};

// ─── Status Styles ───────────────────────────────────
const statusStyles: Record<string, string> = {
  NOT_STARTED: "bg-[#2a2d3a] text-[#6b7280] border border-white/[0.06]",
  IN_PROGRESS:  "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  COMPLETED:    "bg-green-500/10 text-green-400 border border-green-500/20",
  CANCELLED:    "bg-red-500/10 text-red-400 border border-red-500/20",
};

const statusLabel: Record<string, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS:  "In Progress",
  COMPLETED:    "Completed",
  CANCELLED:    "Cancelled",
};

// ─── Main Component ──────────────────────────────────
export default function ManagerGoals() {
  const managerId = Number(localStorage.getItem("userId"));

  const [goals, setGoals] = useState<any[]>([]);
  const [teammates, setTeammates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    employeeId: "",
    dueDate: "",
  });

  useEffect(() => {
    if (!managerId) return;
    loadData();
  }, [managerId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [goalsData, teamData] = await Promise.all([
        fetchGoalsByManager(managerId),
        fetchTeamByManager(managerId),
      ]);
      setGoals(goalsData || []);
      setTeammates(teamData || []);
    } catch (e) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.title || !form.employeeId || !form.dueDate) {
      setError("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Get latest appraisal for the selected employee
      const appraisals = await fetchAppraisalsByEmployee(Number(form.employeeId));
      if (!appraisals || appraisals.length === 0) {
        setError("No appraisal found for this employee");
        setSubmitting(false);
        return;
      }
      const latestAppraisal = appraisals[appraisals.length - 1];

      await createGoal({
        appraisalId: latestAppraisal.appraisalId,
        employeeId: Number(form.employeeId),
        title: form.title,
        description: form.description,
        dueDate: form.dueDate,
      });

      await loadData();
      setForm({ title: "", description: "", employeeId: "", dueDate: "" });
      setShowModal(false);
    } catch (e) {
      setError("Failed to create goal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Team Goals</h1>
          <p className="text-[#6b7280] text-sm mt-1">Manage goals for your team members</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(""); }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Add Goal
        </button>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-16 text-center">
          <p className="text-[#6b7280] text-sm">No goals yet. Add a goal for a team member.</p>
        </div>
      ) : (
        <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-5 py-3 border-b border-white/[0.06]">
            {["Goal", "Employee", "Due Date", "Status"].map((h) => (
              <span key={h} className="text-[#6b7280] text-xs uppercase tracking-widest font-medium">{h}</span>
            ))}
          </div>

          {/* Rows */}
          {goals.map((goal, index) => (
            <div
              key={goal.goalId}
              className={`grid grid-cols-[2fr_1fr_1fr_1fr] px-5 py-4 items-center hover:bg-white/[0.02] transition-all ${
                index !== goals.length - 1 ? "border-b border-white/[0.04]" : ""
              }`}
            >
              <span className="text-white text-sm font-medium">{goal.title}</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-[10px] font-bold">
                  {goal.employeeName?.[0]?.toUpperCase() || goal.employeeEmail?.[0]?.toUpperCase() || "?"}
                </div>
                <span className="text-[#9ca3af] text-sm">
                  {goal.employeeName || goal.employeeEmail || "—"}
                </span>
              </div>
              <span className="text-[#6b7280] text-sm">{goal.dueDate || "—"}</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-lg w-fit ${statusStyles[goal.status]}`}>
                {statusLabel[goal.status] || goal.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#1e2029] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-white text-lg font-bold mb-5">Add New Goal</h2>

            {/* Goal Title */}
            <div className="mb-4">
              <label className="text-[#9ca3af] text-sm mb-1.5 block">Goal Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Enter goal title..."
                className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-[#4b5563] text-sm outline-none focus:border-purple-500/50 transition-all"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="text-[#9ca3af] text-sm mb-1.5 block">Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Enter goal description..."
                className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-[#4b5563] text-sm outline-none focus:border-purple-500/50 transition-all resize-none"
              />
            </div>

            {/* Assign To */}
            <div className="mb-4">
              <label className="text-[#9ca3af] text-sm mb-1.5 block">Assign To *</label>
              <select
                value={form.employeeId}
                onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))}
                className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500/50 transition-all"
              >
                <option value="" disabled>Select employee...</option>
                {teammates.map((t) => (
                  <option key={t.userId} value={t.userId}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="mb-5">
              <label className="text-[#9ca3af] text-sm mb-1.5 block">Due Date *</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500/50 transition-all"
              />
            </div>

            {/* Error */}
            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowModal(false); setError(""); }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] text-[#9ca3af] text-sm hover:bg-white/[0.04] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add Goal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}