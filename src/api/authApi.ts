import axiosInstance from './axiosInstance';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  userId: number;
}

export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axiosInstance.post('/api/users/login', data);
  return response.data;
};

// ─── User ────────────────────────────────────────────
export const fetchUserById = async (userId: number) => {
  const response = await axiosInstance.get(`/api/users/${userId}`);
  return response.data;
};

// ─── Appraisals ──────────────────────────────────────
export const fetchAppraisalsByEmployee = async (employeeId: number) => {
  const response = await axiosInstance.get(`/api/appraisals/employee/${employeeId}`);
  return response.data;
};

export const fetchAppraisalById = async (appraisalId: number) => {
  const response = await axiosInstance.get(`/api/appraisals/${appraisalId}/employee-view`);
  return response.data;
};

export const saveSelfAssessmentDraft = async (appraisalId: number, data: {
  whatWentWell: string;
  whatToImprove: string;
  achievements: string;
  selfRating: number;
}) => {
  const response = await axiosInstance.put(`/api/appraisals/${appraisalId}/self-assessment/draft`, data);
  return response.data;
};

export const submitSelfAssessment = async (appraisalId: number, data: {
  whatWentWell: string;
  whatToImprove: string;
  achievements: string;
  selfRating: number;
}) => {
  const response = await axiosInstance.put(`/api/appraisals/${appraisalId}/self-assessment/submit`, data);
  return response.data;
};

// ─── Goals ───────────────────────────────────────────
export const fetchGoalsByEmployee = async (employeeId: number) => {
  const response = await axiosInstance.get(`/api/goals/employee/${employeeId}`);
  return response.data;
};
// ─── Team Members ────────────────────────────────────
export const fetchTeamByManager = async (managerId: number) => {
  const response = await axiosInstance.get(`/api/users/manager/${managerId}`);
  return response.data;
};