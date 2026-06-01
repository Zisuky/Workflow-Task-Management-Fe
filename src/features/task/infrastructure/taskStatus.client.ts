import api from '../../../shared/http/apiClient';


export interface TaskStatusResponse {
  id: string;
  code: string;  
  name: string;  
  sortOrder: number | null;
  isActive: boolean;
}

export const taskStatusApi = {
  getAll() { return api.get('/task-statuses'); },
  getActive() { return api.get('/task-statuses/active'); },
  getById(id: string) { return api.get(`/task-statuses/${id}`); },
  getByCode(code: string) { return api.get(`/task-statuses/code/${code}`); },
};
