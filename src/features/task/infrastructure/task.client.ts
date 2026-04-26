import api from '../../../shared/http/apiClient';

export interface TaskResponse {
  id: string;
  projectId: string;
  taskGroupId: string;
  name: string;
  typeId: string;
  status: string;
  priority: string;
  assignerId: string;
  assigneeId: string | string[];
  startDate: string | null;
  endDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  note: string | null;
  userUpdateId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskMemberResponse {
  id: string;
  taskId: string;
  userId: string;
  role: 'LEADER' | 'MEMBER';
  leaderId: string;
  createdAt: string;
  updatedAt: string;
}

export const taskApi = {
  getAll() { return api.get('/tasks'); },
  getById(id: string) { return api.get(`/tasks/${id}`); },
  getByProject(projectId: string) { return api.get(`/tasks/project/${projectId}`); },
  getByAssignee(assigneeId: string) { return api.get(`/tasks/assignee/${assigneeId}`); },
  getMembers(taskId: string) { return api.get(`/tasks/${taskId}/members`); },
  create(task: Partial<TaskResponse>) { return api.post('/tasks', task); },
  update(id: string, task: Partial<TaskResponse>) { return api.put(`/tasks/${id}`, task); },
  updateStatus(id: string, status: string) { return api.put(`/tasks/${id}/status`, { status }); },
  delete(id: string) { return api.delete(`/tasks/${id}`); },
};
