import { create } from 'zustand';

interface WorkflowState {
  viewMode: '15min' | 'day' | 'week';
  setViewMode: (mode: WorkflowState['viewMode']) => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  viewMode: 'day',
  setViewMode: (viewMode) => set({ viewMode }),
}));
