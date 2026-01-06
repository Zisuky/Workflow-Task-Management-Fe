export const mockHomeData = {
  kpis: {
    totalProjects: 9,
    totalMembers: 9,
    completedProjects: 9,
    inProgressProjects: 9
  },
  productivity: [
    { month: 'Dự án 1', total: 2, completed: 1 },
    { month: 'Dự án 2', total: 27, completed: 25 },
    { month: 'Dự án 3', total: 20, completed: 8 },
    { month: 'Dự án 4', total: 8, completed: 5 },
    { month: 'Dự án 5', total: 35, completed: 15 },
    { month: 'Dự án 6', total: 30, completed: 9 },
    { month: 'Dự án 7', total: 15, completed: 6 },
    { month: 'Dự án 8', total: 27, completed: 18 },
    { month: 'Dự án 9', total: 18, completed: 9 }
  ],
  taskPriority: [
    { priority: 'High', count: 3, color: '#EF4444' },
    { priority: 'Medium', count: 4, color: '#F97316' },
    { priority: 'Low', count: 2, color: '#22C55E' },
    { priority: 'None', count: 1, color: '#9CA3AF' }
  ],
  taskStatus: [
    { status: 'Backlog', count: 90, color: '#F97316', percentage: 47.2 },
    { status: 'To Do', count: 975, color: '#8B5CF6', percentage: 15.1 },
    { status: 'In Progress', count: 261, color: '#EC4899', percentage: 5.7 },
    { status: 'Review', count: 12, color: '#3B82F6', percentage: 9.4 },
    { status: 'Done', count: 387, color: '#22C55E', percentage: 22.6 }
  ],
  departmentTasks: [
    { department: 'Dev', count: 15 },
    { department: 'QA', count: 8 },
    { department: 'BE', count: 14 },
    { department: 'BA', count: 10 },
    { department: 'Design', count: 25 },
    { department: 'Quản lý', count: 5 },
    { department: 'Bảo vệ', count: 12 }
  ],
  alerts: [
    { id: '1', taskCode: 'TK-005', message: 'trễ hạn', projectCode: 'PRJ-003' },
    { id: '2', taskCode: 'TK-009', message: 'trễ hạn', projectCode: 'PRJ-005' },
    { id: '3', taskCode: 'TK-012', message: 'sắp đến hạn', projectCode: 'PRJ-001' },
    { id: '4', taskCode: 'TK-018', message: 'cần review', projectCode: 'PRJ-007' },
    { id: '5', taskCode: 'TK-025', message: 'chưa bắt đầu', projectCode: 'PRJ-002' },
    { id: '6', taskCode: 'TK-031', message: 'đang thực hiện', projectCode: 'PRJ-004' },
    { id: '7', taskCode: 'TK-044', message: 'thiếu tài nguyên', projectCode: 'PRJ-006' },
    { id: '8', taskCode: 'TK-052', message: 'hoàn thành', projectCode: 'PRJ-008' }
  ]
};