import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const BarChartIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="14" width="5" height="10" rx="1.5" fill="white" opacity="0.9"/>
    <rect x="11.5" y="9" width="5" height="15" rx="1.5" fill="white"/>
    <rect x="19" y="4" width="5" height="20" rx="1.5" fill="white" opacity="0.7"/>
  </svg>
);

const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="14" height="10" rx="2" stroke="#6b7280" strokeWidth="1.4"/>
    <path d="M2 6.5l7 4.5 7-4.5" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const EyeIcon = ({ show }: { show: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    {show ? (
      <>
        <path d="M1 9C1 9 4 3.5 9 3.5S17 9 17 9s-3 5.5-8 5.5S1 9 1 9z" stroke="#6b7280" strokeWidth="1.4"/>
        <circle cx="9" cy="9" r="2.2" stroke="#6b7280" strokeWidth="1.4"/>
      </>
    ) : (
      <>
        <path d="M1 9C1 9 4 3.5 9 3.5S17 9 17 9s-3 5.5-8 5.5S1 9 1 9z" stroke="#6b7280" strokeWidth="1.4"/>
        <circle cx="9" cy="9" r="2.2" stroke="#6b7280" strokeWidth="1.4"/>
        <line x1="2" y1="2" x2="16" y2="16" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round"/>
      </>
    )}
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/api/users/login", {
        email,
        password,
      });

      const { userId, firstName, role, token } = response.data;

      // Save to localStorage
      localStorage.setItem("userId", userId);
      localStorage.setItem("firstName", firstName);
      localStorage.setItem("role", role);
      localStorage.setItem("token", token);           // ← JWT token saved
      localStorage.setItem("isAuthenticated", "true");

      // Redirect based on role
      if (role === "MANAGER") {
        navigate("/manager/dashboard");
      } else if (role === "HR") {
        navigate("/hr/dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (err: any) {
      if (err.response) {
        setError(err.response.data?.message || err.response.data || "Invalid email or password.");
      } else {
        setError("Cannot connect to server. Make sure backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#16181f] px-4">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-purple-700/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm bg-[#1e2029] rounded-2xl border border-white/[0.07] shadow-2xl px-8 py-10 flex flex-col items-center">

        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-900/40 mb-4">
          <BarChartIcon />
        </div>

        <h1 className="text-white font-semibold text-xl tracking-tight mb-0.5">AppraisalPro</h1>
        <p className="text-[#6b7280] text-[11px] uppercase tracking-[0.18em] font-medium mb-6">
          Performance Management
        </p>

        <div className="w-8 h-px bg-white/10 mb-7" />

        <h2 className="text-white text-2xl font-bold tracking-tight mb-1 text-center">Welcome back</h2>
        <p className="text-[#6b7280] text-sm mb-8 text-center">Sign in to your workspace</p>

        {error && (
          <div className="w-full mb-4 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[#9ca3af] text-sm font-medium">Work email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-[#2a2d3a] border border-white/[0.08] rounded-xl px-4 py-3 pr-10 text-white placeholder-[#4b5563] text-sm outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-all"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2"><EmailIcon /></span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[#9ca3af] text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[#2a2d3a] border border-white/[0.08] rounded-xl px-4 py-3 pr-10 text-white placeholder-[#4b5563] text-sm outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <EyeIcon show={showPassword} />
              </button>
            </div>
            <div className="flex justify-end mt-0.5">
              <a href="#" className="text-purple-400 text-xs hover:text-purple-300 transition-colors">
                Forgot password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 bg-white hover:bg-gray-100 text-[#16181f] font-semibold text-sm py-3 rounded-xl transition-all duration-200 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}