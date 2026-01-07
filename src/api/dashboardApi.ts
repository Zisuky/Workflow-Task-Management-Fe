import api from '../services/api';

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

export interface PriorityDTO {
    priority: string;
    count: number;
}

export interface TaskStatusDTO {
    status: string;
    count: number;
}

export interface AlertDTO {
    id: string;
    taskCode: string;
    message: string;
    projectCode: string;
    taskId: string;
    projectId: string;
}

export interface WarningDTO {
    taskId: string;
    taskName: string;
    projectName: string;
    warningType: 'OVERDUE' | 'DUE_SOON';
    dueDate: string;
    daysOverdue: number;
    daysRemaining: number;
}

export interface TaskCountByTypeDTO {
    typeId: string;
    typeName: string;
    count: number;
}

export interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

export const dashboardApi = {
    async getStats(): Promise<ApiResponse<KpiStatDTO[]>> {
        return api.get('/dashboard/stats');
    },

    async getProductivity(): Promise<ApiResponse<ProductivityDTO[]>> {
        return api.get('/dashboard/productivity');
    },

    async getPriority(): Promise<ApiResponse<PriorityDTO[]>> {
        return api.get('/dashboard/priority');
    },

    async getTaskStatus(): Promise<ApiResponse<TaskStatusDTO[]>> {
        return api.get('/dashboard/task-status');
    },

    async getWarnings(): Promise<ApiResponse<WarningDTO[]>> {
        return api.get('/dashboard/warnings');
    },

    async getTaskCountByType(): Promise<ApiResponse<TaskCountByTypeDTO[]>> {
        return api.get('/dashboard/task-count-by-type');
    },

    async getAlerts(): Promise<ApiResponse<AlertDTO[]>> {
        return api.get('/dashboard/alerts');
    },
};

export default dashboardApi;

