import { create } from 'zustand';
import type { Task } from '../../../shared/types/task';

export interface TaskState {
  tasks: Task[];
  allTasks: Task[];
  searchTerm: string;
  currentPage: number;
  itemsPerPage: number;
  isLoading: boolean;
  setTasks: (tasks: Task[]) => void;
  setAllTasks: (tasks: Task[]) => void;
  setSearchTerm: (searchTerm: string) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  allTasks: [],
  searchTerm: '',
  currentPage: 1,
  itemsPerPage: 10,
  isLoading: true,
  setTasks: (tasks) => set({ tasks }),
  setAllTasks: (allTasks) => set({ allTasks }),
  setSearchTerm: (searchTerm) => set({ searchTerm, currentPage: 1 }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setItemsPerPage: (itemsPerPage) => set({ itemsPerPage, currentPage: 1 }),
  setLoading: (isLoading) => set({ isLoading }),
}));
