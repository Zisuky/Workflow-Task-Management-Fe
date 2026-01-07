import api from '../services/api';

// BE Project Entity response
export interface ProjectResponse {
    id: string;
    projectCode: string;
    companyId: string;
    name: string;
    description: string | null;
    createdAt: string;
}

// Request DTO để tạo project mới với members
export interface CreateProjectRequest {
    name: string;
    description: string;
    companyId: string;
    leaderId: string; // Trưởng dự án
    memberIds: string[]; // Danh sách user id thành viên
}

// Project Member response
export interface ProjectMemberResponse {
    id: string;
    projectId: string;
    userId: string;
    role: string; // LEADER, MEMBER, OWNER
    leaderId: string;
    joinedAt: string;
}

// BE API Response wrapper
export interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

export const projectApi = {
    async getAll(): Promise<ApiResponse<ProjectResponse[]>> {
        return api.get('/projects');
    },

    async getById(id: string): Promise<ApiResponse<ProjectResponse>> {
        return api.get(`/projects/${id}`);
    },

    async search(query: string): Promise<ApiResponse<ProjectResponse[]>> {
        return api.get(`/projects/search?q=${encodeURIComponent(query)}`);
    },

    async getByCompany(companyId: string): Promise<ApiResponse<ProjectResponse[]>> {
        return api.get(`/projects/company/${companyId}`);
    },

    async create(request: CreateProjectRequest): Promise<ApiResponse<ProjectResponse>> {
        return api.post('/projects', request);
    },

    async getMembers(projectId: string): Promise<ApiResponse<ProjectMemberResponse[]>> {
        return api.get(`/projects/${projectId}/members`);
    },

    async update(id: string, project: Partial<ProjectResponse>): Promise<ApiResponse<ProjectResponse>> {
        return api.put(`/projects/${id}`, project);
    },

    async delete(id: string): Promise<ApiResponse<void>> {
        return api.delete(`/projects/${id}`);
    },

    async pin(id: string, userId: string): Promise<ApiResponse<void>> {
        return api.post(`/projects/${id}/pin`, null, {
            headers: { 'X-User-Id': userId }
        });
    },

    async unpin(id: string, userId: string): Promise<ApiResponse<void>> {
        return api.delete(`/projects/${id}/pin`, {
            headers: { 'X-User-Id': userId }
        });
    },

    async isPinned(id: string, userId: string): Promise<ApiResponse<boolean>> {
        return api.get(`/projects/${id}/is-pinned`, {
            headers: { 'X-User-Id': userId }
        });
    },
};

export default projectApi;

