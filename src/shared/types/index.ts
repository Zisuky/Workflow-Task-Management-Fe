export type JobStatus =
  | "To Do"
  | "In Progress"
  | "In Review"
  | "Blocked"
  | "Done"
  | "On Hold";
export type JobPriority = "Low" | "Medium" | "High" | "Highest";
export type JobType = "Bug" | "Feature" | "Task" | "Improvement";
export type JobGroup =
  | "UI/UX"
  | "Backend"
  | "Frontend"
  | "Testing"
  | "Database"
  | "Documentation"
  | "Design";

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface User {
  id: string;
  account: string;
  email: string;
  name: string; // mapped from fullName
  phone?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  roles?: string[];
}

export interface LoginCredentials {
  email: string;
  account: string;
  password: string;
  rememberMe?: boolean;
}
