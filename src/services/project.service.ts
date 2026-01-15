import type { Project, CreateProjectInput } from '../models';
import { projectApi, type ProjectResponse, type ProjectMemberResponse } from '../api/projectApi';
import { employeeApi, type Employee } from '../api/employeeApi';

import { mockProjects } from '../data';

const USE_REAL_API = true;

let employeesCache: Employee[] | null = null;

const getEmployees = async (): Promise<Employee[]> => {
    if (!employeesCache) {
        employeesCache = await employeeApi.getAll();
    }
    return employeesCache;
};

const getEmployeeName = (employees: Employee[], userId: string): string => {
    const employee = employees.find(e => e.id === userId);
    return employee?.name || userId;
};

const mapToProject = (
    response: ProjectResponse,
    members: ProjectMemberResponse[],
    employees: Employee[]
): Project => {
    const leaderId = members.length > 0 ? members[0].leaderId : null;
    const managerName = leaderId ? getEmployeeName(employees, leaderId) : 'Chưa có';
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


const PINNED_PROJECTS_KEY = 'pinnedProjectIds';

const getPinnedProjectIds = (): Set<string> => {
    try {
        const stored = localStorage.getItem(PINNED_PROJECTS_KEY);
        if (stored) {
            return new Set(JSON.parse(stored));
        }
    } catch (error) {
        console.error('Error reading pinned projects from localStorage:', error);
    }
    return new Set();
};

const savePinnedProjectIds = (ids: Set<string>): void => {
    try {
        localStorage.setItem(PINNED_PROJECTS_KEY, JSON.stringify([...ids]));
    } catch (error) {
        console.error('Error saving pinned projects to localStorage:', error);
    }
};

let projects = [...mockProjects];
let nextId = projects.length + 1;

export const projectService = {
    async getProjects(): Promise<Project[]> {
        if (USE_REAL_API) {
            try {
                const response = await projectApi.getAll()
                const employees = await getEmployees();
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

                const pinnedIds = getPinnedProjectIds();
                projectsList.forEach(project => {
                    project.isPinned = pinnedIds.has(project.id);
                });

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
                const userStr = localStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : null;
                const fallbackUserId = user?.id || 'system';


                const companyId = 'temp-company-id';

                if (!companyId) {
                    throw new Error('No company found. Please create a company first.');
                }

                const response = await projectApi.create({
                    name: input.name,
                    description: input.description || '',
                    companyId: companyId,
                    leaderId: input.leaderId || fallbackUserId,
                    memberIds: input.memberIds || [],

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
        const pinnedIds = getPinnedProjectIds();
        const currentlyPinned = pinnedIds.has(id);

        if (currentlyPinned) {
            pinnedIds.delete(id);
        } else {
            pinnedIds.add(id);
        }
        savePinnedProjectIds(pinnedIds);

        // Return immediately without API call for instant response
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
            endDate: ''
        } as Project;
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
