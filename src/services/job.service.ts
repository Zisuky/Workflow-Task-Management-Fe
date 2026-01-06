import type { Job, CreateJobInput } from '../models';
import { mockJobs } from '../data/jobs.data';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const jobService = {
    async getJobs(): Promise<Job[]> {
        await delay(300);
        return mockJobs;
    },
    async getJobById(id: string): Promise<Job | undefined> {
        await delay(200);
        return mockJobs.find(job => job.id === id);
    },
    async updateJobStatus(id: string, status: Job['status']): Promise<Job | undefined> {
        await delay(200);
        const job = mockJobs.find(j => j.id === id);
        if (job) {
            job.status = status;
        }
        return job;
    },
    async addJob(input: CreateJobInput): Promise<Job> {
        await delay(300);
        const newJob: Job = {
            id: Math.random().toString(36).substr(2, 9),
            ...input,
            code: input.code || 'JOB-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            status: 'To Do', // Default status
        };
        mockJobs.push(newJob);
        return newJob;
    },
    async deleteJob(id: string): Promise<boolean> {
        await delay(200);
        const index = mockJobs.findIndex(job => job.id === id);
        if (index !== -1) {
            mockJobs.splice(index, 1);
            return true;
        }
        return false;
    },
};
