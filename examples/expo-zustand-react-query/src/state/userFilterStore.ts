import { create } from 'zustand';

type UserFilterState = {
  search: string;
  setSearch: (value: string) => void;
};

export const useUserFilterStore = create<UserFilterState>((set) => ({
  search: '',
  setSearch: (value) => set({ search: value }),
}));
