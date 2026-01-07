import api from '../services/api';

export interface TaskResponse {
    id: string;
    projectId: string;
    taskGroupId: string;
    name: string;
    typeId: string;
    status: string;
    priority: string;
    assignerId: string;
    assigneeId: string;
    startDate: string | null;
    endDate: string | null;
    actualStartDate: string | null;
    actualEndDate: string | null;
    note: string | null;
    userUpdateId: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

export const taskApi = {
    async getAll(): Promise<ApiResponse<TaskResponse[]>> {
        return api.get('/tasks');
    },

    async getById(id: string): Promise<ApiResponse<TaskResponse>> {
        return api.get(`/tasks/${id}`);
    },

    async getByProject(projectId: string): Promise<ApiResponse<TaskResponse[]>> {
        return api.get(`/tasks/project/${projectId}`);
    },

    async getByAssignee(assigneeId: string): Promise<ApiResponse<TaskResponse[]>> {
        return api.get(`/tasks/assignee/${assigneeId}`);
    },

    async create(task: Partial<TaskResponse>): Promise<ApiResponse<TaskResponse>> {
        return api.post('/tasks', task);
    },

    async update(id: string, task: Partial<TaskResponse>): Promise<ApiResponse<TaskResponse>> {
        return api.put(`/tasks/${id}`, task);
    },

    async updateStatus(id: string, status: string): Promise<ApiResponse<TaskResponse>> {
        return api.put(`/tasks/${id}/status`, { status });
    },

    async delete(id: string): Promise<ApiResponse<void>> {
        return api.delete(`/tasks/${id}`);
    },
};

export default taskApi;
