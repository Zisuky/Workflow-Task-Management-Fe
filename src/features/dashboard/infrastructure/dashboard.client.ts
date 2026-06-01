import api from '../../../shared/http/apiClient';

export interface KpiStatDTO {
  id: string;
  label: string;
  value: number;
}

export interface ProductivityDTO {
  project: string;
  totalTasks: number;
  completedTasks: number;
}

export interface PriorityDTO { priority: string; count: number; }
export interface TaskStatusDTO { status: string; count: number; }
export interface WarningDTO {
  taskId: string;
  taskName: string;
  projectName: string;
  warningType: 'OVERDUE' | 'DUE_SOON';
  dueDate: string;
  daysOverdue: number;
  daysRemaining: number;
}
export interface TaskCountByGroupDTO { taskGroupId: string; groupName: string; count: number; }

export const dashboardApi = {
  getStats() { return api.get('/dashboard/stats'); },
  getProductivity() { return api.get('/dashboard/productivity'); },
  getPriority() { return api.get('/dashboard/priority'); },
  getTaskStatus() { return api.get('/dashboard/task-status'); },
  getWarnings() { return api.get('/dashboard/warnings'); },
  getTaskCountByGroup() { return api.get('/dashboard/task-count-by-group'); },
};
