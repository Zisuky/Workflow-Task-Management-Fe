export type TaskStatus = string; // workflow stages are dynamic — any string is valid

export type TaskPriority = "Low" | "Medium" | "High" | "Highest";

export type TaskType = "Bug" | "Feature" | "Task" | "Improvement";
export type TaskGroup =
  | "UI/UX"
  | "Backend"
  | "Frontend"
  | "Testing"
  | "Database"
  | "Documentation"
  | "Design";

// Maps BE TaskStatus.code → FE display label
export const beStatusToDisplay: Record<string, TaskStatus> = {
  NOT_STARTED: 'Not Started',
  TO_DO:       'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEWING:   'Reviewing',
  DONE:        'Done',
  // legacy codes kept for backward compatibility
  COMPLETED:   'Done',
  IN_REVIEW:   'In Review',
  BLOCKED:     'Blocked',
  ON_HOLD:     'On Hold',
};

// Maps FE display label → BE TaskStatus.code
export const displayStatusToBe: Record<TaskStatus, string> = {
  'Not Started': 'NOT_STARTED',
  'To Do':       'TO_DO',
  'In Progress': 'IN_PROGRESS',
  'Reviewing':   'REVIEWING',
  'Done':        'DONE',
  'In Review':   'IN_REVIEW',
  'Blocked':     'BLOCKED',
  'On Hold':     'ON_HOLD',
};

// Maps BE TaskPriority.code → FE display label
export const bePriorityToDisplay: Record<string, TaskPriority> = {
  UNKNOWN: 'Low',
  LOW:     'Low',
  MEDIUM:  'Medium',
  HIGH:    'High',
  HIGHEST: 'Highest',
};

// Maps FE display label → BE TaskPriority.code
export const displayPriorityToBe: Record<TaskPriority, string> = {
  Low:     'LOW',
  Medium:  'MEDIUM',
  High:    'HIGH',
  Highest: 'HIGHEST',
};

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface User {
  id: string;
  account: string;
  email: string;
  name: string; 
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

export interface RegisterRequest {
  account: string;
  email: string;
  fullName: string;
  phone?: string | null;
  address?: string | null;
}

export interface ForgotPasswordRequest {
  accountOrEmail: string;
}

export interface ResetPasswordRequest {
  email: string;
  otpCode: string;
  newPassword: string;
}
