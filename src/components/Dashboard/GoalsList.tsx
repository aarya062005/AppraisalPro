import { useEffect, useState } from "react";
import { fetchGoalsByEmployee } from "../../api/authApi";

const progressBarColor: Record<string, string> = {
  IN_PROGRESS: "bg-purple-500",
  NOT_STARTED: "bg-[#374151]",
};

const statusStyles: Record<string, string> = {
  IN_PROGRESS: "text-purple-400",
  NOT_STARTED: "text-[#6b7280]",
};

const statusLabel: Record<string, string> = {
  IN_PROGRESS: "In Progress",
  NOT_STARTED: "Not started",
};

export default function GoalsList() {
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    const employeeId = Number(localStorage.getItem("userId"));
    if (!employeeId) return;

    fetchGoalsByEmployee(employeeId).then((data) => {
      if (data) {
        const active = data.filter((g: any) =>
          g.status === "IN_PROGRESS" || g.status === "NOT_STARTED"
        );
        setGoals(active);
      }
    }).catch(console.error);
  }, []);

  return (
    <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[#6b7280] text-xs uppercase tracking-widest font-medium">
          My Goals
        </span>
        <a href="/goals" className="text-purple-400 text-xs hover:text-purple-300 transition-colors">
          View all →
        </a>
      </div>
      <div className="flex flex-col gap-3">
        {goals.length === 0 ? (
          <p className="text-[#6b7280] text-xs text-center py-4">No active goals</p>
        ) : (
          goals.map((goal) => (
            <div
              key={goal.goalId}
              className="bg-[#16181f] border border-white/[0.04] rounded-xl px-4 py-3 flex items-center gap-4"
            >
              <span className="text-white text-sm flex-1">{goal.title}</span>
              <div className="w-28 h-1.5 bg-[#2a2d3a] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${progressBarColor[goal.status]}`}
                  style={{ width: `${goal.progressPercent ?? 0}%` }}
                />
              </div>
              <span className={`text-xs font-medium w-20 text-right ${statusStyles[goal.status]}`}>
                {statusLabel[goal.status]}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}