import type { CreateTaskInput, Task } from '../../../shared/types/task';
import { bePriorityToDisplay } from '../../../shared/types/index';
import { taskApi, type TaskResponse } from './task.client';
import { userApi } from '../../user/infrastructure/user.api';
import { projectApi } from './project.client';
import { taskGroupApi } from './taskGroup.client';
import { taskStatusApi } from './taskStatus.client';
import { taskPriorityApi } from './taskPriority.client';

const userCache = new Map<string, string>();
const projectCache = new Map<string, string>();
const groupCache = new Map<string, string>();
const statusCache = new Map<string, { code: string; name: string }>();
const priorityCache = new Map<string, { code: string; name: string }>();

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
  if (!projectId) return '';
  if (projectCache.has(projectId)) return projectCache.get(projectId)!;
  try {
    const response = await projectApi.getById(projectId);
    const name = response.data?.name || '';
    projectCache.set(projectId, name);
    return name;
  } catch {
    return '';
  }
};

const getGroupName = async (groupId: string): Promise<string> => {
  if (!groupId) return '';
  if (groupCache.has(groupId)) return groupCache.get(groupId)!;
  try {
    const response = await taskGroupApi.getById(groupId);
    const name = response.data?.name || '';
    groupCache.set(groupId, name);
    return name;
  } catch {
    return '';
  }
};

const getStatusInfo = async (statusId: string): Promise<{ code: string; name: string }> => {
  if (!statusId) return { code: 'NOT_STARTED', name: 'To Do' };
  if (statusCache.has(statusId)) return statusCache.get(statusId)!;
  try {
    const response = await taskStatusApi.getById(statusId);
    const info = { code: response.data?.code || 'NOT_STARTED', name: response.data?.name || 'To Do' };
    statusCache.set(statusId, info);
    return info;
  } catch {
    return { code: 'NOT_STARTED', name: 'To Do' };
  }
};

const getPriorityInfo = async (priorityId: string): Promise<{ code: string; name: string }> => {
  if (!priorityId) return { code: 'MEDIUM', name: 'Medium' };
  if (priorityCache.has(priorityId)) return priorityCache.get(priorityId)!;
  try {
    const response = await taskPriorityApi.getById(priorityId);
    const info = { code: response.data?.code || 'MEDIUM', name: response.data?.name || 'Medium' };
    priorityCache.set(priorityId, info);
    return info;
  } catch {
    return { code: 'MEDIUM', name: 'Medium' };
  }
};

