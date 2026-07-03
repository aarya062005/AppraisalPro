import { Navigate, Outlet, useLocation } from "react-router-dom";

type Role = "HR" | "MANAGER" | "EMPLOYEE";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

const roleHome: Record<Role, string> = {
  HR: "/hr/dashboard",
  MANAGER: "/manager/dashboard",
  EMPLOYEE: "/dashboard",
};

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") as Role | null;

  // Not logged in or token missing → go to login
  if (!isAuthenticated || !token || !role) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Token is a JWT — check if it's expired by reading the payload
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    if (isExpired) {
      localStorage.clear();
      return <Navigate to="/" state={{ from: location }} replace />;
    }
  } catch {
    // Malformed token
    localStorage.clear();
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Logged in but wrong role → redirect to their home
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={roleHome[role]} replace />;
  }

  return <Outlet />;
}