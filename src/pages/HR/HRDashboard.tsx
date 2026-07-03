import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

type AppraisalStatus = "EMPLOYEE_DRAFT" | "SELF_SUBMITTED" | "MANAGER_DRAFT" | "MANAGER_REVIEWED" | "ACKNOWLEDGED" | "APPROVED" | "PENDING";

type Appraisal = {
  appraisalId: number;
  cycleName: string;
  cycleStartDate: string;
  cycleEndDate: string;
  cycleStatus: string;
  employeeEmail: string;
  managerEmail: string;
  appraisalStatus: AppraisalStatus;
  createdAt: string;
};

const STATUS_STYLES: Record<string, string> = {
  SELF_SUBMITTED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ACKNOWLEDGED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  EMPLOYEE_DRAFT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  MANAGER_DRAFT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  MANAGER_REVIEWED: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  PENDING: "bg-white/[0.06] text-[#9ca3af] border-white/[0.08]",
  APPROVED: "bg-green-500/10 text-green-400 border-green-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  SELF_SUBMITTED: "Self Submitted",
  ACKNOWLEDGED: "Acknowledged",
  EMPLOYEE_DRAFT: "Employee Draft",
  MANAGER_DRAFT: "Manager Draft",
  MANAGER_REVIEWED: "Manager Reviewed",
  PENDING: "Pending",
  APPROVED: "Approved",
};

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12M5.5 4V2.5a1 1 0 011-1h3a1 1 0 011 1V4M6.5 7.5v4M9.5 7.5v4M3.5 4l.6 8.4a1 1 0 001 .9h5.8a1 1 0 001-.9L13.5 4"
      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status] || "bg-white/[0.06] text-[#9ca3af] border-white/[0.08]"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function FilterSelect({ label, options, value, onChange }: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[#2a2d3a] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-[#9ca3af] outline-none focus:border-purple-500/60"
    >
      <option>{label}</option>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

export default function HRDashboard() {
  const navigate = useNavigate();
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [activeEmployees, setActiveEmployees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [cycleFilter, setCycleFilter] = useState("All cycles");

  const fetchData = async () => {
    try {
      const [appraisalsRes, usersRes] = await Promise.all([
        axiosInstance.get("/api/appraisals"),
        axiosInstance.get("/api/users"),
      ]);
      setAppraisals(appraisalsRes.data);
      const active = usersRes.data.filter((u: any) => u.isActive).length;
      setActiveEmployees(active);
    } catch (err) {
      setError("Failed to load data. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: number) => {
    if (!window.confirm("Approve this appraisal?")) return;
    try {
      await axiosInstance.patch(`/api/appraisals/${id}/approve`);
      await fetchData();
    } catch {
      alert("Failed to approve. Appraisal must be in MANAGER_REVIEWED status.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this appraisal? This cannot be undone.")) return;
    try {
      await axiosInstance.delete(`/api/appraisals/${id}`);
      setAppraisals((prev) => prev.filter((a) => a.appraisalId !== id));
    } catch {
      alert("Cannot delete — only PENDING appraisals can be deleted.");
    }
  };

  const filtered = appraisals.filter((a) => {
    const statusOk = statusFilter === "All statuses" || a.appraisalStatus === statusFilter;
    const cycleOk = cycleFilter === "All cycles" || a.cycleName === cycleFilter;
    return statusOk && cycleOk;
  });

  const uniqueCycles = [...new Set(appraisals.map((a) => a.cycleName))];
  const pendingApprovalCount = appraisals.filter((a) => a.appraisalStatus === "MANAGER_REVIEWED").length;
  const approvedCount = appraisals.filter((a) => a.appraisalStatus === "APPROVED" || a.appraisalStatus === "ACKNOWLEDGED").length;

  const STATS = [
    { label: "Active Employees", value: activeEmployees },
    { label: "Total Appraisals", value: appraisals.length },
    { label: "Pending Approval", value: pendingApprovalCount },
    { label: "Completed", value: approvedCount },
  ];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center h-64">
        <p className="text-[#6b7280]">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center h-64">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold tracking-tight">HR Dashboard</h1>
        <p className="text-[#6b7280] text-sm mt-1">Overview of all appraisals and employees</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {STATS.map((s) => (
          <div key={s.label} className="bg-purple-500/[0.08] border border-purple-500/20 rounded-2xl p-5">
            <p className="text-purple-300/80 text-xs font-medium uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-white text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Appraisals table */}
      <div className="bg-[#1e2029] border border-white/[0.06] rounded-2xl">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/[0.06] flex-wrap">
          <p className="text-white text-sm font-semibold">
            All Appraisals{" "}
            <span className="text-[#6b7280] font-normal">{filtered.length} of {appraisals.length}</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            <FilterSelect
              label="All statuses"
              options={Object.keys(STATUS_LABELS)}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <FilterSelect
              label="All cycles"
              options={uniqueCycles}
              value={cycleFilter}
              onChange={setCycleFilter}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#6b7280] text-xs uppercase tracking-wider">
                <th className="text-left font-medium px-5 py-3">Employee</th>
                <th className="text-left font-medium px-5 py-3">Manager</th>
                <th className="text-left font-medium px-5 py-3">Cycle</th>
                <th className="text-left font-medium px-5 py-3">Cycle Status</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="text-left font-medium px-5 py-3">Created</th>
                <th className="text-left font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-[#6b7280]">
                    No appraisals found
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.appraisalId} className="border-t border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5 text-white font-medium">{row.employeeEmail}</td>
                    <td className="px-5 py-3.5 text-[#9ca3af]">{row.managerEmail}</td>
                    <td className="px-5 py-3.5 text-[#9ca3af]">{row.cycleName}</td>
                    <td className="px-5 py-3.5 text-[#9ca3af]">{row.cycleStatus}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={row.appraisalStatus} />
                    </td>
                    <td className="px-5 py-3.5 text-[#9ca3af]">{formatDate(row.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {/* Approve — only active when MANAGER_REVIEWED */}
                        <button
                          onClick={() => handleApprove(row.appraisalId)}
                          disabled={row.appraisalStatus !== "MANAGER_REVIEWED"}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            row.appraisalStatus === "MANAGER_REVIEWED"
                              ? "border-green-500/30 text-green-400 hover:bg-green-500/10 cursor-pointer"
                              : "border-white/[0.06] text-[#4b5563] cursor-not-allowed"
                          }`}
                        >
                          Approve
                        </button>
                        {/* Delete — only allowed on PENDING appraisals */}
                        <button
                          onClick={() => handleDelete(row.appraisalId)}
                          disabled={row.appraisalStatus !== "PENDING"}
                          className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                            row.appraisalStatus === "PENDING"
                              ? "border-white/[0.08] text-[#9ca3af] hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 cursor-pointer"
                              : "border-white/[0.04] text-[#374151] cursor-not-allowed"
                          }`}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}