import { useEffect, useState } from "react";
import WelcomeHeader from "../components/Dashboard/WelcomeHeader";
import StatsCards from "../components/Dashboard/StatsCards";
import SelfAssessment from "../components/Dashboard/SelfAssessment";
import GoalsList from "../components/Dashboard/GoalsList";
import { fetchAppraisalsByEmployee, fetchGoalsByEmployee } from "../api/authApi";

export default function Dashboard() {
  const [overview, setOverview] = useState({
    cycleName: "--",
    closingDate: "--",
    manager: "--",
    department: "--",
    employeeId: "--",
  });
  const [deadlines, setDeadlines] = useState<any[]>([]);

  useEffect(() => {
    const employeeId = Number(localStorage.getItem("userId"));
    if (!employeeId) return;

    fetchAppraisalsByEmployee(employeeId).then((appraisals) => {
      if (appraisals?.length > 0) {
        const latest = appraisals[appraisals.length - 1];
        setOverview({
          cycleName: latest.cycleName || "--",
          closingDate: latest.cycleEndDate || "--",
          manager: latest.managerEmail || "--",
          department: "--", // not in DTO, add if available
          employeeId: `EMP-${String(employeeId).padStart(4, "0")}`,
        });
      }
    }).catch(console.error);

    fetchGoalsByEmployee(employeeId).then((goals) => {
      if (goals) {
        const sorted = goals
          .filter((g: any) => g.dueDate && g.status !== "COMPLETED")
          .sort((a: any, b: any) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          )
          .slice(0, 3)
          .map((g: any) => {
            const days = Math.ceil(
              (new Date(g.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            const color =
              days <= 7 ? "text-red-400" :
              days <= 14 ? "text-yellow-400" :
              days <= 20 ? "text-green-400" : "text-blue-400";
            return { title: g.title, date: g.dueDate, days, color };
          });
        setDeadlines(sorted);
      }
    }).catch(console.error);
  }, []);

  return (
    <div className="w-full grid grid-cols-[1fr_300px] gap-6">
      {/* Left Column */}
      <div className="flex flex-col gap-3">
        <WelcomeHeader />
        <StatsCards />
        <SelfAssessment />
        <GoalsList />
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-3 mt-[95px]">
        {/* Quick Overview */}
        <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-4">
          <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-3">Quick Overview</p>
          <div className="flex flex-col gap-2.5">
            {[
              { label: "Appraisal Cycle", value: overview.cycleName },
              { label: "Closing Date", value: overview.closingDate },
              { label: "Manager", value: overview.manager },
              { label: "Department", value: overview.department },
              { label: "Employee ID", value: overview.employeeId },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-[#6b7280] text-xs">{item.label}</span>
                <span className="text-white text-xs font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-4">
          <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-3">Upcoming Deadlines</p>
          <div className="flex flex-col gap-3">
            {deadlines.length === 0 ? (
              <p className="text-[#6b7280] text-xs text-center py-2">No upcoming deadlines</p>
            ) : (
              deadlines.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-xs font-medium">{item.title}</p>
                    <p className="text-[#6b7280] text-[10px] mt-0.5">{item.date}</p>
                  </div>
                  <span className={`text-xs font-bold ${item.color}`}>{item.days}d</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}