import api from '../services/api';

export interface Comment {
    id: string;
    userId: string;
    comment: string;
    createdAt: string;
}

export interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

export const commentApi = {
    async getByTaskId(taskId: string): Promise<ApiResponse<Comment[]>> {
        return api.get(`/tasks/${taskId}/comments`);
    },

    async create(taskId: string, comment: string): Promise<ApiResponse<void>> {
        return api.post(`/tasks/${taskId}/comments`, { comment });
    },
};

export default commentApi;
