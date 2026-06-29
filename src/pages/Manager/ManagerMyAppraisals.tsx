import { useState } from "react";
import { useNavigate } from "react-router-dom";

const appraisals = [
  { id: 1, cycle: "FY-2026", reviewer: "Aarya Sharma", period: "Mar 31 — Mar 31, 2027", status: "Draft" },
  { id: 2, cycle: "FY-2028", reviewer: "Aarya Sharma", period: "Jan 1 — Dec 1, 2028", status: "Pending" },
];

const statusStyles: Record<string, string> = {
  Draft: "bg-[#2a2d3a] text-[#6b7280] border border-white/[0.06]",
  Pending: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  Submitted: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  Acknowledged: "bg-green-500/10 text-green-400 border border-green-500/20",
};

const allStatuses = ["All statuses", "Draft", "Pending", "Submitted", "Acknowledged"];
const allCycles = ["All cycles", "FY-2026", "FY-2028"];

export default function ManagerMyAppraisals() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [cycleFilter, setCycleFilter] = useState("All cycles");

  const filtered = appraisals.filter((a) => {
    const matchStatus = statusFilter === "All statuses" || a.status === statusFilter;
    const matchCycle = cycleFilter === "All cycles" || a.cycle === cycleFilter;
    return matchStatus && matchCycle;
  });

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">My Appraisals</h1>
          <p className="text-[#6b7280] text-sm mt-1">
            Your own appraisal cycles — as an employee reporting to Aarya Sharma
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1e2029] border border-white/[0.06] text-[#9ca3af] text-sm rounded-xl px-3 py-2 outline-none hover:border-purple-500/30 transition-all"
          >
            {allStatuses.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            className="bg-[#1e2029] border border-white/[0.06] text-[#9ca3af] text-sm rounded-xl px-3 py-2 outline-none hover:border-purple-500/30 transition-all"
          >
            {allCycles.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Appraisal Cards */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-12 text-center">
            <p className="text-[#6b7280] text-sm">No appraisals found.</p>
          </div>
        ) : (
          filtered.map((appraisal) => (
            <div
              key={appraisal.id}
              className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-4 flex items-center justify-between hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-semibold">{appraisal.cycle}</p>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-lg ${statusStyles[appraisal.status]}`}>
                      {appraisal.status}
                    </span>
                  </div>
                  <p className="text-[#6b7280] text-xs mt-1">
                    Reviewed by: <span className="text-[#9ca3af]">{appraisal.reviewer}</span>
                    <span className="mx-2">·</span>
                    {appraisal.period}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/manager/my-appraisals/${appraisal.id}`)}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all"
              >
                Fill Self Assessment
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}