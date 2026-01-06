import type { Project, CreateProjectInput } from '../models';
import { mockProjects } from '../data';
let projects = [...mockProjects];
let nextId = projects.length + 1;
export const projectService = {
    async getProjects(): Promise<Project[]> {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return [...projects];
    },
    async getProjectById(id: string): Promise<Project | undefined> {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return projects.find(p => p.id === id);
    },
    async addProject(input: CreateProjectInput): Promise<Project> {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const newProject: Project = {
            id: String(nextId++),
            code: input.code,
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
        await new Promise((resolve) => setTimeout(resolve, 200));
        const index = projects.findIndex(p => p.id === id);
        if (index === -1) return null;
        projects[index] = { ...projects[index], ...updates };
        return projects[index];
    },
    async deleteProject(id: string): Promise<boolean> {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const index = projects.findIndex(p => p.id === id);
        if (index === -1) return false;
        projects.splice(index, 1);
        return true;
    },
    async togglePin(id: string): Promise<Project | null> {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const project = projects.find(p => p.id === id);
        if (project) {
            project.isPinned = !project.isPinned;
            return project;
        }
        return null;
    },
    async searchProjects(query: string): Promise<Project[]> {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const lowerQuery = query.toLowerCase();
        return projects.filter(p =>
            p.code.toLowerCase().includes(lowerQuery) ||
            p.name.toLowerCase().includes(lowerQuery) ||
            p.manager.toLowerCase().includes(lowerQuery)
        );
    },
};
