import type { Job, CreateJobInput } from '../models';
import { taskApi, type TaskResponse } from '../api/taskApi';
import { employeeApi } from '../api/employeeApi';
import { mockJobs } from '../data/jobs.data';

// Flag để chuyển đổi giữa mock data và API thật
const USE_REAL_API = true;

// Cache for employee names
const employeeCache: Map<string, string> = new Map();

// Fetch employee name by ID with caching
async function getEmployeeName(employeeId: string): Promise<string> {
    if (!employeeId) return 'Chưa có';

    if (employeeCache.has(employeeId)) {
        return employeeCache.get(employeeId)!;
    }

    try {
        const employee = await employeeApi.getById(employeeId);
        const name = employee?.name || 'Chưa có';
        employeeCache.set(employeeId, name);
        return name;
    } catch (error) {
        console.error(`Failed to fetch employee ${employeeId}:`, error);
        return 'Chưa có';
    }
}

// Status mapping: BE -> FE
const beToFeStatus: Record<string, Job['status']> = {
    'NOT_STARTED': 'To Do',
    'IN_PROGRESS': 'In Progress',
    'COMPLETED': 'Done',
};

// Status mapping: FE -> BE
const feToBEStatus: Record<Job['status'], string> = {
    'To Do': 'NOT_STARTED',
    'In Progress': 'IN_PROGRESS',
    'In Review': 'IN_PROGRESS',
    'Blocked': 'NOT_STARTED',
    'Done': 'COMPLETED',
};

// Priority mapping: BE -> FE
const beTofePriority: Record<string, Job['priority']> = {
    'UNKNOWN': 'Low',
    'LOW': 'Low',
    'MEDIUM': 'Medium',
    'HIGH': 'High',
};

// Mapper: chuyển đổi BE TaskResponse sang FE Job (async to resolve names)
const mapToJob = async (task: TaskResponse): Promise<Job> => {
    const [managerName, assigneeName] = await Promise.all([
        getEmployeeName(task.assignerId),
        getEmployeeName(task.assigneeId),
    ]);

    return {
        id: task.id,
        code: task.name.substring(0, 3).toUpperCase() + '-' + task.id.substring(0, 4).toUpperCase(),
        name: task.name,
        type: 'Task', // Default
        group: 'Backend', // Default - valid JobGroup value
        status: beToFeStatus[task.status] || 'To Do',
        priority: beTofePriority[task.priority] || 'Medium',
        manager: managerName,
        assignee: assigneeName,
        startDate: task.startDate || task.createdAt,
        endDate: task.endDate || '',
        estimatedHours: 8, // Default
        description: task.note || '',
    };
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const jobService = {
    async getJobs(): Promise<Job[]> {
        if (USE_REAL_API) {
            try {
                const response = await taskApi.getAll();
                // Map all tasks with async employee name resolution
                const jobs = await Promise.all(response.data.map(mapToJob));
                return jobs;
            } catch (error) {
                console.error('Task API Error, falling back to mock:', error);
                return mockJobs;
            }
        }
        await delay(300);
        return mockJobs;
    },

    async getJobById(id: string): Promise<Job | undefined> {
        if (USE_REAL_API) {
            try {
                const response = await taskApi.getById(id);
                return mapToJob(response.data);
            } catch (error) {
                console.error('Task API Error, falling back to mock:', error);
                return mockJobs.find(job => job.id === id);
            }
        }
        await delay(200);
        return mockJobs.find(job => job.id === id);
    },

    async getJobsByProject(projectId: string): Promise<Job[]> {
        if (USE_REAL_API) {
            try {
                const response = await taskApi.getByProject(projectId);
                return response.data.map(mapToJob);
            } catch (error) {
                console.error('Task API Error:', error);
                return [];
            }
        }
        return [];
    },

    async updateJobStatus(id: string, status: Job['status']): Promise<Job | undefined> {
        if (USE_REAL_API) {
            try {
                const beStatus = feToBEStatus[status];
                const response = await taskApi.updateStatus(id, beStatus);
                return mapToJob(response.data);
            } catch (error) {
                console.error('Task API Error, falling back to mock:', error);
            }
        }
        await delay(200);
        const job = mockJobs.find(j => j.id === id);
        if (job) {
            job.status = status;
        }
        return job;
    },

    async updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined> {
        if (USE_REAL_API) {
            try {
                // If only status is being updated, use dedicated status endpoint
                if (updates.status && Object.keys(updates).filter(k => updates[k as keyof Job] !== undefined).length === 1) {
                    const beStatus = feToBEStatus[updates.status];
                    const response = await taskApi.updateStatus(id, beStatus);
                    return mapToJob(response.data);
                }

                // For full updates, first get existing task to preserve required fields
                const existingResponse = await taskApi.getById(id);
                const existingTask = existingResponse.data;

                const beStatus = updates.status ? feToBEStatus[updates.status] : existingTask.status;
                const bePriority = updates.priority ? updates.priority.toUpperCase() : existingTask.priority;

                const response = await taskApi.update(id, {
                    name: updates.name || existingTask.name,
                    status: beStatus,
                    priority: bePriority === 'HIGHEST' ? 'HIGH' : bePriority,
                    note: updates.description !== undefined ? updates.description : existingTask.note,
                    assigneeId: existingTask.assigneeId,
                    assignerId: existingTask.assignerId,
                    projectId: existingTask.projectId,
                    taskGroupId: existingTask.taskGroupId,
                    typeId: existingTask.typeId,
                    startDate: existingTask.startDate,
                    endDate: existingTask.endDate,
                });
                return mapToJob(response.data);
            } catch (error) {
                console.error('Task API Error, falling back to mock:', error);
            }
        }
        await delay(200);
        const job = mockJobs.find(j => j.id === id);
        if (job) {
            Object.assign(job, updates);
        }
        return job;
    },

    async addJob(input: CreateJobInput): Promise<Job> {
        if (USE_REAL_API) {
            try {
                const priority = input.priority ? input.priority.toUpperCase() : 'MEDIUM';

                const defaultProjectId = '00000000-0000-0000-0000-000000000001';
                const defaultTaskGroupId = '00000000-0000-0000-0000-000000000001';
                const defaultTypeId = '00000000-0000-0000-0000-000000000001';

                const response = await taskApi.create({
                    name: input.name,
                    status: 'NOT_STARTED',
                    priority: priority === 'CRITICAL' ? 'HIGH' : priority,
                    note: input.description || '',
                    projectId: defaultProjectId,
                    taskGroupId: defaultTaskGroupId,
                    typeId: defaultTypeId,
                    assignerId: '60d0fe4f5311236168a109ca',
                    assigneeId: '60d0fe4f5311236168a109ca',
                    startDate: input.startDate || null,
                    endDate: input.endDate || null,
                });
                return mapToJob(response.data);
            } catch (error) {
                console.error('Task API Error, falling back to mock:', error);
            }
        }
        await delay(300);
        const newJob: Job = {
            id: Math.random().toString(36).substr(2, 9),
            ...input,
            code: input.code || 'JOB-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            status: 'To Do',
        };
        mockJobs.push(newJob);
        return newJob;
    },

    async deleteJob(id: string): Promise<boolean> {
        if (USE_REAL_API) {
            try {
                await taskApi.delete(id);
                return true;
            } catch (error) {
                console.error('Task API Error, falling back to mock:', error);
                return false;
            }
        }
        await delay(200);
        const index = mockJobs.findIndex(job => job.id === id);
        if (index !== -1) {
            mockJobs.splice(index, 1);
            return true;
        }
        return false;
    },
};
