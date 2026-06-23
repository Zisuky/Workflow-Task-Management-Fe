import type { CreateProjectInput, Project } from '../../../shared/types/project';
import type { User } from '../../../shared/types';
import { projectApi } from '../../task/infrastructure/project.client';
import { userApi } from '../../user/infrastructure/user.api';
import { mockProjects } from '../../../data/projects.data';

let usersCache: User[] | null = null;

const getUsers = async (): Promise<User[]> => {
  if (!usersCache) usersCache = await userApi.getAll();
  return usersCache;
};

const getUserName = (users: User[], userId: string): string =>
  users.find(u => u.id === userId)?.name || userId;

export const projectRepository = {
  async getProjects(): Promise<Project[]> {
    try {
      // BE returns Page<Project> — access .content for the items
      const response = await projectApi.getAll(0, 100);
      const projectsList = response.data?.content ?? response.data ?? [];
      const users = await getUsers();

      return Promise.all(
        projectsList.map(async (p: {
          id: string;
          projectCode: string;
          name: string;
          description: string | null;
          isPinned: boolean;
          workflowId: string | null;
          createdAt: string;
          statusId?: string | null;
          statusCode?: string | null;
          statusName?: string | null;
        }) => {
          try {
            const [membersResponse, detailResponse] = await Promise.all([
              projectApi.getMembers(p.id),
              projectApi.getDetail(p.id).catch(() => ({ data: null })),
            ]);
            const members = membersResponse.data ?? [];
            const detail = detailResponse.data;
            const managerMember = members.length > 0 ? members[0] : null;
            return {
              id: p.id,
              code: p.projectCode,
              name: p.name,
              manager: managerMember ? getUserName(users, managerMember.userId) : 'Chưa có',
              assignee: members.length > 0
                ? members.map((m: { userId: string }) => getUserName(users, m.userId)).join(', ')
                : 'Chưa có',
              isPinned: p.isPinned ?? false,
              description: p.description || '',
              workflowId: p.workflowId,
              startDate: detail?.startDate ?? null,
              endDate: detail?.endDate ?? null,
              statusId: p.statusId ?? null,
              statusCode: p.statusCode ?? null,
              statusName: p.statusName ?? null,
              leaderId: managerMember ? managerMember.userId : null,
              memberIds: members.map((m: { userId: string }) => m.userId),
            } satisfies Project;
          } catch {
            return {
              id: p.id,
              code: p.projectCode,
              name: p.name,
              manager: 'Đang tải...',
              assignee: 'Đang tải...',
              isPinned: p.isPinned ?? false,
              description: p.description || '',
              workflowId: p.workflowId,
              startDate: null,
              endDate: null,
              statusId: null,
              statusCode: null,
              statusName: null,
            } satisfies Project;
          }
        })
      );
    } catch {
      return [...mockProjects];
    }
  },

  async addProject(input: CreateProjectInput): Promise<Project> {
    // BE CreateProjectRequest: name, description, leaderId, memberIds — no companyId
    // BE expects LocalDateTime → convert "YYYY-MM-DD" to "YYYY-MM-DDTHH:mm:ss"
    const response = await projectApi.create({
      name: input.name,
      description: input.description || '',
      leaderId: input.leaderId,
      memberIds: input.memberIds || [],
      workflowId: input.workflowId,
      startDate: `${input.startDate}T00:00:00`,
      endDate: `${input.endDate}T23:59:59`,
    }); 
    const p = response.data;
    return {
      id: p.id,
      code: p.projectCode,
      name: p.name,
      manager: 'Đang tải...',
      assignee: 'Đang tải...',
      isPinned: false,
      description: p.description || '',
      workflowId: p.workflowId,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
    };
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const response = await projectApi.update(id, {
        name: updates.name,
        description: updates.description,
        leaderId: updates.leaderId,
        memberIds: updates.memberIds,
      });
      const p = response.data;
      return {
        id: p.id,
        code: p.projectCode ?? p.code,
        name: p.name,
        manager: updates.manager || 'Chưa có',
        assignee: updates.assignee || 'Chưa có',
        isPinned: p.isPinned ?? false,
        description: p.description || '',
        workflowId: p.workflowId,
        startDate: updates.startDate ?? null,
        endDate: updates.endDate ?? null,
        statusId: p.statusId ?? updates.statusId ?? null,
        statusCode: p.statusCode ?? updates.statusCode ?? null,
        statusName: p.statusName ?? updates.statusName ?? null,
        leaderId: updates.leaderId ?? null,
        memberIds: updates.memberIds ?? [],
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

  // Uses real BE endpoints: PATCH /projects/{id}/pinned and PATCH /projects/{id}/unpinned
  async pinProject(id: string): Promise<void> {
    await projectApi.pin(id);
  },

  async unpinProject(id: string): Promise<void> {
    await projectApi.unpin(id);
  },
};
