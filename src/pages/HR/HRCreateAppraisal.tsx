import { useState, useEffect } from "react";
import { User, Building2, Users } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

type Mode = "single" | "department" | "all";

interface Employee {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  managerId: number;
  deptId: number;
}

interface Department {
  deptId: number;
  deptName: string;
}

const MODES: { id: Mode; icon: typeof User; title: string; subtitle: string }[] = [
  { id: "single", icon: User, title: "Single Employee", subtitle: "One specific employee" },
  { id: "department", icon: Building2, title: "By Department", subtitle: "All employees in a dept" },
  { id: "all", icon: Users, title: "All Employees", subtitle: "Every active employee" },
];

const CYCLES = ["FY-2026", "FY-2027", "FY-2028", "Q1-2026", "Q2-2026"];

export default function HRCreateAppraisal() {
  const [mode, setMode] = useState<Mode>("single");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [cycle, setCycle] = useState("");
  const [cycleStartDate, setCycleStartDate] = useState("");
  const [cycleEndDate, setCycleEndDate] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, deptsRes] = await Promise.all([
          axiosInstance.get("/api/users"),
          axiosInstance.get("/api/departments"),
        ]);
        // include employees AND managers (managers are also appraised by their own manager)
        setEmployees(usersRes.data.filter((u: any) => u.role === "EMPLOYEE" || u.role === "MANAGER"));
        setDepartments(deptsRes.data);
      } catch (err) {
        setErrorMsg("Failed to load data.");
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    setSuccessMsg("");
    setErrorMsg("");

    if (!cycle || !cycleStartDate || !cycleEndDate) {
      setErrorMsg("Please fill in cycle name, start date and end date.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "single") {
        if (!employeeId) { setErrorMsg("Please select an employee."); setLoading(false); return; }
        const emp = employees.find((e) => e.userId === Number(employeeId));
        await axiosInstance.post("/api/appraisals", {
          cycleName: cycle,
          cycleStartDate,
          cycleEndDate,
          employeeId: Number(employeeId),
          managerId: emp?.managerId || null,
        });
        setSuccessMsg(`Appraisal created successfully!`);

      } else if (mode === "department") {
        if (!departmentId) { setErrorMsg("Please select a department."); setLoading(false); return; }
        const deptEmployees = employees.filter((e) => e.deptId === Number(departmentId));
        if (deptEmployees.length === 0) { setErrorMsg("No employees found in this department."); setLoading(false); return; }
        await Promise.all(deptEmployees.map((emp) =>
          axiosInstance.post("/api/appraisals", {
            cycleName: cycle,
            cycleStartDate,
            cycleEndDate,
            employeeId: emp.userId,
            managerId: emp.managerId || null,
          })
        ));
        setSuccessMsg(`Appraisals created for ${deptEmployees.length} employees!`);

      } else {
        // all employees
        await Promise.all(employees.map((emp) =>
          axiosInstance.post("/api/appraisals", {
            cycleName: cycle,
            cycleStartDate,
            cycleEndDate,
            employeeId: emp.userId,
            managerId: emp.managerId || null,
          })
        ));
        setSuccessMsg(`Appraisals created for all ${employees.length} employees!`);
      }

      // reset form
      setEmployeeId("");
      setDepartmentId("");
      setCycle("");
      setCycleStartDate("");
      setCycleEndDate("");
      setTimeout(() => setSuccessMsg(""), 4000);

    } catch (err: any) {
      setErrorMsg(err.response?.data || "Failed to create appraisal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold tracking-tight">Create Appraisal</h1>
        <p className="text-[#6b7280] text-sm mt-1">Start a new appraisal cycle</p>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {MODES.map(({ id, icon: Icon, title, subtitle }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              onClick={() => { setMode(id); setSuccessMsg(""); setErrorMsg(""); }}
              className={`text-left rounded-2xl border px-5 py-4 transition-all ${
                active ? "bg-purple-600 border-purple-600" : "bg-[#1e2029] border-white/[0.06] hover:border-white/[0.12]"
              }`}
            >
              <Icon size={18} className={active ? "text-white" : "text-purple-400"} />
              <p className="mt-2 text-sm font-semibold text-white">{title}</p>
              <p className={`text-xs mt-0.5 ${active ? "text-white/70" : "text-[#6b7280]"}`}>{subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Form */}
      <div className="bg-[#1e2029] border border-white/[0.06] rounded-2xl p-6 max-w-md">
        {mode === "all" && (
          <div className="bg-purple-500/[0.08] border border-purple-500/20 rounded-xl px-4 py-3 mb-5 text-sm text-purple-300">
            This creates one appraisal for every active employee company-wide.
          </div>
        )}

        {mode === "single" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1.5">Employee</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full bg-[#2a2d3a] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/60"
            >
              <option value="">Select employee</option>
              {employees.map((e) => (
                <option key={e.userId} value={e.userId}>
                  {e.firstName} {e.lastName}
                </option>
              ))}
            </select>
          </div>
        )}

        {mode === "department" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1.5">Department</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full bg-[#2a2d3a] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/60"
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.deptId} value={d.deptId}>{d.deptName}</option>
              ))}
            </select>
          </div>
        )}

        {/* Cycle name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-1.5">Cycle Name</label>
          <select
            value={cycle}
            onChange={(e) => setCycle(e.target.value)}
            className="w-full bg-[#2a2d3a] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/60"
          >
            <option value="">Select cycle</option>
            {CYCLES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Start + End date */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">Start Date</label>
            <input
              type="date"
              value={cycleStartDate}
              onChange={(e) => setCycleStartDate(e.target.value)}
              className="w-full bg-[#2a2d3a] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">End Date</label>
            <input
              type="date"
              value={cycleEndDate}
              onChange={(e) => setCycleEndDate(e.target.value)}
              className="w-full bg-[#2a2d3a] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/60"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-3 rounded-xl transition-all disabled:opacity-60"
        >
          {loading ? "Creating..." : mode === "single" ? "Create Appraisal" : mode === "department" ? "Create for Department" : "Create for All Employees"}
        </button>

        {successMsg && (
          <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-sm text-green-400">
            ✅ {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
            ❌ {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}