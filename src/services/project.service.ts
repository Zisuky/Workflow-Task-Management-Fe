import type { Project, CreateProjectInput } from '../models';
import { projectApi, type ProjectResponse, type ProjectMemberResponse } from '../api/projectApi';
import { employeeApi, type Employee } from '../api/employeeApi';
import { mockProjects } from '../data';

// Flag để chuyển đổi giữa mock data và API thật
const USE_REAL_API = true;

// Cache employees để tránh gọi API nhiều lần
let employeesCache: Employee[] | null = null;

// Lấy employees từ cache hoặc API
const getEmployees = async (): Promise<Employee[]> => {
    if (!employeesCache) {
        employeesCache = await employeeApi.getAll();
    }
    return employeesCache;
};

// Tìm tên employee theo ID
const getEmployeeName = (employees: Employee[], userId: string): string => {
    const employee = employees.find(e => e.id === userId);
    return employee?.name || userId;
};

// Mapper: chuyển đổi BE ProjectResponse sang FE Project
const mapToProject = (
    response: ProjectResponse,
    members: ProjectMemberResponse[],
    employees: Employee[]
): Project => {
    // Manager: Use leaderId of the first member (as it seems duplicated or global for project)
    const leaderId = members.length > 0 ? members[0].leaderId : null;
    const managerName = leaderId ? getEmployeeName(employees, leaderId) : 'Chưa có';

    // Assignee: Map each member's userId to a name
    const assignees = members.length > 0
        ? members.map(m => getEmployeeName(employees, m.userId)).join(', ')
        : 'Chưa có';

    return {
        id: response.id,
        code: response.projectCode,
        name: response.name,
        manager: managerName,
        assignee: assignees,
        isPinned: false,
        description: response.description || '',
        group: 'Development',
        startDate: response.createdAt,
        endDate: '',
    };
};

// Simple mapper cho các trường hợp không cần load members
const simpleMapToProject = (response: ProjectResponse): Project => ({
    id: response.id,
    code: response.projectCode,
    name: response.name,
    manager: 'Đang tải...',
    assignee: 'Đang tải...',
    isPinned: false,
    description: response.description || '',
    group: 'Development',
    startDate: response.createdAt,
    endDate: '',
});

// Mock data fallback
let projects = [...mockProjects];
let nextId = projects.length + 1;

