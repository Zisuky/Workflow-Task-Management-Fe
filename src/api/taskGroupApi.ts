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

    async create(taskGroup: Omit<TaskGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<TaskGroup>> {
        return api.post('/task-groups', taskGroup);
    },

    async update(id: string, taskGroup: Partial<TaskGroup>): Promise<ApiResponse<TaskGroup>> {
        return api.put(`/task-groups/${id}`, taskGroup);
    },

    async delete(id: string): Promise<ApiResponse<void>> {
        return api.delete(`/task-groups/${id}`);
    },
};

export default taskGroupApi;

