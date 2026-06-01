export const PASTEL_COLORS = [
  '#FEF3C7', '#D1FAE5', '#DBEAFE', '#FCE7F3',
  '#E0E7FF', '#FED7AA', '#F3E8FF', '#CCFBF1',
];

export const getColor = (index: number) => PASTEL_COLORS[index % PASTEL_COLORS.length];

export const STEPS = ['Thông tin', 'Giai đoạn', 'Xác nhận'];

export interface TaskStatusItem {
  id: string;
  code: string;
  name: string;
  sortOrder: number | null;
  isActive: boolean;
}

export interface SelectedStage {
  key: string;
  statusId: string | null;
  name: string;
  isNew: boolean;
}
