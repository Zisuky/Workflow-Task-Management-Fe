// Note: Dashboard models are defined in dashboard.service.ts

export interface Project {
    id: string;
    code: string;
    name: string;
    manager: string;
    assignee: string;
    isPinned: boolean;
    group?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
}
export interface CreateProjectInput {
    name: string;
    code?: string; // Optional as backend generates it
    group: string;
    description: string;
    manager: string;
    members: string;
    leaderId: string;
    memberIds: string[];
    startDate: string;
    endDate: string;
}
export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role: string;
}
export interface StatCard {
    id: string;
    title: string;
    value: string | number;
    icon: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color: 'blue' | 'green' | 'purple' | 'orange';
}
export interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}
export type JobStatus = 'To Do' | 'In Progress' | 'In Review' | 'Blocked' | 'Done' | 'On Hold';
export type JobPriority = 'Low' | 'Medium' | 'High' | 'Highest';
export type JobType = 'Bug' | 'Feature' | 'Task' | 'Improvement';
export type JobGroup = 'UI/UX' | 'Backend' | 'Frontend' | 'Testing' | 'Database' | 'Documentation' | 'Design';
export interface Job {
    id: string;
    code: string;
    name: string;
    type: JobType;
    group: JobGroup;
    status: JobStatus;
    manager: string;
    assignee: string;
    priority: JobPriority;
    startDate: string;
    estimatedHours: number;
    endDate: string;
    description?: string;
    project?: string;
    projectId?: string;
    typeId?: string;
    taskGroupId?: string;
}
export interface CreateJobInput {
    name: string;
    code?: string;
    type: JobType;
    group: JobGroup;
    manager: string;
    assignee: string;
    priority: JobPriority;
    startDate: string;
    endDate: string;
    estimatedHours: number;
    description?: string;
    project?: string;
    projectId?: string; // ID của Dự án
    assignerId?: string; // ID Người giao việc
    assigneeId?: string; // ID Người được giao việc
    typeId?: string; // ID Loại công việc (Real UUID)
    taskGroupId?: string; // ID Nhóm công việc (Real UUID)
}
