import api from '../../../shared/http/apiClient';


export interface TaskResponse {
  id: string;
  projectId: string;
  taskGroupId: string;
  name: string;
  code: string | null;
  statusId: string;
  priorityId: string;
  startDate: string | null;
  endDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  note: string | null;
  userUpdateId: string;
  isPinned: boolean;
  parentTaskId: string | null;
  createdAt: string;
  updatedAt: string;
}


// Mirrors BE TaskMember entity — pmcc.task_member has no role/leader column
export interface TaskMemberResponse {
  id: string;
  projectId: string;
  taskId: string;
  userId: string;
  roleId: string | null;
  joinedAt: string;
}

export const taskApi = {
  getAll(page = 0, size = 100) { return api.get(`/tasks?page=${page}&size=${size}`); },
  getById(id: string) { return api.get(`/tasks/${id}`); },
  getByProject(projectId: string) { return api.get(`/tasks/project/${projectId}`); },
  getByUser(userId: string) { return api.get(`/tasks/user/${userId}`); },
  getMembers(taskId: string) { return api.get(`/tasks/${taskId}/members`); },
  getSubtasks(taskId: string) { return api.get(`/tasks/${taskId}/subtasks`); },
  getSubtaskSummary(taskId: string) { return api.get(`/tasks/${taskId}/subtask-summary`); },
  getSubtaskWorkflowStatuses() { return api.get('/tasks/subtask-workflow-statuses'); },
  create(task: Record<string, unknown>) { return api.post('/tasks', task); },
  update(id: string, task: Record<string, unknown>) { return api.put(`/tasks/${id}`, task); },
  updateStatus(id: string, statusId: string) { return api.put(`/tasks/${id}/status`, { statusId }); },
  pin(id: string)   { return api.patch(`/tasks/${id}/pinned`); },
  unpin(id: string) { return api.patch(`/tasks/${id}/unpin`); },
  delete(id: string) { return api.delete(`/tasks/${id}`); },
};
