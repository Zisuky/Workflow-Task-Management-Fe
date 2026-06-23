import type { StatCard } from '../../../shared/types/dashboard';
import { dashboardApi, type KpiStatDTO, type ProductivityDTO, type PriorityDTO, type TaskStatusDTO, type WarningDTO, type TaskCountByGroupDTO } from './dashboard.client';
import { mockStats } from '../../../data/dashboard.data';

const mapToStatCard = (dto: KpiStatDTO, index: number): StatCard => {
  const colors: Array<'blue' | 'green' | 'purple' | 'orange'> = ['blue', 'green', 'purple', 'orange'];
  const icons = ['📊', '✅', '⏳', '🚀'];
  return {
    id: dto.id,
    title: dto.label,
    value: dto.value,
    icon: icons[index % icons.length],
    color: colors[index % colors.length],
  };
};

export interface ProductivityData {
  month: string;
  completed: number;
  total: number;
}
export interface PriorityData { priority: string; count: number; }
export interface TaskStatusData { status: string; count: number; }
export interface AlertData { id: string; taskCode: string; message: string; projectCode: string; taskId?: string; }
export interface WarningData { taskId: string; taskName: string; projectName: string; warningType: 'OVERDUE' | 'DUE_SOON'; dueDate: string; daysOverdue: number; daysRemaining: number; }
export interface DepartmentTaskData { taskGroupId: string; typeName: string; count: number; }

export const dashboardRepository = {
  async getStats(filter = 'all'): Promise<StatCard[]> {
    try {
      const response = await dashboardApi.getStats(filter);
      return response.data.map(mapToStatCard);
    } catch {
      return mockStats;
    }
  },
  async getProductivity(filter = 'all'): Promise<ProductivityData[]> {
    try {
      const response = await dashboardApi.getProductivity(filter);
      return response.data.map((dto: ProductivityDTO) => ({ month: dto.project, completed: dto.completedTasks, total: dto.totalTasks }));
    } catch {
      return [];
    }
  },
  async getPriority(filter = 'all'): Promise<PriorityData[]> {
    try {
      const response = await dashboardApi.getPriority(filter);
      return response.data.map((dto: PriorityDTO) => ({ priority: dto.priority, count: dto.count }));
    } catch {
      return [];
    }
  },
  async getTaskStatus(filter = 'all'): Promise<TaskStatusData[]> {
    try {
      const response = await dashboardApi.getTaskStatus(filter);
      return response.data.map((dto: TaskStatusDTO) => ({ status: dto.status, count: dto.count }));
    } catch {
      return [];
    }
  },
  async getAlerts(filter = 'all'): Promise<AlertData[]> {
    try {
      const response = await dashboardApi.getWarnings(filter);
      return response.data.map((dto: WarningDTO) => ({
        id: dto.taskId,
        taskCode: dto.taskName,
        message: dto.warningType === 'OVERDUE' ? `Quá hạn ${dto.daysOverdue} ngày` : `Còn ${dto.daysRemaining} ngày`,
        projectCode: dto.projectName,
        taskId: dto.taskId,
      }));
    } catch {
      return [];
    }
  },
  async getWarnings(filter = 'all'): Promise<WarningData[]> {
    try {
      const response = await dashboardApi.getWarnings(filter);
      return response.data.map((dto: WarningDTO) => ({
        taskId: dto.taskId,
        taskName: dto.taskName,
        projectName: dto.projectName,
        warningType: dto.warningType,
        dueDate: dto.dueDate,
        daysOverdue: dto.daysOverdue,
        daysRemaining: dto.daysRemaining,
      }));
    } catch {
      return [];
    }
  },
  async getTaskCountByGroup(filter = 'all'): Promise<DepartmentTaskData[]> {
    try {
      const response = await dashboardApi.getTaskCountByGroup(filter);
      return response.data.map((dto: TaskCountByGroupDTO) => ({
        taskGroupId: dto.taskGroupId,
        typeName: dto.groupName,
        count: dto.count,
      }));
    } catch {
      return [];
    }
  },

  async getCompletedProjectsCount(): Promise<number> {
    try {
      const { projectApi } = await import('../../task/infrastructure/project.client');
      const response = await projectApi.getAll(0, 1000);
      const list: Array<{ status: string }> = response.data?.content ?? response.data ?? [];
      return list.filter(p => p.status === 'COMPLETED').length;
    } catch {
      return 0;
    }
  },
};
