import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user";

interface UserStore {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    hasHydrated: boolean;

    setUser: (user: User) => void;
    setToken: (token: string) => void;
    setAuth: (user: User, token: string) => void;

    logout: () => void;
}

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            hasHydrated: false,

            setUser: (user) => set(() => ({
                user: user,
                isAuthenticated: true,
            })),

            setToken: (token) => set(() => ({
                token: token,
            })),

            setAuth: (user, token) => set(() => ({
                user: user,
                token: token,
                isAuthenticated: true,
            })),

            logout: () => {
                set(() => ({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                }));
            },
        }),
        {
            name: "user-storage", // persist in localStorage
            onRehydrateStorage: () => (state) => {
                if (state?.token && state?.user) {
                    state.isAuthenticated = true;
                }
                state!.hasHydrated = true;
            }
        }
    )
);
