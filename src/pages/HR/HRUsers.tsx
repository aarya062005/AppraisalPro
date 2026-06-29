import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

type Role = "HR" | "MANAGER" | "EMPLOYEE";

interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  designation: string;
  deptId: number;
  deptName: string;
  managerId: number;
  managerName: string;
  isActive: boolean;
}

interface Department {
  deptId: number;
  deptName: string;
}

interface Manager {
  userId: number;
  firstName: string;
  lastName: string;
}

const roleStyles: Record<Role, string> = {
  HR: "bg-red-500/10 text-red-400 border border-red-500/20",
  MANAGER: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  EMPLOYEE: "bg-green-500/10 text-green-400 border border-green-500/20",
};

export default function HRUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    role: "EMPLOYEE", designation: "", deptId: "", managerId: "", password: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [usersRes, deptsRes] = await Promise.all([
        axiosInstance.get("/api/users"),
        axiosInstance.get("/api/departments"),
      ]);
      setUsers(usersRes.data);
      setDepartments(deptsRes.data);
      setManagers(usersRes.data.filter((u: User) => u.role === "MANAGER"));
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeptsAndManagers = async () => {
    try {
      const [usersRes, deptsRes] = await Promise.all([
        axiosInstance.get("/api/users"),
        axiosInstance.get("/api/departments"),
      ]);
      setDepartments(deptsRes.data);
      setManagers(usersRes.data.filter((u: User) => u.role === "MANAGER"));
    } catch (err) {}
  };

  const openAddModal = () => {
    setShowModal(true);
    fetchDeptsAndManagers();
  };

  const filtered = users.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const matchSearch =
      fullName.includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.designation || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.deptName || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All roles" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleCreate = async () => {
    if (!form.firstName || !form.email) return;
    setCreating(true);
    try {
      await axiosInstance.post("/api/users", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        role: form.role,
        designation: form.designation,
        deptId: form.deptId ? Number(form.deptId) : null,
        managerId: form.managerId ? Number(form.managerId) : null,
        password: form.password || "Welcome@123",
      });
      await fetchAll();
      setForm({ firstName: "", lastName: "", email: "", phone: "", role: "EMPLOYEE", designation: "", deptId: "", managerId: "", password: "" });
      setShowModal(false);
    } catch (err: any) {
      alert(err.response?.data || "Failed to create user.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await axiosInstance.delete(`/api/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  const handleToggleStatus = async (userId: number, current: boolean) => {
    try {
      await axiosInstance.patch(`/api/users/${userId}/status?isActive=${!current}`);
      setUsers((prev) => prev.map((u) => u.userId === userId ? { ...u, isActive: !current } : u));
    } catch (err) {
      alert("Failed to update status.");
    }
  };

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-[#6b7280] text-sm mt-1">Manage all system users</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Add User
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/[0.06]">
          <div className="relative flex-1 max-w-md">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13 13l-2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, job title, department..."
              className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2 text-white placeholder-[#4b5563] text-sm outline-none focus:border-purple-500/50 transition-all"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#16181f] border border-white/[0.06] text-[#9ca3af] text-sm rounded-xl px-3 py-2 outline-none"
          >
            <option>All roles</option>
            <option>HR</option>
            <option>MANAGER</option>
            <option>EMPLOYEE</option>
          </select>
        </div>

        <div className="grid grid-cols-[1.5fr_2fr_1fr_1.5fr_1fr_1fr_1fr_1fr] px-5 py-3 border-b border-white/[0.06]">
          {["Name", "Email", "Role", "Job Title", "Department", "Manager", "Status", "Actions"].map((h) => (
            <span key={h} className="text-[#6b7280] text-xs uppercase tracking-widest font-medium">{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-[#6b7280]">No users found</div>
        ) : (
          filtered.map((user, index) => (
            <div
              key={user.userId}
              className={`grid grid-cols-[1.5fr_2fr_1fr_1.5fr_1fr_1fr_1fr_1fr] px-5 py-3.5 items-center hover:bg-white/[0.02] transition-all ${
                index !== filtered.length - 1 ? "border-b border-white/[0.04]" : ""
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                  {user.firstName.slice(0, 1)}{user.lastName?.slice(0, 1)}
                </div>
                <span className="text-white text-sm font-medium">{user.firstName} {user.lastName}</span>
              </div>
              <span className="text-[#9ca3af] text-sm truncate">{user.email}</span>
              <span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${roleStyles[user.role]}`}>
                  {user.role}
                </span>
              </span>
              <span className="text-[#9ca3af] text-sm">{user.designation || "—"}</span>
              <span className="text-[#9ca3af] text-sm">{user.deptName || "—"}</span>
              <span className="text-[#9ca3af] text-sm">{user.managerName || "—"}</span>
              <span>
                <button
                  onClick={() => handleToggleStatus(user.userId, user.isActive)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-all ${
                    user.isActive
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </button>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(user.userId)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#6b7280] hover:text-red-400 transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 3.5h10M5 3.5V2h4v1.5M5.5 6v4M8.5 6v4M3 3.5l.5 8h7l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add User Modal - scrollable and compact */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 py-6">
          <div className="bg-[#1e2029] border border-white/[0.08] rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            
            {/* Modal Header - fixed */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/[0.06]">
              <div>
                <h2 className="text-white text-base font-bold">Add User</h2>
                <p className="text-[#6b7280] text-xs mt-0.5">Create a new user account in the system.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-[#6b7280] hover:text-white">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Modal Body - scrollable */}
            <div className="overflow-y-auto px-6 py-4 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9ca3af] text-xs mb-1 block">First name</label>
                  <input type="text" value={form.firstName}
                    onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                    className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-purple-500/50 transition-all" />
                </div>
                <div>
                  <label className="text-[#9ca3af] text-xs mb-1 block">Last name</label>
                  <input type="text" value={form.lastName}
                    onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                    className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-purple-500/50 transition-all" />
                </div>
              </div>

              <div>
                <label className="text-[#9ca3af] text-xs mb-1 block">Email address</label>
                <input type="email" value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-purple-500/50 transition-all" />
              </div>

              <div>
                <label className="text-[#9ca3af] text-xs mb-1 block">Phone</label>
                <input type="text" value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-purple-500/50 transition-all" />
              </div>

              <div>
                <label className="text-[#9ca3af] text-xs mb-1 block">
                  Default Password <span className="text-[#4b5563]">(leave blank for Welcome@123)</span>
                </label>
                <input type="text" value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Enter password or leave blank"
                  className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-3 py-2 text-white placeholder-[#4b5563] text-sm outline-none focus:border-purple-500/50 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9ca3af] text-xs mb-1 block">Role</label>
                  <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                    className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-purple-500/50 transition-all">
                    <option>EMPLOYEE</option>
                    <option>MANAGER</option>
                    <option>HR</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#9ca3af] text-xs mb-1 block">Job title</label>
                  <input type="text" value={form.designation}
                    onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))}
                    className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-purple-500/50 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9ca3af] text-xs mb-1 block">Department</label>
                  <select value={form.deptId} onChange={(e) => setForm((p) => ({ ...p, deptId: e.target.value }))}
                    className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-purple-500/50 transition-all">
                    <option value="">Select department</option>
                    {departments.map((d) => <option key={d.deptId} value={d.deptId}>{d.deptName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[#9ca3af] text-xs mb-1 block">Manager (optional)</label>
                  <select value={form.managerId} onChange={(e) => setForm((p) => ({ ...p, managerId: e.target.value }))}
                    className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-purple-500/50 transition-all">
                    <option value="">No manager</option>
                    {managers.map((m) => <option key={m.userId} value={m.userId}>{m.firstName} {m.lastName}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer - fixed */}
            <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06]">
              <button onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] text-[#9ca3af] text-sm hover:bg-white/[0.04] transition-all">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={creating}
                className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all disabled:opacity-60">
                {creating ? "Creating..." : "Create user"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}