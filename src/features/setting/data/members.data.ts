// Mock data for members and roles

export interface Member {
    id: string;
    name: string;
    role: 'Admin' | 'Member' | 'Viewer';
    status: 'Đã đăng ký' | 'Chưa đăng ký';
    createdAt: string;
}

export interface Role {
    id: string;
    name: string;
    description: string;
    memberCount: number;
    permissions: string[];
}

export const mockMembers: Member[] = [
    { id: '1', name: 'Nguyễn Văn A', role: 'Admin', status: 'Đã đăng ký', createdAt: '01/01/2026' },
    { id: '2', name: 'Trần Văn B', role: 'Member', status: 'Đã đăng ký', createdAt: '02/01/2026' },
    { id: '3', name: 'Lê Văn C', role: 'Viewer', status: 'Chưa đăng ký', createdAt: '03/01/2026' },
    { id: '4', name: 'Phạm Thị D', role: 'Member', status: 'Đã đăng ký', createdAt: '04/01/2026' },
    { id: '5', name: 'Hoàng Văn E', role: 'Member', status: 'Đã đăng ký', createdAt: '05/01/2026' },
    { id: '6', name: 'Đỗ Thị F', role: 'Viewer', status: 'Đã đăng ký', createdAt: '06/01/2026' },
];

export const mockRoles: Role[] = [
    { id: '1', name: 'Admin', description: 'Toàn quyền', memberCount: 1, permissions: ['Quản lý thành viên', 'Quản lý workflow', 'Toàn quyền hệ thống'] },
    { id: '2', name: 'Quản lý thành viên', description: 'Quản lý user', memberCount: 0, permissions: ['Quản lý thành viên'] },
    { id: '3', name: 'Viewer', description: 'Xem', memberCount: 17, permissions: ['Xem dữ liệu'] },
];
