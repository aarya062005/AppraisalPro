import { useEffect, useState } from "react";
import { fetchAppraisalsByEmployee } from "../../api/authApi";

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function SelfAssessment() {
  const [reviewer, setReviewer] = useState("--");
  const [status, setStatus] = useState<"Submitted" | "Pending" | "In Review">("Pending");

  useEffect(() => {
    const employeeId = Number(localStorage.getItem("userId"));
    if (!employeeId) return;

    fetchAppraisalsByEmployee(employeeId).then((appraisals) => {
      if (appraisals?.length > 0) {
        const latest = appraisals[appraisals.length - 1];
        setReviewer(latest.managerEmail || "--");

        const s = latest.appraisalStatus;
        if (s === "APPROVED" || s === "ACKNOWLEDGED") setStatus("Submitted");
        else if (s === "SELF_SUBMITTED" || s === "MANAGER_DRAFT" || s === "MANAGER_REVIEWED") setStatus("In Review");
        else setStatus("Pending");
      }
    }).catch(console.error);
  }, []);

  const statusStyles = {
    Submitted: "bg-green-500/10 text-green-400 border border-green-500/20",
    Pending: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    "In Review": "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  };

  return (
    <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-4 flex items-center justify-between mb-6">
      <div className="flex flex-col gap-1">
        <span className="text-white text-sm font-semibold">Self Assessment</span>
        <span className="text-[#6b7280] text-xs">Awaiting review · {reviewer}</span>
      </div>
      <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg ${statusStyles[status]}`}>
        {status === "Submitted" && <CheckIcon />}
        {status}
      </span>
    </div>
  );
}