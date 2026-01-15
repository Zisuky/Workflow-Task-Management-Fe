// FlowWork Workflow Engine - Data Models & Mock Data

// ==================== CORE INTERFACES ====================

/**
 * Flow - A workflow configuration for a project or department
 */
export interface Flow {
    id: string;
    name: string;
    description?: string;
    projectId?: string;
    departmentId?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * FlowStep - A step/column in a workflow
 */
export interface FlowStep {
    id: string;
    flowId?: string;
    name: string;
    order: number;
    color: string;
    type?: 'WORK' | 'BLOCKED' | 'APPROVAL' | 'DONE'; // Step type
    wipMin?: number;  // Work In Progress minimum
    wipMax?: number;  // Work In Progress maximum
    allowedRoles: string[];
    requiredFields: string[];
}

/**
 * BlockedInfo - Information about why a task is blocked
 */
export interface BlockedInfo {
    blockedBy: string;       // role / department / system
    blockedReason: string;   // Why it's blocked
    blockedSince: string;    // ISO date string
    waitingFor?: string;     // e.g. "Phòng IT", "Khách hàng"
}

/**
 * Task - A task/item that moves through the workflow
 */
export interface Task {
    id: string;
    title: string;
    description?: string;
    assignee: {
        id: string;
        name: string;
        avatar?: string;
    };
    department: string;
    project: {
        id: string;
        code: string;
        name: string;
    };
    flowId: string;
    flowStepId: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'normal' | 'warning' | 'overdue';
    isBlocked?: boolean;         // Is task blocked/paused?
    blockedInfo?: BlockedInfo;   // Blocked details
    fields: Record<string, unknown>;
    tags: Array<{
        label: string;
        color: string;
    }>;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * TaskFlowHistory - History of task movement between steps
 */
export interface TaskFlowHistory {
    id: string;
    taskId: string;
    fromStepId: string | null;
    toStepId: string;
    movedBy: {
        id: string;
        name: string;
    };
    movedAt: string;
    comment?: string;
}

// ==================== MOCK DATA ====================

// Departments
export const mockDepartments = [
    { id: 'dept-hr', name: 'HR' },
    { id: 'dept-finance', name: 'Finance' },
    { id: 'dept-procurement', name: 'Procurement' },
    { id: 'dept-it', name: 'IT' },
    { id: 'dept-clients', name: 'Clients' },
    { id: 'dept-projects', name: 'Projects' },
];

// Roles
export const mockRoles = [
    'admin',
    'manager',
    'developer',
    'designer',
    'ba',
    'qa',
    'hr',
    'finance',
];

// Default Flow
export const defaultFlow: Flow = {
    id: 'flow-default',
    name: 'Default Workflow',
    description: 'Quy trình mặc định cho dự án',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-12T00:00:00Z',
};

// Default Flow Steps - Matching reference design
export const defaultFlowSteps: FlowStep[] = [
    {
        id: 'step-todo',
        flowId: 'flow-default',
        name: 'TO DO',
        order: 0,
        color: '#FEF3C7', // Yellow
        type: 'WORK',
        wipMin: 0,
        wipMax: 10,
        allowedRoles: ['admin', 'manager', 'ba', 'developer'],
        requiredFields: ['title'],
    },
    {
        id: 'step-in-progress',
        flowId: 'flow-default',
        name: 'IN PROGRESS',
        order: 1,
        color: '#D1FAE5', // Green
        type: 'WORK',
        wipMin: 0,
        wipMax: 5,
        allowedRoles: ['admin', 'manager', 'developer', 'designer'],
        requiredFields: ['title', 'assignee'],
    },
    {
        id: 'step-paused',
        flowId: 'flow-default',
        name: 'Paused',
        order: 2,
        color: '#FED7AA', // Orange/Salmon
        type: 'BLOCKED',
        wipMin: 0,
        wipMax: 8,
        allowedRoles: ['admin', 'manager'],
        requiredFields: [],
    },
    {
        id: 'step-done',
        flowId: 'flow-default',
        name: 'Done',
        order: 3,
        color: '#D1FAE5',
        type: 'DONE',
        wipMin: 0,
        wipMax: undefined, // Unlimited
        allowedRoles: ['admin', 'manager'],
        requiredFields: [],
    },
];

// Mock Tasks - Matching reference design
export const mockTasks: Task[] = [
    // TO DO Column (7 tasks to show 7/10)
    {
        id: 'task-1',
        title: 'Lập chiến lược marketing cho đợt ra mắt sản phẩm mới',
        description: 'Xây dựng kế hoạch marketing toàn diện cho sản phẩm Q1 2026',
        assignee: { id: 'user-1', name: 'Minh Nguyễn' },
        department: 'Marketing',
        project: { id: 'proj-1', code: 'HRPCC-24', name: 'HR Platform' },
        flowId: 'flow-default',
        flowStepId: 'step-todo',
        priority: 'high',
        status: 'normal',
        fields: {},
        tags: [],
        createdAt: '2026-01-05T08:00:00Z',
        updatedAt: '2026-01-10T10:00:00Z',
    },
    {
        id: 'task-2',
        title: 'Kiểm thử tính năng phân quyền',
        description: 'Testing RBAC module',
        assignee: { id: 'user-2', name: 'Linh Phạm' },
        department: 'QA',
        project: { id: 'proj-1', code: 'HRPCC-29', name: 'HR Platform' },
        flowId: 'flow-default',
        flowStepId: 'step-todo',
        priority: 'high',
        status: 'overdue',
        fields: {},
        tags: [],
        dueDate: '2026-01-12',
        createdAt: '2026-01-04T08:00:00Z',
        updatedAt: '2026-01-11T18:00:00Z',
    },
    {
        id: 'task-3',
        title: 'Đề nghị mua sắm laptop mới cho văn phòng',
        description: 'Cần 10 laptop cho nhân viên mới',
        assignee: { id: 'user-3', name: 'Khoa Nguyễn' },
        department: 'Purchasing',
        project: { id: 'proj-2', code: 'FIN-25', name: 'Finance System' },
        flowId: 'flow-default',
        flowStepId: 'step-todo',
        priority: 'medium',
        status: 'normal',
        fields: {},
        tags: [],
        createdAt: '2026-01-08T09:00:00Z',
        updatedAt: '2026-01-10T14:00:00Z',
    },
    {
        id: 'task-4',
        title: 'Phát triển API kết nối kho hàng',
        description: 'API tích hợp với hệ thống kho hàng',
        assignee: { id: 'user-4', name: 'Hà Thu' },
        department: 'Dev',
        project: { id: 'proj-3', code: 'PMCC-33', name: 'PMCC Integration' },
        flowId: 'flow-default',
        flowStepId: 'step-todo',
        priority: 'high',
        status: 'normal',
        fields: {},
        tags: [],
        createdAt: '2026-01-06T10:00:00Z',
        updatedAt: '2026-01-11T16:00:00Z',
    },
    {
        id: 'task-5',
        title: 'Đánh giá báo cáo tài chính tháng trước',
        description: 'Review Q4 2025 financial reports',
        assignee: { id: 'user-5', name: 'An Nguyễn' },
        department: 'Finance',
        project: { id: 'proj-2', code: 'FIN-17', name: 'Finance System' },
        flowId: 'flow-default',
        flowStepId: 'step-todo',
        priority: 'medium',
        status: 'normal',
        fields: {},
        tags: [],
        createdAt: '2026-01-07T09:00:00Z',
        updatedAt: '2026-01-11T14:00:00Z',
    },
    {
        id: 'task-6',
        title: 'Thiết kế giao diện Dashboard mới',
        description: 'UI/UX cho dashboard analytics',
        assignee: { id: 'user-6', name: 'Trang Lê' },
        department: 'Design',
        project: { id: 'proj-1', code: 'HRPCC-30', name: 'HR Platform' },
        flowId: 'flow-default',
        flowStepId: 'step-todo',
        priority: 'medium',
        status: 'normal',
        fields: {},
        tags: [],
        createdAt: '2026-01-09T08:00:00Z',
        updatedAt: '2026-01-12T10:00:00Z',
    },
    {
        id: 'task-7',
        title: 'Tối ưu hiệu suất database',
        description: 'Optimize slow queries',
        assignee: { id: 'user-7', name: 'Hùng Trần' },
        department: 'Dev',
        project: { id: 'proj-3', code: 'PMCC-35', name: 'PMCC Core' },
        flowId: 'flow-default',
        flowStepId: 'step-todo',
        priority: 'high',
        status: 'normal',
        fields: {},
        tags: [],
        createdAt: '2026-01-10T08:00:00Z',
        updatedAt: '2026-01-12T16:00:00Z',
    },

    // IN PROGRESS Column (5 tasks to show 5/5 - at WIP limit)
    {
        id: 'task-8',
        title: 'Triển khai module thanh toán',
        description: 'Payment integration với VNPay',
        assignee: { id: 'user-8', name: 'Nam Trần' },
        department: 'Dev',
        project: { id: 'proj-2', code: 'FIN-28', name: 'Finance System' },
        flowId: 'flow-default',
        flowStepId: 'step-in-progress',
        priority: 'urgent',
        status: 'normal',
        fields: {},
        tags: [],
        createdAt: '2026-01-05T08:00:00Z',
        updatedAt: '2026-01-12T10:00:00Z',
    },
    {
        id: 'task-9',
        title: 'Code review module authentication',
        description: 'Review PR #234',
        assignee: { id: 'user-9', name: 'Bình Phạm' },
        department: 'Dev',
        project: { id: 'proj-1', code: 'HRPCC-31', name: 'HR Platform' },
        flowId: 'flow-default',
        flowStepId: 'step-in-progress',
        priority: 'high',
        status: 'normal',
        fields: {},
        tags: [],
        createdAt: '2026-01-08T08:00:00Z',
        updatedAt: '2026-01-12T11:00:00Z',
    },
    {
        id: 'task-10',
        title: 'Viết unit test cho API users',
        description: 'Test coverage 80%+',
        assignee: { id: 'user-10', name: 'Mai Hoàng' },
        department: 'QA',
        project: { id: 'proj-3', code: 'PMCC-36', name: 'PMCC Core' },
        flowId: 'flow-default',
        flowStepId: 'step-in-progress',
        priority: 'medium',
        status: 'normal',
        fields: {},
        tags: [],
        createdAt: '2026-01-09T08:00:00Z',
        updatedAt: '2026-01-12T09:00:00Z',
    },
    {
        id: 'task-11',
        title: 'Cập nhật tài liệu API',
        description: 'Swagger documentation',
        assignee: { id: 'user-4', name: 'Hà Thu' },
        department: 'Dev',
        project: { id: 'proj-3', code: 'PMCC-37', name: 'PMCC Integration' },
        flowId: 'flow-default',
        flowStepId: 'step-in-progress',
        priority: 'low',
        status: 'normal',
        fields: {},
        tags: [],
        createdAt: '2026-01-10T08:00:00Z',
        updatedAt: '2026-01-12T14:00:00Z',
    },
    {
        id: 'task-12',
        title: 'Fix bug login timeout',
        description: 'Session expires too quickly',
        assignee: { id: 'user-8', name: 'Nam Trần' },
        department: 'Dev',
        project: { id: 'proj-1', code: 'HRPCC-32', name: 'HR Platform' },
        flowId: 'flow-default',
        flowStepId: 'step-in-progress',
        priority: 'urgent',
        status: 'normal',
        fields: {},
        tags: [],
        createdAt: '2026-01-11T08:00:00Z',
        updatedAt: '2026-01-12T16:00:00Z',
    },

    // PAUSED Column (2 blocked tasks)
    {
        id: 'task-13',
        title: 'Triển khai xác thực hai lớp cho đăng nhập nhân viên',
        description: 'Implement 2FA cho toàn bộ hệ thống',
        assignee: { id: 'user-3', name: 'Nam Trần' },
        department: 'IT',
        project: { id: 'proj-3', code: 'PMCC-29', name: 'PMCC Core' },
        flowId: 'flow-default',
        flowStepId: 'step-paused',
        priority: 'urgent',
        status: 'normal',
        isBlocked: true,
        blockedInfo: {
            blockedBy: 'IT Department',
            blockedReason: 'API login chưa hoàn thành',
            blockedSince: '2026-01-10T03:30:00Z',
            waitingFor: 'Phòng IT',
        },
        fields: {},
        tags: [],
        createdAt: '2026-01-02T08:00:00Z',
        updatedAt: '2026-01-12T08:00:00Z',
    },
    {
        id: 'task-14',
        title: 'Kiểm thử tính năng phân quyền - Phase 2',
        description: 'Advanced RBAC testing',
        assignee: { id: 'user-5', name: 'Linh Phạm' },
        department: 'QA',
        project: { id: 'proj-1', code: 'HRPCC-29', name: 'HR Platform' },
        flowId: 'flow-default',
        flowStepId: 'step-paused',
        priority: 'high',
        status: 'normal',
        isBlocked: true,
        blockedInfo: {
            blockedBy: 'Khách hàng',
            blockedReason: 'Chờ duyệt thiết kế mới',
            blockedSince: '2026-01-11T10:00:00Z',
            waitingFor: 'Khách hàng',
        },
        fields: {},
        tags: [],
        createdAt: '2026-01-03T08:00:00Z',
        updatedAt: '2026-01-12T10:00:00Z',
    },
];

// Mock Task Flow History
export const mockTaskFlowHistory: TaskFlowHistory[] = [
    {
        id: 'history-1',
        taskId: 'task-3',
        fromStepId: 'step-1',
        toStepId: 'step-2',
        movedBy: { id: 'user-1', name: 'Admin' },
        movedAt: '2026-01-05T10:00:00Z',
    },
    {
        id: 'history-2',
        taskId: 'task-3',
        fromStepId: 'step-2',
        toStepId: 'step-3',
        movedBy: { id: 'user-3', name: 'Nam Trần' },
        movedAt: '2026-01-08T14:00:00Z',
    },
    {
        id: 'history-3',
        taskId: 'task-5',
        fromStepId: 'step-3',
        toStepId: 'step-4',
        movedBy: { id: 'user-5', name: 'Linh Phạm' },
        movedAt: '2026-01-10T09:00:00Z',
    },
];

// ==================== HELPER FUNCTIONS ====================

export const getTasksByStep = (tasks: Task[], stepId: string): Task[] => {
    return tasks.filter(task => task.flowStepId === stepId);
};

export const getStepTaskCount = (tasks: Task[], stepId: string): number => {
    return tasks.filter(task => task.flowStepId === stepId).length;
};

export const getUniqueAssignees = (tasks: Task[]): Task['assignee'][] => {
    const seen = new Set<string>();
    return tasks.reduce((acc, task) => {
        if (!seen.has(task.assignee.id)) {
            seen.add(task.assignee.id);
            acc.push(task.assignee);
        }
        return acc;
    }, [] as Task['assignee'][]);
};

export const isWipExceeded = (step: FlowStep, tasks: Task[]): boolean => {
    if (!step.wipMax) return false;
    const count = getStepTaskCount(tasks, step.id);
    return count > step.wipMax;
};

export const addTaskHistory = (
    history: TaskFlowHistory[],
    taskId: string,
    fromStepId: string | null,
    toStepId: string,
    movedBy: { id: string; name: string }
): TaskFlowHistory[] => {
    const newEntry: TaskFlowHistory = {
        id: `history-${Date.now()}`,
        taskId,
        fromStepId,
        toStepId,
        movedBy,
        movedAt: new Date().toISOString(),
    };
    return [...history, newEntry];
};

// ==================== STEP COLOR MAP ====================

export const stepColorMap: Record<string, { bg: string; border: string; text: string }> = {
    'step-1': { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
    'step-2': { bg: '#E0E7FF', border: '#6366F1', text: '#3730A3' },
    'step-3': { bg: '#D1FAE5', border: '#10B981', text: '#065F46' },
    'step-4': { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF' },
    'step-5': { bg: '#FCE7F3', border: '#EC4899', text: '#9D174D' },
    'step-6': { bg: '#D1FAE5', border: '#10B981', text: '#065F46' },
};

// ==================== LEGACY EXPORTS (for backward compatibility) ====================

export type FlowTask = Task;
export const mockFlowTasks = mockTasks;
