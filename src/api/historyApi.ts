import api from '../services/api';

export interface HistoryItem {
    id: string;
    userId: string;
    action: string;
    objectType: string;
    objectId: string;
    metadata: string | null;
    ipAddress: string | null;
    createdAt: string;
}

export interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

export const historyApi = {
    async getByObjectId(objectType: string, objectId: string): Promise<ApiResponse<HistoryItem[]>> {
        return api.get(`/history/${objectType}/${objectId}`);
    },

    async getByUserId(userId: string): Promise<ApiResponse<HistoryItem[]>> {
        return api.get(`/history/user/${userId}`);
    },
};

export default historyApi;
