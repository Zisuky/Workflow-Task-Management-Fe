import type { Job, CreateJobInput } from '../models';
import { taskApi, type TaskResponse } from '../api/taskApi';
import { employeeApi } from '../api/employeeApi';
import { projectApi } from '../api/projectApi';
import { taskTypeApi } from '../api/taskTypeApi';
import { taskGroupApi } from '../api/taskGroupApi';
import { mockJobs } from '../data/jobs.data';

const USE_REAL_API = true;

const employeeCache: Map<string, string> = new Map();
const projectCache: Map<string, string> = new Map();

async function getEmployeeName(employeeId: string): Promise<string> {
    if (!employeeId) return '';

    if (employeeCache.has(employeeId)) {
        return employeeCache.get(employeeId)!;
    }


    if (employeeId.includes(' ')) {
        employeeCache.set(employeeId, employeeId);
        return employeeId;
    }

    try {
        const employee = await employeeApi.getById(employeeId);
        const name = employee?.name || employeeId;
        employeeCache.set(employeeId, name);
        return name;
    } catch (error) {
        console.warn(`Failed to fetch employee name for ${employeeId}, using ID as fallback`);
        employeeCache.set(employeeId, employeeId);
        return employeeId;
    }
}

async function getProjectName(projectId: string): Promise<string> {
    if (!projectId) return 'Dự án';
    if (projectCache.has(projectId)) return projectCache.get(projectId)!;

    try {
        const response = await projectApi.getById(projectId);
        if (response.data && response.data.name) {
            projectCache.set(projectId, response.data.name);
            return response.data.name;
        }
    } catch {
    }
    return 'Dự án';
}

const typeCache: Map<string, string> = new Map();
const groupCache: Map<string, string> = new Map();

export const getTypeName = async (typeId: string): Promise<string> => {
    if (!typeId) return 'Task';
    if (typeCache.has(typeId)) return typeCache.get(typeId)!;

    try {
        const response = await taskTypeApi.getById(typeId);
        if (response.data && response.data.name) {
            typeCache.set(typeId, response.data.name);
            return response.data.name;
        }
    } catch {
    }
    return 'Task';
};

export const getGroupName = async (groupId: string): Promise<string> => {
    if (!groupId) return 'Backend';
    if (groupCache.has(groupId)) return groupCache.get(groupId)!;

    try {
        const response = await taskGroupApi.getById(groupId);
        if (response.data && response.data.name) {
            groupCache.set(groupId, response.data.name);
            return response.data.name;
        }
    } catch {
    }
    return 'Backend';
};

const beToFeStatus: Record<string, Job['status']> = {
    'NOT_STARTED': 'To Do',
    'IN_PROGRESS': 'In Progress',
    'COMPLETED': 'Done',
    'IN_REVIEW': 'In Review',
    'BLOCKED': 'Blocked',
    'ON_HOLD': 'On Hold',
};

const feToBEStatus: Record<Job['status'], string> = {
    'To Do': 'NOT_STARTED',
    'In Progress': 'IN_PROGRESS',
    'In Review': 'IN_PROGRESS',
    'Blocked': 'NOT_STARTED',
    'On Hold': 'NOT_STARTED',
    'Done': 'COMPLETED',
};

const beTofePriority: Record<string, Job['priority']> = {
    'UNKNOWN': 'Low',
    'LOW': 'Low',
    'MEDIUM': 'Medium',
    'HIGH': 'High',
};



