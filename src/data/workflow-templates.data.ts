// Workflow Templates Data - Quy trình mẫu

export interface WorkflowTemplate {
    id: string;
    code: string;
    name: string;
    description: string;
    steps: string[];
    stagesCount: number;
    tasksCount: number;
}

// Mock workflow templates
export const mockWorkflowTemplates: WorkflowTemplate[] = [
    {
        id: 'template-erf',
        code: 'ERF',
        name: 'Triển khai phần mềm ERF',
        description: 'Quy trình chuẩn: Khảo sát → Phân tích → Dev → Test → UAT → Done',
        steps: ['Khảo sát', 'Phân tích', 'Dev', 'Test', 'UAT', 'Done'],
        stagesCount: 8,
        tasksCount: 24,
    },
    {
        id: 'template-agile',
        code: 'AGI',
        name: 'Agile Development',
        description: 'Quy trình Agile: Backlog → Sprint → Review → Done',
        steps: ['Backlog', 'Sprint Planning', 'In Progress', 'Review', 'Done'],
        stagesCount: 5,
        tasksCount: 18,
    },
    {
        id: 'template-kanban',
        code: 'KAN',
        name: 'Kanban Standard',
        description: 'Quy trình Kanban: To Do → Doing → Done',
        steps: ['To Do', 'In Progress', 'Review', 'Done'],
        stagesCount: 4,
        tasksCount: 12,
    },
    {
        id: 'template-waterfall',
        code: 'WAT',
        name: 'Waterfall Development',
        description: 'Quy trình Waterfall: Requirements → Design → Implementation → Testing → Deployment',
        steps: ['Requirements', 'Design', 'Implementation', 'Testing', 'Deployment', 'Maintenance'],
        stagesCount: 6,
        tasksCount: 30,
    },
];

export const getWorkflowTemplateById = (id: string): WorkflowTemplate | undefined => {
    return mockWorkflowTemplates.find(template => template.id === id);
};
