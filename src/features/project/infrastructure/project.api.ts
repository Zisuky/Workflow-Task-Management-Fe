import type { CreateProjectInput, Project } from '../../../shared/types/project';
import type { User } from '../../../shared/types';
import { projectApi } from '../../task/infrastructure/project.client';
import { userApi } from '../../user/infrastructure/user.api';
import { mockProjects } from '../../../data/projects.data';

let usersCache: User[] | null = null;
const PINNED_PROJECTS_KEY = 'pinnedProjectIds';
const projects = [...mockProjects];

const getUsers = async (): Promise<User[]> => {
  if (!usersCache) usersCache = await userApi.getAll();
  return usersCache;
};

const getUserName = (users: User[], userId: string): string => users.find(u => u.id === userId)?.name || userId;

const getPinnedProjectIds = (): Set<string> => {
  try {
    const stored = localStorage.getItem(PINNED_PROJECTS_KEY);
    if (stored) return new Set(JSON.parse(stored));
  } catch {
    // Ignore malformed local storage data and fallback to empty set.
  }
  return new Set();
};

const savePinnedProjectIds = (ids: Set<string>): void => {
  try {
    localStorage.setItem(PINNED_PROJECTS_KEY, JSON.stringify([...ids]));
  } catch {
    // Ignore local storage write failures.
  }
};

export const projectRepository = {
  async getProjects(): Promise<Project[]> {
    try {
      const response = await projectApi.getAll();
      const users = await getUsers();
      const projectsList = await Promise.all(response.data.map(async (projectResponse: { id: string; projectCode: string; name: string; description: string | null; createdAt: string; }) => {
        try {
          const membersResponse = await projectApi.getMembers(projectResponse.id);
          const members = membersResponse.data || [];
          const leaderId = members.length > 0 ? members[0].leaderId : null;
          return {
            id: projectResponse.id,
            code: projectResponse.projectCode,
            name: projectResponse.name,
            manager: leaderId ? getUserName(users, leaderId) : 'Chưa có',
            assignee: members.length > 0 ? members.map((m: { userId: string }) => getUserName(users, m.userId)).join(', ') : 'Chưa có',
            isPinned: false,
            description: projectResponse.description || '',
            group: 'Development',
            startDate: projectResponse.createdAt,
            endDate: '',
          } satisfies Project;
        } catch {
          return {
            id: projectResponse.id,
            code: projectResponse.projectCode,
            name: projectResponse.name,
            manager: 'Đang tải...',
            assignee: 'Đang tải...',
            isPinned: false,
            description: projectResponse.description || '',
            group: 'Development',
            startDate: projectResponse.createdAt,
            endDate: '',
          } satisfies Project;
        }
      }));

      const pinnedIds = getPinnedProjectIds();
      return projectsList.map(project => ({
        ...project,
        isPinned: pinnedIds.has(project.id),
      }));
    } catch {
      return [...projects];
    }
  },

  async addProject(input: CreateProjectInput): Promise<Project> {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) as { id?: string } : null;
    const fallbackUserId = user?.id || 'system';
    const response = await projectApi.create({
      name: input.name,
      description: input.description || '',
      companyId: 'temp-company-id',
      leaderId: input.leaderId || fallbackUserId,
      memberIds: input.memberIds || [],
    });
    return {
      id: response.data.id,
      code: response.data.projectCode,
      name: response.data.name,
      manager: 'Đang tải...',
      assignee: 'Đang tải...',
      isPinned: false as const,
      description: response.data.description || '',
      group: 'Development',
      startDate: response.data.createdAt,
      endDate: '',
    };
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const response = await projectApi.update(id, {
        name: updates.name,
        description: updates.description,
      });
      return {
        id: response.data.id,
        code: response.data.projectCode,
        name: response.data.name,
        manager: 'Đang tải...',
        assignee: 'Đang tải...',
        isPinned: false as const,
        description: response.data.description || '',
        group: 'Development',
        startDate: response.data.createdAt,
        endDate: '',
      };
    } catch {
      return null;
    }
  },

  async deleteProject(id: string): Promise<boolean> {
    try {
      await projectApi.delete(id);
      return true;
    } catch {
      return false;
    }
  },

  async togglePin(id: string): Promise<Project | null> {
    const pinnedIds = getPinnedProjectIds();
    const currentlyPinned = pinnedIds.has(id);
    if (currentlyPinned) pinnedIds.delete(id); else pinnedIds.add(id);
    savePinnedProjectIds(pinnedIds);
    return {
      id,
      isPinned: !currentlyPinned,
      code: '',
      name: '',
      manager: '',
      assignee: '',
      group: '',
      description: '',
      startDate: '',
      endDate: '',
    } as Project;
  },
};
