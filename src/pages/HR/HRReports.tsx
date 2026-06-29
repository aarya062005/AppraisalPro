import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

type AppraisalStatus = "PENDING" | "EMPLOYEE_DRAFT" | "SELF_SUBMITTED" | "MANAGER_DRAFT" | "MANAGER_REVIEWED" | "APPROVED" | "ACKNOWLEDGED";

type CycleReport = {
  cycleName: string;
  totalAppraisals: number;
  acknowledged: number;
  completion: number;
  pendingAction: number;
  avgSelfRating: number;
  avgManagerRating: number;
  statusBreakdown: Record<string, number>;
};

type CycleDetail = {
  appraisalId: number;
  employeeEmail: string;
  managerEmail: string;
  deptName: string;
  appraisalStatus: AppraisalStatus;
  selfRating: number;
  managerRating: number;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-[#374151]",
  EMPLOYEE_DRAFT: "bg-amber-400",
  SELF_SUBMITTED: "bg-blue-400",
  MANAGER_DRAFT: "bg-orange-400",
  MANAGER_REVIEWED: "bg-purple-400",
  APPROVED: "bg-green-400",
  ACKNOWLEDGED: "bg-purple-500",
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-[#2a2d3a] text-[#9ca3af] border border-white/[0.08]",
  EMPLOYEE_DRAFT: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  SELF_SUBMITTED: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  MANAGER_DRAFT: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  MANAGER_REVIEWED: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  APPROVED: "bg-green-500/10 text-green-400 border border-green-500/20",
  ACKNOWLEDGED: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  EMPLOYEE_DRAFT: "Employee Draft",
  SELF_SUBMITTED: "Self Submitted",
  MANAGER_DRAFT: "Manager Draft",
  MANAGER_REVIEWED: "Manager_Reviewed",
  APPROVED: "Approved",
  ACKNOWLEDGED: "Acknowledged",
};

const ALL_STATUSES = Object.keys(STATUS_LABELS);

export default function HRReports() {
  const [cycles, setCycles] = useState<string[]>([]);
  const [selectedCycle, setSelectedCycle] = useState("");
  const [report, setReport] = useState<CycleReport | null>(null);
  const [details, setDetails] = useState<CycleDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const res = await axiosInstance.get("/api/reports/cycles");
        setCycles(res.data);
        if (res.data.length > 0) setSelectedCycle(res.data[0]);
      } catch (err) {
        setError("Failed to load cycles.");
      } finally {
        setLoading(false);
      }
    };
    fetchCycles();
  }, []);

  useEffect(() => {
    if (!selectedCycle) return;
    const fetchReport = async () => {
      try {
        const [reportRes, detailsRes] = await Promise.all([
          axiosInstance.get(`/api/reports/cycle/${selectedCycle}`),
          axiosInstance.get(`/api/reports/cycle/${selectedCycle}/details`),
        ]);
        setReport(reportRes.data);
        setDetails(detailsRes.data);
      } catch (err) {
        setError("Failed to load report.");
      }
    };
    fetchReport();
  }, [selectedCycle]);

  const pendingActions = details.filter((d) => d.appraisalStatus !== "ACKNOWLEDGED");
  const rated = details.filter((d) => d.selfRating && d.selfRating > 0);

  // Rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: details.filter((d) => d.selfRating === r).length,
  }));

  // By Department
  const departments = [...new Set(details.map((d) => d.deptName))];
  const deptStats = departments.map((dept) => {
    const deptDetails = details.filter((d) => d.deptName === dept);
    const completed = deptDetails.filter((d) => d.appraisalStatus === "ACKNOWLEDGED").length;
    const pending = deptDetails.length - completed;
    const deptRated = deptDetails.filter((d) => d.selfRating && d.selfRating > 0);
    const deptAvg = deptRated.length > 0
      ? (deptRated.reduce((s, d) => s + d.selfRating, 0) / deptRated.length).toFixed(1)
      : "—";
    const progress = Math.round((completed / deptDetails.length) * 100);
    return { dept, employees: deptDetails.length, completed, pending, avgRating: deptAvg, progress };
  });

  if (loading) return (
    <div className="w-full flex items-center justify-center h-64">
      <p className="text-[#6b7280]">Loading...</p>
    </div>
  );

  if (error) return (
    <div className="w-full flex items-center justify-center h-64">
      <p className="text-red-400">{error}</p>
    </div>
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-[#6b7280] text-sm mt-1">Cycle analytics and performance insights</p>
      </div>

      {/* Cycle Selector */}
      <div className="mb-6">
        <label className="text-[#6b7280] text-xs uppercase tracking-widest mb-2 block">Select Cycle</label>
        <select
          value={selectedCycle}
          onChange={(e) => setSelectedCycle(e.target.value)}
          className="bg-[#1e2029] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-purple-500/50 transition-all w-48"
        >
          {cycles.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {report && (
        <>
          {/* Cycle Overview */}
          <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-3">
            Cycle Overview — {selectedCycle}
          </p>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Appraisals", value: report.totalAppraisals },
              { label: "Completion", value: `${report.completion}%` },
              { label: "Pending Action", value: report.pendingAction },
              { label: "Avg Rating", value: report.avgSelfRating > 0 ? `${report.avgSelfRating.toFixed(1)}/5` : "—" },
            ].map((stat) => (
              <div key={stat.label} className="bg-purple-500/[0.08] border border-purple-500/20 rounded-xl px-5 py-4">
                <p className="text-purple-300/80 text-xs uppercase tracking-widest mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-purple-400">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Status Breakdown */}
          <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-6 py-5 mb-4">
            <p className="text-white text-sm font-semibold mb-4">Status Breakdown</p>
            <div className="flex flex-col gap-3">
              {ALL_STATUSES.map((status) => {
                const count = report.statusBreakdown[status] || 0;
                const maxCount = Math.max(...Object.values(report.statusBreakdown), 1);
                return (
                  <div key={status} className="flex items-center gap-4">
                    <span className="text-[#9ca3af] text-sm w-40 flex-shrink-0">{STATUS_LABELS[status]}</span>
                    <div className="flex-1 bg-[#2a2d3a] rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${STATUS_COLORS[status]} transition-all`}
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-[#9ca3af] text-sm w-4 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-6 py-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white text-sm font-semibold">Rating Distribution</p>
              <p className="text-[#6b7280] text-xs">
                {rated.length} rated · avg {report.avgSelfRating > 0 ? report.avgSelfRating.toFixed(1) : "—"}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {ratingCounts.map(({ rating, count }) => (
                <div key={rating} className="flex items-center gap-4">
                  <span className="text-[#9ca3af] text-sm w-8 flex-shrink-0">{rating} ★</span>
                  <div className="flex-1 bg-[#2a2d3a] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-purple-500 transition-all"
                      style={{ width: `${rated.length > 0 ? (count / rated.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-[#9ca3af] text-sm w-4 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By Department */}
          <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl overflow-hidden mb-4">
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <p className="text-white text-sm font-semibold">By Department</p>
            </div>
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1.5fr] px-6 py-3 border-b border-white/[0.06]">
              {["Department", "Employees", "Completed", "Pending", "Avg Rating", "Progress"].map((h) => (
                <span key={h} className="text-[#6b7280] text-xs uppercase tracking-widest font-medium">{h}</span>
              ))}
            </div>
            {deptStats.length === 0 ? (
              <div className="px-6 py-8 text-center text-[#6b7280] text-sm">No department data.</div>
            ) : (
              deptStats.map((d, index) => (
                <div
                  key={d.dept}
                  className={`grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1.5fr] px-6 py-4 items-center hover:bg-white/[0.02] transition-all ${
                    index !== deptStats.length - 1 ? "border-b border-white/[0.04]" : ""
                  }`}
                >
                  <span className="text-white text-sm font-medium">{d.dept}</span>
                  <span className="text-[#9ca3af] text-sm">{d.employees}</span>
                  <span className="text-[#9ca3af] text-sm">{d.completed}</span>
                  <span className="text-[#9ca3af] text-sm">{d.pending}</span>
                  <span className="text-[#9ca3af] text-sm">{d.avgRating}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[#2a2d3a] rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full bg-purple-500" style={{ width: `${d.progress}%` }} />
                    </div>
                    <span className="text-[#6b7280] text-xs">{d.progress}%</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pending Actions */}
          <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <p className="text-white text-sm font-semibold">Pending Actions</p>
              <p className="text-[#6b7280] text-xs">{pendingActions.length} not yet acknowledged</p>
            </div>
            <div className="grid grid-cols-[2fr_2fr_1.5fr_1.5fr] px-6 py-3 border-b border-white/[0.06]">
              {["Employee", "Manager", "Department", "Current Status"].map((h) => (
                <span key={h} className="text-[#6b7280] text-xs uppercase tracking-widest font-medium">{h}</span>
              ))}
            </div>
            {pendingActions.length === 0 ? (
              <div className="px-6 py-10 text-center text-[#6b7280] text-sm">
                All appraisals acknowledged! 🎉
              </div>
            ) : (
              pendingActions.map((a, index) => (
                <div
                  key={a.appraisalId}
                  className={`grid grid-cols-[2fr_2fr_1.5fr_1.5fr] px-6 py-4 items-center hover:bg-white/[0.02] transition-all ${
                    index !== pendingActions.length - 1 ? "border-b border-white/[0.04]" : ""
                  }`}
                >
                  <span className="text-white text-sm font-medium">{a.employeeEmail}</span>
                  <span className="text-[#9ca3af] text-sm">{a.managerEmail}</span>
                  <span className="text-[#9ca3af] text-sm">{a.deptName}</span>
                  <span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${STATUS_BADGE[a.appraisalStatus]}`}>
                      {STATUS_LABELS[a.appraisalStatus]}
                    </span>
                  </span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}