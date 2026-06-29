import { useEffect, useState } from "react";
import { fetchAppraisalsByEmployee, fetchGoalsByEmployee } from "../../api/authApi";

interface StatCardProps {
  label: string;
  value: string | number;
  total?: number;
  status?: string;
  statusColor?: string;
}

function StatCard({ label, value, total, status, statusColor = "text-white" }: StatCardProps) {
  return (
    <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-3 flex items-center justify-between flex-1">
      <span className="text-[#6b7280] text-xs uppercase tracking-widest font-medium">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={`text-lg font-bold ${statusColor}`}>{value}</span>
        {total !== undefined && <span className="text-[#6b7280] text-xs">/{total}</span>}
        {status && <span className="text-[#6b7280] text-xs">· {status}</span>}
      </div>
    </div>
  );
}

const appraisalStatusLabel: Record<string, string> = {
  PENDING: "Pending",
  EMPLOYEE_DRAFT: "Draft",
  SELF_SUBMITTED: "Submitted",
  MANAGER_DRAFT: "In Review",
  MANAGER_REVIEWED: "Reviewed",
  APPROVED: "Approved",
  ACKNOWLEDGED: "Acknowledged",
};

export default function StatsCards() {
  const [selfRating, setSelfRating] = useState<number | string>("--");
  const [appraisalStatus, setAppraisalStatus] = useState("--");
  const [cycleName, setCycleName] = useState("--");
  const [cycleStatus, setCycleStatus] = useState("--");
  const [goalsInProgress, setGoalsInProgress] = useState(0);
  const [totalGoals, setTotalGoals] = useState(0);

  useEffect(() => {
    const employeeId = Number(localStorage.getItem("userId"));
    if (!employeeId) return;

    fetchAppraisalsByEmployee(employeeId).then((appraisals) => {
      if (appraisals?.length > 0) {
        const latest = appraisals[appraisals.length - 1];
        setSelfRating(latest.selfRating ?? "--");
        setAppraisalStatus(appraisalStatusLabel[latest.appraisalStatus] || latest.appraisalStatus || "--");
        setCycleName(latest.cycleName || "--");
        setCycleStatus(latest.cycleStatus || "--");
      }
    }).catch(console.error);

    fetchGoalsByEmployee(employeeId).then((goals) => {
      if (goals) {
        setTotalGoals(goals.length);
        setGoalsInProgress(
          goals.filter((g: any) => g.status === "IN_PROGRESS").length
        );
      }
    }).catch(console.error);
  }, []);

  return (
    <div className="flex gap-3">
      <StatCard
        label="Self Rating"
        value={selfRating === "--" ? "--" : `${selfRating}/5`}
        status={appraisalStatus}
        statusColor="text-green-400"
      />
      <StatCard
        label="Goals"
        value={goalsInProgress}
        total={totalGoals}
        status="In Progress"
        statusColor="text-yellow-400"
      />
      <StatCard
        label="Cycle Status"
        value={cycleName}
        status={cycleStatus}
        statusColor="text-purple-400"
      />
    </div>
  );
};