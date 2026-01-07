import api from '../services/api';

export interface TaskGroup {
    id: string;
    projectId: string;
    name: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

export const taskGroupApi = {
    async getAll(): Promise<ApiResponse<TaskGroup[]>> {
        return api.get('/task-groups');
    },

    async getByProjectId(projectId: string): Promise<ApiResponse<TaskGroup[]>> {
        return api.get(`/task-groups/project/${projectId}`);
    },

    async getById(id: string): Promise<ApiResponse<TaskGroup>> {
        return api.get(`/task-groups/${id}`);
    },
};

export default taskGroupApi;
