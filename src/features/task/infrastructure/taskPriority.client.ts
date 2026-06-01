import api from '../../../shared/http/apiClient';

// Mirrors BE TaskPriority entity
export interface TaskPriorityResponse {
  id: string;
  code: string;   // e.g. LOW, MEDIUM, HIGH, UNKNOWN
  name: string;   // display name
  level: number | null;
  isActive: boolean;
}

export const taskPriorityApi = {
  getAll() { return api.get('/task-priorities'); },
  getActive() { return api.get('/task-priorities/active'); },
  getById(id: string) { return api.get(`/task-priorities/${id}`); },
  getByCode(code: string) { return api.get(`/task-priorities/code/${code}`); },
};
