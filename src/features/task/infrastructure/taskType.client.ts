import api from '../../../shared/http/apiClient';


export interface TaskType { id: string; name: string; description: string | null; }

export const taskTypeApi = {
  getAll() { return api.get('/type-tasks'); },
  getById(id: string) { return api.get(`/type-tasks/${id}`); },
};
