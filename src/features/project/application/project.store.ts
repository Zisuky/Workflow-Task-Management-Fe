import { create } from 'zustand';
import type { Project } from '../domain/project.entity';

interface ProjectState {
  searchTerm: string;
  selectedProject: Project | null;
  isDetailModalOpen: boolean;
  setSearchTerm: (value: string) => void;
  selectProject: (project: Project | null) => void;
  setDetailModalOpen: (open: boolean) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  searchTerm: '',
  selectedProject: null,
  isDetailModalOpen: false,
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  selectProject: (selectedProject) => set({ selectedProject }),
  setDetailModalOpen: (isDetailModalOpen) => set({ isDetailModalOpen }),
}));
