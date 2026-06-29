import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

type AppraisalStatus = "PENDING" | "EMPLOYEE_DRAFT" | "SELF_SUBMITTED" | "MANAGER_DRAFT" | "MANAGER_REVIEWED" | "APPROVED" | "ACKNOWLEDGED";

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
  PENDING: "bg-white/[0.06] text-[#9ca3af] border-white/[0.08]",
  EMPLOYEE_DRAFT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  SELF_SUBMITTED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  MANAGER_DRAFT: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  MANAGER_REVIEWED: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  APPROVED: "bg-green-500/10 text-green-400 border-green-500/20",
  ACKNOWLEDGED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  EMPLOYEE_DRAFT: "Employee Draft",
  SELF_SUBMITTED: "Self Submitted",
  MANAGER_DRAFT: "Manager Draft",
  MANAGER_REVIEWED: "Manager Reviewed",
  APPROVED: "Approved",
  ACKNOWLEDGED: "Acknowledged",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status] || "bg-white/[0.06] text-[#9ca3af] border-white/[0.08]"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11.5 11.5L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12M5.5 4V2.5a1 1 0 011-1h3a1 1 0 011 1V4M6.5 7.5v4M9.5 7.5v4M3.5 4l.6 8.4a1 1 0 001 .9h5.8a1 1 0 001-.9L13.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function FilterSelect({ label, options, value, onChange }: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[#2a2d3a] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#9ca3af] outline-none focus:border-purple-500/60"
    >
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export default function HRAppraisals() {
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cycleFilter, setCycleFilter] = useState("");

  useEffect(() => {
    fetchAppraisals();
  }, []);

  const fetchAppraisals = async () => {
    try {
      const res = await axiosInstance.get("/api/appraisals");
      setAppraisals(res.data);
    } catch (err) {
      setError("Failed to load appraisals.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await axiosInstance.patch(`/api/appraisals/${id}/approve`);
      await fetchAppraisals();
    } catch (err) {
      alert("Failed to approve appraisal.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Remove this appraisal record?")) return;
    try {
      await axiosInstance.delete(`/api/appraisals/${id}`);
      setAppraisals((prev) => prev.filter((a) => a.appraisalId !== id));
    } catch (err) {
      alert("Failed to delete appraisal.");
    }
  };

  const uniqueCycles = [...new Set(appraisals.map((a) => a.cycleName))];

  const filtered = appraisals.filter((a) => {
    const q = search.trim().toLowerCase();
    const searchOk = !q ||
      a.employeeEmail.toLowerCase().includes(q) ||
      a.managerEmail.toLowerCase().includes(q) ||
      a.cycleName.toLowerCase().includes(q);
    const statusOk = !statusFilter || a.appraisalStatus === statusFilter;
    const cycleOk = !cycleFilter || a.cycleName === cycleFilter;
    return searchOk && statusOk && cycleOk;
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
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Manage Appraisals</h1>
          <p className="text-[#6b7280] text-sm mt-1">View and manage all appraisal cycles</p>
        </div>
        <Link
          to="/hr/create-appraisal"
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
        >
          <span className="text-lg leading-none">+</span> Create Appraisal
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-3 mb-6">
        {[
          { label: "Total", value: appraisals.length, color: "text-white" },
          { label: "Pending", value: appraisals.filter(a => a.appraisalStatus === "PENDING").length, color: "text-[#9ca3af]" },
          { label: "Self Submitted", value: appraisals.filter(a => a.appraisalStatus === "SELF_SUBMITTED").length, color: "text-blue-400" },
          { label: "Mgr Reviewed", value: appraisals.filter(a => a.appraisalStatus === "MANAGER_REVIEWED").length, color: "text-teal-400" },
          { label: "Approved", value: appraisals.filter(a => a.appraisalStatus === "APPROVED").length, color: "text-green-400" },
          { label: "Acknowledged", value: appraisals.filter(a => a.appraisalStatus === "ACKNOWLEDGED").length, color: "text-purple-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-4 py-3">
            <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5 bg-[#1e2029] border border-white/[0.06] rounded-xl px-4 py-2.5 flex-1 min-w-[240px]">
          <span className="text-[#6b7280]"><SearchIcon /></span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee, manager, cycle..."
            className="bg-transparent text-sm text-white placeholder:text-[#6b7280] outline-none w-full"
          />
        </div>
        <FilterSelect
          label="All Statuses"
          options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <FilterSelect
          label="All Cycles"
          options={uniqueCycles.map((c) => ({ value: c, label: c }))}
          value={cycleFilter}
          onChange={setCycleFilter}
        />
      </div>

      {/* Table */}
      <div className="bg-[#1e2029] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#6b7280] text-xs uppercase tracking-wider">
                <th className="text-left font-medium px-5 py-3">Employee</th>
                <th className="text-left font-medium px-5 py-3">Manager</th>
                <th className="text-left font-medium px-5 py-3">Cycle</th>
                <th className="text-left font-medium px-5 py-3">Cycle Status</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="text-left font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#6b7280] text-sm">
                    No appraisals match your filters.
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
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(row.appraisalId)}
                          disabled={row.appraisalStatus !== "MANAGER_REVIEWED"}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            row.appraisalStatus !== "MANAGER_REVIEWED"
                              ? "border-white/[0.06] text-[#4b5563] cursor-not-allowed"
                              : "border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300"
                          }`}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDelete(row.appraisalId)}
                          className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/[0.08] text-[#9ca3af] hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all"
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