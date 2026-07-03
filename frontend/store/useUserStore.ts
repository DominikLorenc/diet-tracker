import { User, UserGoals } from "@/app/_types/user";
import { apiClient } from "../app/lib/apiClient";
import { create } from "zustand";

interface UserState {
  user: User | null;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  setUser: (user: User) => void;
  setUserGoals: (userGoals: UserGoals) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: false,
  fetchUser: async () => {
    if (get().user !== null) return;
    set({ isLoading: true });
    try {
      const response = await apiClient.GET("/users/me");
      if (response.error) {
        console.error(response.error);
        return;
      }
      if (response.data?.user) {
        set({ user: response.data.user });
      }
    } catch (err) {
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },
  setUser: (user: User) => {
    set({ user });
  },
  setUserGoals: (userGoals: UserGoals) => {
    const current = get().user;
    if (!current) return;
    set({ user: { ...current, userGoals } });
  },
  clearUser: () => {
    set({ user: null });
  },
}));
