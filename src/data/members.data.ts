export interface Member {
    id: string;
    name: string;
    role: string;
    avatar?: string;
}
export const mockMembers: Member[] = [
    { id: '1', name: 'Nguyễn Bảo Thành', role: 'BA' },
    { id: '2', name: 'Trần Thị B', role: 'Developer' },
    { id: '3', name: 'Lê Văn C', role: 'Designer' },
    { id: '4', name: 'Phạm Văn D', role: 'QA' },
    { id: '5', name: 'Hoàng Thị E', role: 'Developer' },
    { id: '6', name: 'Nguyễn Văn F', role: 'PM' },
    { id: '7', name: 'Trần Văn G', role: 'Developer' },
    { id: '8', name: 'Lê Thị H', role: 'Designer' },
    { id: '9', name: 'Phạm Thị I', role: 'BA' },
    { id: '10', name: 'Hoàng Văn K', role: 'QA' },
];
