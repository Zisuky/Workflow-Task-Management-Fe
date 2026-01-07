import api from '../services/api';

export interface TaskType {
    id: string;
    name: string;
    description?: string;
    companyId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

export const taskTypeApi = {
    async getAll(): Promise<ApiResponse<TaskType[]>> {
        return api.get('/type-tasks');
    },

    async getById(id: string): Promise<ApiResponse<TaskType>> {
        return api.get(`/type-tasks/${id}`);
    },
};
