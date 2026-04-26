import type { CreateJobInput, Job } from '../../../shared/types/task';
import { taskApi, type TaskResponse } from './task.client';
import { userApi } from '../../user/infrastructure/user.api';
import { projectApi } from './project.client';
import { taskTypeApi } from './taskType.client';
import { taskGroupApi } from './taskGroup.client';
import { mockJobs } from '../../../data/jobs.data';

const userCache = new Map<string, string>();
const projectCache = new Map<string, string>();
const typeCache = new Map<string, string>();
const groupCache = new Map<string, string>();

const getUserName = async (userId: string | string[] | null | undefined): Promise<string> => {
  if (!userId) return '';
  if (Array.isArray(userId)) {
    const names = await Promise.all(userId.map(id => getUserName(id)));
    return names.filter(Boolean).join(', ');
  }
  if (userCache.has(userId)) return userCache.get(userId)!;
  try {
    const user = await userApi.getById(userId);
    const name = user?.name || userId;
    userCache.set(userId, name);
    return name;
  } catch {
    return userId;
  }
};

const getProjectName = async (projectId: string): Promise<string> => {
  if (!projectId) return 'Dự án';
  if (projectCache.has(projectId)) return projectCache.get(projectId)!;
  try {
    const response = await projectApi.getById(projectId);
    const name = response.data?.name || 'Dự án';
    projectCache.set(projectId, name);
    return name;
  } catch {
    return 'Dự án';
  }
};

const getTypeName = async (typeId: string): Promise<string> => {
  if (!typeId) return 'Task';
  if (typeCache.has(typeId)) return typeCache.get(typeId)!;
  try {
    const response = await taskTypeApi.getById(typeId);
    const name = response.data?.name || 'Task';
    typeCache.set(typeId, name);
    return name;
  } catch {
    return 'Task';
  }
};

const getGroupName = async (groupId: string): Promise<string> => {
  if (!groupId) return 'Backend';
  if (groupCache.has(groupId)) return groupCache.get(groupId)!;
  try {
    const response = await taskGroupApi.getById(groupId);
    const name = response.data?.name || 'Backend';
    groupCache.set(groupId, name);
    return name;
  } catch {
    return 'Backend';
  }
};

const beToFeStatus: Record<string, Job['status']> = {
  NOT_STARTED: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Done',
  IN_REVIEW: 'In Review',
  BLOCKED: 'Blocked',
  ON_HOLD: 'On Hold',
};

const feToBEStatus: Record<Job['status'], string> = {
  'To Do': 'NOT_STARTED',
  'In Progress': 'IN_PROGRESS',
  'In Review': 'IN_PROGRESS',
  Blocked: 'NOT_STARTED',
  'On Hold': 'NOT_STARTED',
  Done: 'COMPLETED',
};

const beTofePriority: Record<string, Job['priority']> = {
  UNKNOWN: 'Low',
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

const mapToJob = async (task: TaskResponse): Promise<Job> => {
  let managerName = '';
  let assigneeName = '';
  try {
    const membersResponse = await taskApi.getMembers(task.id);
    const members = membersResponse.data || [];
    const leader = members.find((m: { role: 'LEADER' | 'MEMBER'; userId: string }) => m.role === 'LEADER');
    if (leader) managerName = await getUserName(leader.userId);
    const assignees = members.filter((m: { role: 'LEADER' | 'MEMBER'; userId: string }) => m.role === 'MEMBER');
    if (assignees.length > 0) {
      assigneeName = (await Promise.all(assignees.map((m: { userId: string }) => getUserName(m.userId)))).filter(Boolean).join(', ');
    } else if (leader) {
      assigneeName = managerName;
    }
  } catch {
    [managerName, assigneeName] = await Promise.all([getUserName(task.assignerId), getUserName(task.assigneeId)]);
  }

  const [projectName, typeName, groupName] = await Promise.all([
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
    manager: managerName || 'Chưa có',
    assignee: assigneeName || 'Chưa có',
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

export const taskRepository = {
  async getJobs(): Promise<Job[]> {
    try {
      const response = await taskApi.getAll();
      return Promise.all(response.data.map(mapToJob));
    } catch {
      return mockJobs;
    }
  },
  async getJobById(id: string): Promise<Job | undefined> {
    try {
      const response = await taskApi.getById(id);
      return mapToJob(response.data);
    } catch {
      return mockJobs.find(job => job.id === id);
    }
  },
  async getJobsByProject(projectId: string): Promise<Job[]> {
    try {
      const response = await taskApi.getByProject(projectId);
      return Promise.all(response.data.map(mapToJob));
    } catch {
      return [];
    }
  },
  async updateJobStatus(id: string, status: Job['status']): Promise<Job | undefined> {
    try {
      const response = await taskApi.updateStatus(id, feToBEStatus[status]);
      return mapToJob(response.data);
    } catch {
      return mockJobs.find(j => j.id === id);
    }
  },
  async updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined> {
    try {
      const existing = await taskApi.getById(id);
      const response = await taskApi.update(id, {
        name: updates.name || existing.data.name,
        status: updates.status ? feToBEStatus[updates.status] : existing.data.status,
        priority: updates.priority ? updates.priority.toUpperCase() : existing.data.priority,
        note: updates.description ?? existing.data.note,
        assigneeId: existing.data.assigneeId,
        assignerId: existing.data.assignerId,
        projectId: existing.data.projectId,
        taskGroupId: updates.taskGroupId || existing.data.taskGroupId,
        typeId: updates.typeId || existing.data.typeId,
        startDate: existing.data.startDate,
        endDate: existing.data.endDate,
        userUpdateId: existing.data.userUpdateId || existing.data.assignerId || 'system',
      });
      return mapToJob(response.data);
    } catch {
      return mockJobs.find(j => j.id === id);
    }
  },
  async addJob(input: CreateJobInput): Promise<Job> {
    const payload = {
      name: input.name,
      status: 'NOT_STARTED',
      priority: input.priority ? input.priority.toUpperCase() : 'MEDIUM',
      note: input.description || '',
      projectId: input.projectId || (await projectApi.getAll()).data[0]?.id,
      taskGroupId: input.taskGroupId || (await taskGroupApi.getAll()).data[0]?.id,
      typeId: input.typeId || (await taskTypeApi.getAll()).data[0]?.id,
      assignerId: input.assignerId || (await userApi.getCurrentUser())?.id || 'system',
      assigneeId: input.assigneeId ? input.assigneeId.split(',').map(id => id.trim()) : [],
      userUpdateId: input.assignerId || 'system',
      startDate: input.startDate ? `${input.startDate}T00:00:00` : null,
      endDate: input.endDate ? `${input.endDate}T23:59:59` : null,
    };
    const response = await taskApi.create(payload as never);
    return mapToJob(response.data);
  },
  async deleteJob(id: string): Promise<boolean> {
    try {
      await taskApi.delete(id);
      return true;
    } catch {
      return false;
    }
  },
};
