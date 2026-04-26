import { create } from 'zustand';
import type { User } from '../domain/user.entity';

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  setSession: (user: User | null) => void;
  clearSession: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  setSession: (user) => set({ currentUser: user, isAuthenticated: !!user }),
  clearSession: () => set({ currentUser: null, isAuthenticated: false }),
}));