const mapToJob = async (task: TaskResponse): Promise<Job> => {
    const [managerName, assigneeName, projectName, typeName, groupName] = await Promise.all([
        getEmployeeName(task.assignerId),
        getEmployeeName(task.assigneeId),
        getProjectName(task.projectId),
        getTypeName(task.typeId),
        getGroupName(task.taskGroupId),
    ]);

    return {
        id: task.id,
        code: task.name.substring(0, 3).toUpperCase() + '-' + task.id.substring(0, 4).toUpperCase(),
        name: task.name,
        type: typeName as Job['type'],
        group: groupName as Job['group'],
        status: beToFeStatus[task.status] || 'To Do',
        priority: beTofePriority[task.priority] || 'Medium',
        manager: managerName,
        assignee: assigneeName,
        startDate: task.startDate || task.createdAt,
        endDate: task.endDate || '',
        estimatedHours: 8,
        description: task.note || '',
        project: projectName,
        projectId: task.projectId,
        typeId: task.typeId,
        taskGroupId: task.taskGroupId,
    };
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const jobService = {
    async getJobs(): Promise<Job[]> {
        if (USE_REAL_API) {
            try {
                const response = await taskApi.getAll();
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
                const jobs = await Promise.all(response.data.map(mapToJob));
                return jobs;
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
                if (updates.status && Object.keys(updates).filter(k => updates[k as keyof Job] !== undefined).length === 1) {
                    const beStatus = feToBEStatus[updates.status];
                    const response = await taskApi.updateStatus(id, beStatus);
                    return mapToJob(response.data);
                }

                const existingResponse = await taskApi.getById(id);
                const existingTask = existingResponse.data;

                const beStatus = updates.status ? feToBEStatus[updates.status] : existingTask.status;
                const bePriority = updates.priority ? updates.priority.toUpperCase() : existingTask.priority;

                const updatePayload = {
                    name: updates.name || existingTask.name,
                    status: beStatus,
                    priority: bePriority === 'HIGHEST' ? 'HIGH' : bePriority,
                    note: updates.description !== undefined ? updates.description : existingTask.note,
                    assigneeId: existingTask.assigneeId,
                    assignerId: existingTask.assignerId,
                    projectId: existingTask.projectId,
                    taskGroupId: updates.taskGroupId || existingTask.taskGroupId,
                    typeId: updates.typeId || existingTask.typeId,
                    startDate: existingTask.startDate,
                    endDate: existingTask.endDate,
                    userUpdateId: existingTask.userUpdateId || existingTask.assignerId || 'system',
                };
                const response = await taskApi.update(id, updatePayload);
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

                let projectId = input.projectId;
                let taskGroupId = input.taskGroupId;
                let typeId = input.typeId;

                if (!projectId) {
                    try {
                        const projectsRes = await projectApi.getAll();
                        if (projectsRes.data && projectsRes.data.length > 0) {
                            projectId = projectsRes.data[0].id;
                        }
                    } catch (e) {
                        console.warn('Failed to fetch projects:', e);
                    }
                }

                if (!typeId) {
                    try {
                        const typesRes = await taskTypeApi.getAll();
                        if (typesRes.data && typesRes.data.length > 0) {
                            typeId = typesRes.data[0].id;
                        }
                    } catch (e) {
                        console.warn('Failed to fetch task types:', e);
                    }
                }

                if (!taskGroupId && projectId) {
                    try {
                        const groupsRes = await taskGroupApi.getByProjectId(projectId);
                        if (groupsRes.data && groupsRes.data.length > 0) {
                            taskGroupId = groupsRes.data[0].id;
                        }
                    } catch (e) {
                        console.warn('Failed to fetch task groups:', e);
                    }
                }

                if (!taskGroupId) {
                    try {
                        const allGroupsRes = await taskGroupApi.getAll();
                        if (allGroupsRes.data && allGroupsRes.data.length > 0) {
                            taskGroupId = allGroupsRes.data[0].id;
                        }
                    } catch (e) {
                        console.warn('Failed to fetch all task groups:', e);
                    }
                }

                if (!projectId || !typeId || !taskGroupId) {
                    throw new Error(`Missing required IDs: projectId=${projectId}, typeId=${typeId}, taskGroupId=${taskGroupId}`);
                }

                let assignerId = input.assignerId;
                if (!assignerId) {
                    try {
                        const currentUser = await employeeApi.getCurrentUser();
                        if (currentUser?.id) {
                            assignerId = currentUser.id;
                            console.log('Using current user ID for assignerId:', assignerId);
                        }
                    } catch (e) {
                        console.warn('Failed to get current user:', e);
                    }
                }
                assignerId = assignerId || 'system';

                const assigneeId = input.assigneeId || 'system';

                const response = await taskApi.create({
                    name: input.name,
                    status: 'NOT_STARTED',
                    priority: priority === 'CRITICAL' || priority === 'HIGHEST' ? 'HIGH' : priority,
                    note: input.description || '',
                    projectId: projectId,
                    taskGroupId: taskGroupId,
                    typeId: typeId,
                    assignerId: assignerId,
                    assigneeId: assigneeId,
                    userUpdateId: assignerId,
                    startDate: input.startDate ? `${input.startDate}T00:00:00` : null,
                    endDate: input.endDate ? `${input.endDate}T23:59:59` : null,
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
