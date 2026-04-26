import api from '../../../shared/http/apiClient';

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

export const historyApi = {
  getByObjectId(objectType: string, objectId: string) {
    return api.get(`/history/${objectType}/${objectId}`);
  },
  getByUserId(userId: string) {
    return api.get(`/history/user/${userId}`);
  },
};
