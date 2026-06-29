import { useNavigate } from "react-router-dom";

const profile = {
  firstName: "Doremon",
  lastName: "",
  designation: "Team Lead",
  role: "Manager",
  department: "MERN Stack",
  manager: "Aarya Sharma",
  email: "doremon@gmail.com",
  phone: "9876543211",
  memberSince: "10 Jan 2023",
  userId: "#1005",
  lastUpdated: "12 Jun 2026",
  status: "Active",
};

const InfoField = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className="bg-[#16181f] border border-white/[0.04] rounded-xl px-4 py-3">
    <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-sm font-medium ${highlight ? "text-green-400" : "text-white"}`}>{value}</p>
  </div>
);

export default function ManagerProfile() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-[#6b7280] text-sm mt-1">View your account information</p>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-4">
        {/* Left Card */}
        <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-6 flex flex-col items-center gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-900/40">
            {profile.firstName[0]}{profile.lastName[0]}
          </div>

          {/* Name & Role */}
          <div className="text-center">
            <p className="text-white font-semibold text-base">{profile.firstName} {profile.lastName}</p>
            <p className="text-[#6b7280] text-sm mt-0.5">{profile.designation}</p>
            <span className="mt-2 inline-block bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-medium px-3 py-1 rounded-lg uppercase tracking-wider">
              {profile.role}
            </span>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/[0.06]" />

          {/* Contact Info */}
          <div className="w-full flex flex-col gap-3">
            <div>
              <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">Email</p>
              <p className="text-white text-sm">{profile.email}</p>
            </div>
            <div>
              <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">Phone</p>
              <p className="text-white text-sm">{profile.phone}</p>
            </div>
            <div>
              <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-1">Member Since</p>
              <p className="text-white text-sm">{profile.memberSince}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/[0.06]" />

          {/* Change Password */}
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] text-[#9ca3af] text-sm font-medium hover:bg-white/[0.04] transition-all">
            🔒 Change Password
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Logout
          </button>
        </div>

        {/* Right Cards */}
        <div className="flex flex-col gap-4">
          {/* Personal Information */}
          <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-5">
            <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-4">Personal Information</p>
            <div className="grid grid-cols-2 gap-3">
              <InfoField label="First Name" value={profile.firstName} />
              <InfoField label="Last Name" value={profile.lastName} />
              <InfoField label="Designation" value={profile.designation} />
              <InfoField label="Role" value={profile.role.toUpperCase()} />
              <InfoField label="Department" value={profile.department} />
              <InfoField label="Manager" value={profile.manager} />
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-[#1e2029] border border-white/[0.06] rounded-xl px-5 py-5">
            <p className="text-[#6b7280] text-xs uppercase tracking-widest mb-4">Account Information</p>
            <div className="grid grid-cols-2 gap-3">
              <InfoField label="User ID" value={profile.userId} />
              <InfoField label="Member Since" value={profile.memberSince} />
              <InfoField label="Last Updated" value={profile.lastUpdated} />
              <InfoField label="Status" value={profile.status} highlight />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}