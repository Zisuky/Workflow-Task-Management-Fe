import api from "../services/api";

export interface JobResponse {
    id: string;
    companyId: string;
    name: string;
    description: string | null;
    createdAt: string;
}

export interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

export const jobApi = {
    async getAll(): Promise<any> {
        return api.get('/jobs');
    },
    async getById(id: string): Promise<any> {
        return api.get(`/jobs/${id}`);
    },
    async create(job: any): Promise<any> {
        return api.post('/jobs', job);
    },
    async update(id: string, job: any): Promise<any> {
        return api.put(`/jobs/${id}`, job);
    },
    async delete(id: string): Promise<any> {
        return api.delete(`/jobs/${id}`);
    },
}   


