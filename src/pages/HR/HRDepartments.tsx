import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

interface Department {
  deptId: number;
  deptName: string;
  deptDescription: string;
  employeeCount: number;
}

export default function HRDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ deptName: "", deptDescription: "" });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const res = await axiosInstance.get("/api/departments");
      setDepartments(res.data);
    } catch (err) {
      setError("Failed to load departments.");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditing(null);
    setForm({ deptName: "", deptDescription: "" });
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (dept: Department) => {
    setEditing(dept);
    setForm({ deptName: dept.deptName, deptDescription: dept.deptDescription || "" });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.deptName.trim()) {
      setFormError("Department name is required.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        await axiosInstance.put(`/api/departments/${editing.deptId}`, form);
      } else {
        await axiosInstance.post("/api/departments", form);
      }
      await fetchAll();
      setShowModal(false);
    } catch (err: any) {
      setFormError(err.response?.data || "Failed to save department.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (deptId: number) => {
    if (!confirm("Are you sure you want to delete this department?")) return;
    try {
      await axiosInstance.delete(`/api/departments/${deptId}`);
      setDepartments((prev) => prev.filter((d) => d.deptId !== deptId));
    } catch (err) {
      alert("Failed to delete department.");
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
          <h1 className="text-white text-2xl font-bold tracking-tight">Departments</h1>
          <p className="text-[#6b7280] text-sm mt-1">Manage company departments</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Add Department
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl">
        {/* Table Header */}
        <div className="grid grid-cols-[2fr_3fr_1fr_1fr] px-5 py-3 border-b border-white/[0.06]">
          {["Department", "Description", "Employees", "Actions"].map((h) => (
            <span key={h} className="text-[#6b7280] text-xs uppercase tracking-widest font-medium">{h}</span>
          ))}
        </div>

        {/* Rows */}
        {departments.length === 0 ? (
          <div className="px-5 py-10 text-center text-[#6b7280]">No departments found</div>
        ) : (
          departments.map((dept, index) => (
            <div
              key={dept.deptId}
              className={`grid grid-cols-[2fr_3fr_1fr_1fr] px-5 py-3.5 items-center hover:bg-white/[0.02] transition-all ${
                index !== departments.length - 1 ? "border-b border-white/[0.04]" : ""
              }`}
            >
              <span className="text-white text-sm font-medium">{dept.deptName}</span>
              <span className="text-[#9ca3af] text-sm truncate">{dept.deptDescription || "—"}</span>
              <span className="text-[#9ca3af] text-sm">{dept.employeeCount}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(dept)}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#6b7280] hover:text-white transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M11 2l3 3-8 8-3.5.5.5-3.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(dept.deptId)}
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#1e2029] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-white text-lg font-bold">{editing ? "Edit Department" : "Add Department"}</h2>
              <button onClick={() => setShowModal(false)} className="text-[#6b7280] hover:text-white">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <p className="text-[#6b7280] text-sm mb-5">
              {editing ? "Update this department's details." : "Create a new department in the system."}
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[#9ca3af] text-sm mb-1.5 block">Department name</label>
                <input
                  type="text"
                  value={form.deptName}
                  onChange={(e) => setForm((p) => ({ ...p, deptName: e.target.value }))}
                  className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500/50 transition-all"
                />
              </div>
              <div>
                <label className="text-[#9ca3af] text-sm mb-1.5 block">Description</label>
                <textarea
                  rows={3}
                  value={form.deptDescription}
                  onChange={(e) => setForm((p) => ({ ...p, deptDescription: e.target.value }))}
                  className="w-full bg-[#16181f] border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500/50 transition-all resize-none"
                />
              </div>
            </div>

            {formError && (
              <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] text-[#9ca3af] text-sm hover:bg-white/[0.04] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all disabled:opacity-60"
              >
                {saving ? "Saving..." : editing ? "Save changes" : "Create department"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}