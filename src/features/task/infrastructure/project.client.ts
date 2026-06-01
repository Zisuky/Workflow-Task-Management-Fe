import api from '../../../shared/http/apiClient';


export interface ProjectResponse {
  id: string;
  projectCode: string;
  name: string;
  description: string | null;
  isPinned: boolean;
  workflowId: string | null;
  status: string;
  createdAt: string;
}

export interface ProjectDetailResponse {
  id: string;
  projectId: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  leaderId: string;
  memberIds: string[];
  workflowId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProjectMemberResponse {
  id: string;
  projectId: string;
  userId: string;
  roleId: string | null;
  joinedAt: string;
}

export const projectApi = {
  getAll(page = 0, size = 100) { return api.get(`/projects?page=${page}&size=${size}`); },
  getById(id: string) { return api.get(`/projects/${id}`); },
  search(query: string) { return api.get(`/projects/search?q=${encodeURIComponent(query)}`); },
  getByUser(userId: string) { return api.get(`/projects/user/${userId}`); },
  create(request: CreateProjectRequest) { return api.post('/projects', request); },
  getMembers(projectId: string) { return api.get(`/projects/${projectId}/members`); },
  update(id: string, project: Partial<Pick<ProjectResponse, 'name' | 'description'>>) { return api.put(`/projects/${id}`, project); },
  delete(id: string) { return api.delete(`/projects/${id}`); },
  pin(id: string) { return api.patch(`/projects/${id}/pinned`); },
  unpin(id: string) { return api.patch(`/projects/${id}/unpinned`); },
  getDetail(projectId: string) { return api.get(`/project-details/${projectId}`); },
  getWorkflow(projectId: string) { return api.get(`/workflows/by-project/${projectId}`); },
  getFirstWorkflowStatus(projectId: string) { return api.get(`/projects/${projectId}/first-workflow-status`); },
};
