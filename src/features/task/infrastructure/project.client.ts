import api from '../../../shared/http/apiClient';

export interface ProjectResponse {
  id: string;
  projectCode: string;
  companyId: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  companyId: string;
  leaderId: string;
  memberIds: string[];
}

export interface ProjectMemberResponse {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  leaderId: string;
  joinedAt: string;
}

export const projectApi = {
  getAll() { return api.get('/projects'); },
  getById(id: string) { return api.get(`/projects/${id}`); },
  search(query: string) { return api.get(`/projects/search?q=${encodeURIComponent(query)}`); },
  getByCompany(companyId: string) { return api.get(`/projects/company/${companyId}`); },
  create(request: CreateProjectRequest) { return api.post('/projects', request); },
  getMembers(projectId: string) { return api.get(`/projects/${projectId}/members`); },
  update(id: string, project: Partial<ProjectResponse>) { return api.put(`/projects/${id}`, project); },
  delete(id: string) { return api.delete(`/projects/${id}`); },
  pin(id: string, userId: string) { return api.post(`/projects/${id}/pin`, null, { headers: { 'X-User-Id': userId } }); },
  unpin(id: string, userId: string) { return api.delete(`/projects/${id}/pin`, { headers: { 'X-User-Id': userId } }); },
  isPinned(id: string, userId: string) { return api.get(`/projects/${id}/is-pinned`, { headers: { 'X-User-Id': userId } }); },
};
