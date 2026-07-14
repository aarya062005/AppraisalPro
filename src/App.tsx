import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import MainLayout from "./layouts/MainLayout";
import ManagerLayout from "./layouts/ManagerLayout";
import HRLayout from "./layouts/HRLayout";
import ManagerDashboard from "./pages/Manager/ManagerDashboard";
import MyTeam from "./pages/Manager/MyTeam";
import ManagerGoals from "./pages/Manager/ManagerGoals";
import TeamReport from "./pages/Manager/TeamReport";
import ManagerMyAppraisals from "./pages/Manager/ManagerMyAppraisals";
import ManagerSelfAssessment from "./pages/Manager/ManagerSelfAssessment";
import ManagerMyGoals from "./pages/Manager/ManagerMyGoals";
import ManagerProfile from "./pages/Manager/ManagerProfile";
import ManagerAppraisalView from "./pages/Manager/ManagerAppraisalView";
import Dashboard from "./pages/Dashboard";
import AppraisalGuide from "./pages/AppraisalGuide";
import MyAppraisals from "./pages/MyAppraisals";
import AppraisalDetail from "./pages/AppraisalDetails";
import Goals from "./pages/Goals";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import HRDashboard from "./pages/HR/HRDashboard";
import HRUsers from "./pages/HR/HRUsers";
import HRDepartments from "./pages/HR/HRDepartments";
import HRAppraisals from "./pages/HR/HRAppraisals";
import HRCreateAppraisal from "./pages/HR/HRCreateAppraisal";
import HRReports from "./pages/HR/HRReports";
import HRProfile from "./pages/HR/HRProfile";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Employee Routes */}
        <Route element={<ProtectedRoute allowedRoles={["EMPLOYEE"]} />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/appraisal-guide" element={<AppraisalGuide />} />
            <Route path="/my-appraisal" element={<MyAppraisals />} />
            <Route path="/my-appraisal/:id" element={<AppraisalDetail />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Manager Routes */}
        <Route element={<ProtectedRoute allowedRoles={["MANAGER"]} />}>
          <Route element={<ManagerLayout />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/team" element={<MyTeam />} />
            <Route path="/manager/goals" element={<ManagerGoals />} />
            <Route path="/manager/team-report" element={<TeamReport />} />
            <Route path="/manager/my-appraisals" element={<ManagerMyAppraisals />} />
            <Route path="/manager/my-appraisals/:id" element={<ManagerSelfAssessment />} />
            <Route path="/manager/team-appraisal/:id" element={<ManagerAppraisalView />} />
            <Route path="/manager/my-goals" element={<ManagerMyGoals />} />
            <Route path="/manager/notifications" element={<Notifications />} />
            <Route path="/manager/profile" element={<ManagerProfile />} />
          </Route>
        </Route>

        {/* HR Routes */}
        <Route element={<ProtectedRoute allowedRoles={["HR"]} />}>
          <Route element={<HRLayout />}>
            <Route path="/hr/dashboard" element={<HRDashboard />} />
            <Route path="/hr/users" element={<HRUsers />} />
            <Route path="/hr/departments" element={<HRDepartments />} />
            <Route path="/hr/appraisals" element={<HRAppraisals />} />
            <Route path="/hr/create-appraisal" element={<HRCreateAppraisal />} />
            <Route path="/hr/reports" element={<HRReports />} />
            <Route path="/hr/notifications" element={<Notifications />} />
            <Route path="/hr/profile" element={<HRProfile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;