export const projectService = {
    async getProjects(): Promise<Project[]> {
        if (USE_REAL_API) {
            try {
                const response = await projectApi.getAll();

                // Lấy danh sách employees một lần
                const employees = await getEmployees();

                // Load members cho mỗi project
                const projectsList = await Promise.all(
                    response.data.map(async (projectResponse) => {
                        try {
                            const membersResponse = await projectApi.getMembers(projectResponse.id);
                            return mapToProject(projectResponse, membersResponse.data || [], employees);
                        } catch {
                            return mapToProject(projectResponse, [], employees);
                        }
                    })
                );

                // Load isPinned status for each project
                const userStr = localStorage.getItem('user');
                const userId = userStr ? JSON.parse(userStr).id : null;

                if (userId) {
                    // Check pin status for each project in parallel
                    const pinChecks = await Promise.allSettled(
                        projectsList.map(async (project) => {
                            try {
                                const pinResponse = await projectApi.isPinned(project.id, userId);
                                return { id: project.id, isPinned: pinResponse.data };
                            } catch {
                                return { id: project.id, isPinned: false };
                            }
                        })
                    );

                    // Update projects with pin status
                    pinChecks.forEach((result, index) => {
                        if (result.status === 'fulfilled') {
                            projectsList[index].isPinned = result.value.isPinned;
                        }
                    });
                }

                return projectsList;
            } catch (error) {
                console.error('API Error, falling back to mock:', error);
                return [...projects];
            }
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
        return [...projects];
    },

    async getProjectById(id: string): Promise<Project | undefined> {
        if (USE_REAL_API) {
            try {
                const response = await projectApi.getById(id);
                return simpleMapToProject(response.data);
            } catch (error) {
                console.error('API Error, falling back to mock:', error);
                return projects.find(p => p.id === id);
            }
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
        return projects.find(p => p.id === id);
    },

    async addProject(input: CreateProjectInput): Promise<Project> {
        if (USE_REAL_API) {
            try {
                // Sử dụng leaderId và memberIds từ form, fallback nếu không có
                const userStr = localStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : null;
                const fallbackUserId = user?.id || 'system';

                const response = await projectApi.create({
                    name: input.name,
                    description: input.description || '',
                    companyId: '60d0fe4f5311236168a109ca', // Default Company ID
                    leaderId: input.leaderId || fallbackUserId, // Trưởng dự án từ form
                    memberIds: input.memberIds || [], // Thành viên từ form
                });
                return simpleMapToProject(response.data);
            } catch (error) {
                console.error('API Error, falling back to mock:', error);
                throw error;
            }
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
        const newProject: Project = {
            id: String(nextId++),
            code: input.code || 'PRJ-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            name: input.name,
            manager: input.manager,
            assignee: input.members,
            isPinned: false,
            group: input.group,
            description: input.description,
            startDate: input.startDate,
            endDate: input.endDate,
        };
        projects = [newProject, ...projects];
        return newProject;
    },

    async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
        if (USE_REAL_API) {
            try {
                const response = await projectApi.update(id, {
                    name: updates.name,
                    description: updates.description,
                });
                return simpleMapToProject(response.data);
            } catch (error) {
                console.error('API Error, falling back to mock:', error);
                return null;
            }
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
        const index = projects.findIndex(p => p.id === id);
        if (index === -1) return null;
        projects[index] = { ...projects[index], ...updates };
        return projects[index];
    },

    async deleteProject(id: string): Promise<boolean> {
        if (USE_REAL_API) {
            try {
                await projectApi.delete(id);
                return true;
            } catch (error) {
                console.error('API Error, falling back to mock:', error);
                return false;
            }
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
        const index = projects.findIndex(p => p.id === id);
        if (index === -1) return false;
        projects.splice(index, 1);
        return true;
    },

    async togglePin(id: string): Promise<Project | null> {
        if (USE_REAL_API) {
            try {
                // Get userId from localStorage
                const userStr = localStorage.getItem('user');
                const userId = userStr ? JSON.parse(userStr).id : '60d0fe4f5311236168a109ca';

                // First check if project is currently pinned
                const isPinnedResponse = await projectApi.isPinned(id, userId);
                const currentlyPinned = isPinnedResponse.data;

                // Toggle: if pinned -> unpin, if not pinned -> pin
                if (currentlyPinned) {
                    await projectApi.unpin(id, userId);
                } else {
                    await projectApi.pin(id, userId);
                }

                // Return updated project state
                const projectResponse = await projectApi.getById(id);
                const project = simpleMapToProject(projectResponse.data);
                project.isPinned = !currentlyPinned;
                return project;
            } catch (error) {
                console.error('Pin API Error, falling back to mock:', error);
            }
        }
        // Fallback to mock
        await new Promise((resolve) => setTimeout(resolve, 100));
        const project = projects.find(p => p.id === id);
        if (project) {
            project.isPinned = !project.isPinned;
            return project;
        }
        return null;
    },

    async searchProjects(query: string): Promise<Project[]> {
        if (USE_REAL_API) {
            try {
                const response = await projectApi.search(query);
                return response.data.map(simpleMapToProject);
            } catch (error) {
                console.error('API Error, falling back to mock:', error);
            }
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
        const lowerQuery = query.toLowerCase();
        return projects.filter(p =>
            p.code.toLowerCase().includes(lowerQuery) ||
            p.name.toLowerCase().includes(lowerQuery) ||
            p.manager.toLowerCase().includes(lowerQuery)
        );
    },
};
