import api from '../../../shared/http/apiClient';

export interface TaskGroup {
  id: string;
  name: string;
  description?: string;
  projectId?: string;
}

export interface CreateTaskGroupRequest {
  name: string;
  description?: string;
}

export const taskGroupApi = {
  getAll()                         { return api.get('/task-groups'); },
  getById(id: string)              { return api.get(`/task-groups/${id}`); },
  getByProject(projectId: string)  { return api.get(`/task-groups/project/${projectId}`); },
  create(data: CreateTaskGroupRequest) {
    return api.post('/task-groups', data);
  },
  createForProject(projectId: string, data: CreateTaskGroupRequest) {
    return api.post(`/task-groups/project/${projectId}`, data);
  },
  update(id: string, data: CreateTaskGroupRequest) {
    return api.put(`/task-groups/${id}`, data);
  },
  delete(id: string)               { return api.delete(`/task-groups/${id}`); },
};
