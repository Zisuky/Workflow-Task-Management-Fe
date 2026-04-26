import { create } from 'zustand';
import type { Job } from '../../../shared/types/task';

interface TaskState {
  jobs: Job[];
  allJobs: Job[];
  searchTerm: string;
  currentPage: number;
  itemsPerPage: number;
  isLoading: boolean;
  setJobs: (jobs: Job[]) => void;
  setAllJobs: (jobs: Job[]) => void;
  setSearchTerm: (searchTerm: string) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  jobs: [],
  allJobs: [],
  searchTerm: '',
  currentPage: 1,
  itemsPerPage: 10,
  isLoading: true,
  setJobs: (jobs) => set({ jobs }),
  setAllJobs: (allJobs) => set({ allJobs }),
  setSearchTerm: (searchTerm) => set({ searchTerm, currentPage: 1 }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setItemsPerPage: (itemsPerPage) => set({ itemsPerPage, currentPage: 1 }),
  setLoading: (isLoading) => set({ isLoading }),
}));