// Normalize a date value that may be ISO string, array [y,m,d,...], or null
const normalizeDate = (val: string | number[] | null | undefined): string => {
  if (!val) return '';
  if (Array.isArray(val)) {
    const [year, month, day] = val as number[];
    if (!year || !month || !day) return '';
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  // Already a string — strip time part to keep only date
  return String(val).split('T')[0];
};

const mapToTask = async (task: TaskResponse): Promise<Task> => {
  let managerName = '';
  let assigneeName = '';
  try {
    const membersResponse = await taskApi.getMembers(task.id);
    const members = membersResponse.data || [];
    if (members.length > 0) {
      managerName = await getUserName(members[0].userId);
      if (members.length > 1) {
        assigneeName = (await Promise.all(
          members.slice(1).map((m: { userId: string }) => getUserName(m.userId))
        )).filter(Boolean).join(', ');
      } else {
        assigneeName = managerName;
      }
    }
  } catch {}

  const [projectName, groupName, statusInfo, priorityInfo] = await Promise.all([
    getProjectName(task.projectId),
    getGroupName(task.taskGroupId),
    getStatusInfo(task.statusId),
    getPriorityInfo(task.priorityId),
  ]);

  return {
    id: task.id,
    code: task.code || (task.name.substring(0, 3).toUpperCase() + '-' + task.id.substring(0, 4).toUpperCase()),
    name: task.name,
    group: groupName as Task['group'],
    status: (statusInfo.name || 'To Do') as Task['status'],
    priority: bePriorityToDisplay[priorityInfo.code] || 'Medium',
    manager: managerName || 'Chưa có',
    assignee: assigneeName || 'Chưa có',
    startDate: normalizeDate(task.startDate as string | number[] | null) || normalizeDate(task.createdAt as string | number[] | null),
    endDate: normalizeDate(task.endDate as string | number[] | null),
    description: task.note || '',
    project: projectName,
    projectId: task.projectId,
    taskGroupId: task.taskGroupId,
    statusId: task.statusId,
    priorityId: task.priorityId,
    isPinned: task.isPinned,
    parentTaskId: task.parentTaskId,
    createdAt: normalizeDate(task.createdAt as string | number[] | null),
  };
};

export const taskRepository = {
  async getTasks(): Promise<Task[]> {
    try {
      const response = await taskApi.getAll(0, 100);
      const items: TaskResponse[] = response.data?.content ?? response.data ?? [];
      return Promise.all(items.map(mapToTask));
    } catch {
      return [];
    }
  },

  async getTaskById(id: string): Promise<Task | undefined> {
    try {
      const response = await taskApi.getById(id);
      return mapToTask(response.data);
    } catch {
      return undefined;
    }
  },

  async getTasksByProject(projectId: string): Promise<Task[]> {
    try {
      const response = await taskApi.getByProject(projectId);
      const items: TaskResponse[] = response.data ?? [];
      return Promise.all(items.map(mapToTask));
    } catch {
      return [];
    }
  },

  async getTasksByUser(userId: string): Promise<Task[]> {
    try {
      const response = await taskApi.getByUser(userId);
      const items: TaskResponse[] = response.data ?? [];
      return Promise.all(items.map(mapToTask));
    } catch {
      return [];
    }
  },

  async updateTaskStatus(id: string, statusId: string): Promise<Task | undefined> {
    try {
      const response = await taskApi.updateStatus(id, statusId);
      return mapToTask(response.data);
    } catch {
      return undefined;
    }
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    try {
      const payload: Record<string, unknown> = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.statusId !== undefined) payload.statusId = updates.statusId;
      if (updates.priorityId !== undefined) payload.priorityId = updates.priorityId;
      if (updates.taskGroupId !== undefined) payload.taskGroupId = updates.taskGroupId;
      if (updates.description !== undefined) payload.note = updates.description;
      if (updates.startDate !== undefined) payload.startDate = updates.startDate ? `${updates.startDate}T00:00:00` : null;
      if (updates.endDate !== undefined) payload.endDate = updates.endDate ? `${updates.endDate}T23:59:59` : null;
      if (updates.isPinned !== undefined) payload.isPinned = updates.isPinned;

      const response = await taskApi.update(id, payload);
      return mapToTask(response.data);
    } catch {
      return undefined;
    }
  },

  async addTask(input: CreateTaskInput): Promise<Task> {
    const [defaultProject, defaultGroup] = await Promise.all([
      !input.projectId
        ? projectApi.getAll(0, 1).then(r => (r.data?.content ?? r.data ?? [])[0]?.id).catch(() => undefined)
        : Promise.resolve(input.projectId),
      !input.taskGroupId
        ? taskGroupApi.getAll().then(r => (r.data?.data ?? r.data ?? [])[0]?.id).catch(() => undefined)
        : Promise.resolve(input.taskGroupId),
    ]);

    let resolvedStatusId = input.statusId;
    if (!resolvedStatusId && (input.projectId ?? defaultProject)) {
      const pid = input.projectId ?? defaultProject;
      try {
        const firstStatusRes = await projectApi.getFirstWorkflowStatus(pid as string);
        const firstStatusId = (firstStatusRes as { data?: { statusId?: string } })?.data?.statusId;
        if (firstStatusId) resolvedStatusId = firstStatusId;
      } catch {}
    }
    if (!resolvedStatusId) {
      try {
        const statusRes = await taskStatusApi.getByCode('NOT_STARTED');
        resolvedStatusId = statusRes.data?.id;
      } catch {}
    }

    let resolvedPriorityId = input.priorityId;
    if (!resolvedPriorityId && input.priority) {
      const priorityCode = input.priority.toUpperCase();
      try {
        const priorityRes = await taskPriorityApi.getByCode(priorityCode);
        resolvedPriorityId = priorityRes.data?.id;
      } catch {}
    }

    const payload: Record<string, unknown> = {
      name: input.name,
      statusId: resolvedStatusId,
      priorityId: resolvedPriorityId,
      note: input.description || '',
      projectId: defaultProject,
      taskGroupId: defaultGroup,
      assignerId: input.assignerId || null,
      assigneeId: input.assigneeId
        ? input.assigneeId.split(',').map(id => id.trim()).filter(Boolean)
        : [],
      startDate: input.startDate ? `${input.startDate}T00:00:00` : null,
      endDate: input.endDate ? `${input.endDate}T23:59:59` : null,
    };

    const response = await taskApi.create(payload);
    return mapToTask(response.data);
  },

  async deleteTask(id: string): Promise<boolean> {
    try {
      await taskApi.delete(id);
      return true;
    } catch {
      return false;
    }
  },

  async pinTask(id: string): Promise<void> {
    await taskApi.pin(id);
  },

  async unpinTask(id: string): Promise<void> {
    await taskApi.unpin(id);
  },
};
