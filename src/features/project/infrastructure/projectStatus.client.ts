import api from '../../../shared/http/apiClient';

export interface ProjectStatusResponse {
  id: string;
  code: string;      // "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CANCELLED"
  name: string;      // "Đang thực hiện" | "Hoàn thành" | "Tạm dừng" | "Đã hủy"
  sortOrder: number | null;
  isActive: boolean;
}

/** Map màu theo code — không phụ thuộc DB */
export const PROJECT_STATUS_COLORS: Record<string, string> = {
  IN_PROGRESS: '#3B82F6',
  COMPLETED:   '#10B981',
  ON_HOLD:     '#F59E0B',
  CANCELLED:   '#EF4444',
  PAUSED:      '#9CA3AF',
};

export const projectStatusApi = {
  getAll()    { return api.get<ProjectStatusResponse[]>('/project-statuses'); },
  getActive() { return api.get<ProjectStatusResponse[]>('/project-statuses/active'); },
  getById(id: string) { return api.get<ProjectStatusResponse>(`/project-statuses/${id}`); },
  getByCode(code: string) { return api.get<ProjectStatusResponse>(`/project-statuses/code/${code}`); },
  updateProjectStatus(projectId: string, statusId: string) {
    return api.patch(`/projects/${projectId}/status`, { statusId });
  },
};
