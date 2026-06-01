import api from '../../../shared/http/apiClient';

export interface WorkflowStatusDetail {
  id: string;       // TaskStatus.id
  code: string;
  name: string;
  sortOrder: number | null;
  isActive: boolean;
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  isDefault?: boolean;
}

export interface AddStatusToWorkflowRequest {
  statusId: string;
  sortOrder?: number;
}

export const workflowApi = {
  /** GET /api/workflows */
  getAll() { return api.get('/workflows'); },

  /** GET /api/workflows/default */
  getDefault() { return api.get('/workflows/default'); },

  /** GET /api/workflows/{id} */
  getById(id: string) { return api.get(`/workflows/${id}`); },

  /** POST /api/workflows */
  create(request: CreateWorkflowRequest) { return api.post('/workflows', request); },

  /** PUT /api/workflows/{id} */
  update(id: string, request: Partial<CreateWorkflowRequest>) { return api.put(`/workflows/${id}`, request); },

  /** DELETE /api/workflows/{id} */
  delete(id: string) { return api.delete(`/workflows/${id}`); },

  /** PUT /api/workflows/{id}/set-default */
  setAsDefault(id: string) { return api.put(`/workflows/${id}/set-default`); },

  /** GET /api/workflows/by-project/{projectId} — returns the workflow bound to a project */
  getByProject(projectId: string) { return api.get(`/workflows/by-project/${projectId}`); },

  /** GET /api/workflows/{id}/status/details — returns TaskStatus[] for the workflow */
  getStatusDetails(workflowId: string) { return api.get(`/workflows/${workflowId}/status/details`); },

  /** GET /api/workflows/{id}/status — returns WorkflowStatus[] */
  getStatusMappings(workflowId: string) { return api.get(`/workflows/${workflowId}/status`); },

  /** POST /api/workflows/{workflowId}/status?statusId=&sortOrder=&isFinal= */
  addStatus(workflowId: string, statusId: string, sortOrder: number, isFinal: boolean = false) {
    return api.post(`/workflows/${workflowId}/status?statusId=${statusId}&sortOrder=${sortOrder}&isFinal=${isFinal}`);
  },

  /** DELETE /api/workflows/{workflowId}/status/{statusId} */
  removeStatus(workflowId: string, statusId: string) {
    return api.delete(`/workflows/${workflowId}/status/${statusId}`);
  },

  /** PUT /api/workflows/{workflowId}/status/{id}/sort-order?sortOrder=N */
  updateSortOrder(workflowId: string, workflowStatusId: string, sortOrder: number) {
    return api.put(`/workflows/${workflowId}/status/${workflowStatusId}/sort-order?sortOrder=${sortOrder}`);
  },
};

/** GET /api/task-statuses/active */
export const taskStatusApi = {
  getActive() { return api.get('/task-statuses/active'); },
  create(data: { code: string; name: string; sortOrder?: number }) {
    return api.post('/task-statuses', data);
  },
};
