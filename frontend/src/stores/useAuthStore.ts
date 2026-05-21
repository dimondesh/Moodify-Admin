/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { axiosInstance } from "../lib/axios";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  imageUrl?: string | null;
  isAdmin?: boolean;
  language?: string;
  isAnonymous?: boolean;
}

interface UpdateProfileData {
  fullName?: string;
  imageUrl?: File | null;
}

function mapBackendUser(u: any): AuthUser {
  return {
    id: u._id,
    email: u.email,
    fullName: u.fullName || u.email,
    imageUrl: u.imageUrl || null,
    language: u.language,
    isAnonymous: u.isAnonymous,
    isAdmin: u.isAdmin,
  };
}

export class NotAdminError extends Error {
  constructor() {
    super("NOT_ADMIN");
    this.name = "NotAdminError";
  }
}

interface AuthStore {
  accessToken: string | null;
  user: AuthUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: AuthUser | null) => void;
  applyAuthResponse: (data: { token: string; user: any }) => void;
  bootstrapAuth: () => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  completeGoogleAccessToken: (accessToken: string) => Promise<void>;
  logout: () => void;
  reset: () => void;
  updateUserProfile: (data: UpdateProfileData) => Promise<void>;
  updateUserLanguage: (language: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isAdmin: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAdmin: user?.isAdmin ?? false }),

      applyAuthResponse: (data) => {
        const mapped = mapBackendUser(data.user);
        if (!mapped.isAdmin) {
          set({
            accessToken: null,
            user: null,
            isAdmin: false,
            isLoading: false,
            error: null,
          });
          throw new NotAdminError();
        }
        set({
          accessToken: data.token,
          user: mapped,
          isAdmin: true,
          isLoading: false,
          error: null,
        });
      },

      bootstrapAuth: async () => {
        const token = get().accessToken;
        if (!token) {
          set({ isLoading: false });
          return;
        }
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          get().applyAuthResponse(response.data);
        } catch (error: any) {
          if (error instanceof NotAdminError) {
            throw error;
          }
          const status = error?.response?.status;
          if (status === 401 || status === 404) {
            set({
              user: null,
              accessToken: null,
              isAdmin: false,
              isLoading: false,
              error: null,
            });
          } else {
            set({ isLoading: false });
          }
        }
      },

      loginWithPassword: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post("/auth/login", {
            email: email.trim().toLowerCase(),
            password,
          });
          get().applyAuthResponse(response.data);
        } catch (error: any) {
          if (!(error instanceof NotAdminError)) {
            set({
              isLoading: false,
              error: error.response?.data?.error || "Login failed",
            });
          } else {
            set({ isLoading: false, error: null });
          }
          throw error;
        }
      },

      completeGoogleAccessToken: async (accessToken) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post("/auth/google", {
            accessToken,
          });
          get().applyAuthResponse(response.data);
        } catch (error: any) {
          if (!(error instanceof NotAdminError)) {
            set({
              isLoading: false,
              error: error.response?.data?.error || "Google sign-in failed",
            });
          } else {
            set({ isLoading: false, error: null });
          }
          throw error;
        }
      },

      logout: () => {
        get().reset();
      },

      reset: () => {
        set({
          user: null,
          accessToken: null,
          isAdmin: false,
          isLoading: false,
          error: null,
        });
      },

      updateUserLanguage: async (language: string) => {
        set({ isLoading: true, error: null });
        try {
          await axiosInstance.put("/users/language", { language });
          set((state) => ({
            user: state.user ? { ...state.user, language } : state.user,
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to update language",
            isLoading: false,
          });
          throw error;
        }
      },

      updateUserProfile: async (data: UpdateProfileData) => {
        set({ isLoading: true, error: null });
        try {
          const formData = new FormData();
          if (data.fullName) {
            formData.append("fullName", data.fullName);
          }
          if (data.imageUrl) {
            formData.append("imageUrl", data.imageUrl);
          }

          const response = await axiosInstance.put("/users/me", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          const updatedUser = response.data.user;

          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  ...mapBackendUser({
                    ...updatedUser,
                    email: state.user.email,
                    isAdmin: state.user.isAdmin,
                  }),
                }
              : state.user,
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to update profile",
            isLoading: false,
          });
          throw error;
        }
      },
    }),
    {
      name: "moodify-admin-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAdmin: state.isAdmin,
      }),
    },
  ),
);
