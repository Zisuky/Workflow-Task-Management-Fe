import type { LoginCredentials, User, RegisterRequest, ResetPasswordRequest } from "../../../shared/types";
import apiClient from "../../../shared/http/apiClient";
import { useEffect, useRef, useState } from "react";
import { clearFeaturesCache } from "../../../shared/hooks/useFeatures";

let currentUserSession: User | null = null;

interface LoginResponse {
  token: string;
}

interface ApiError {
  message?: string;
  code?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

const userByIdCache = new Map<string, User>();
let allUsersCache: User[] | null = null;
let loadingAllPromise: Promise<User[]> | null = null;

// Module-level cache for useCurrentUser hook — declared here so userApi.logout() can reset them
let currentUserCache: User | null = null;
let isLoadingCache = false;
let loadingPromise: Promise<User | null> | null = null;
let hasInitialized = false;

function mapRawToUser(raw: any, fallbackId = ''): User {
  return {
    id: raw.id || fallbackId,
    account: raw.account || '',
    email: raw.email || '',
    name: raw.fullName || raw.name || raw.account || 'Unknown',
    phone: raw.phone || null,
    address: raw.address || null,
    avatarUrl: raw.avatarUrl || null,
    roles: raw.roles || [],
  };
}

export const userApi = {
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = (await apiClient.post("/auth/login", {
        accountOrEmail: credentials.email || credentials.account,
        password: credentials.password,
      })) as LoginResponse;

      if (response.token) {
        localStorage.setItem("token", response.token);

        const profile = await this.fetchCurrentUserProfile();
        if (profile) {
            currentUserSession = profile;
        } else {
            currentUserSession = {
              id: "user-id-placeholder",
              email: credentials.email,
              account: credentials.account || credentials.email,
              name: credentials.email.split("@")[0],
              roles: ["User"],
            };
        }
        localStorage.setItem("user", JSON.stringify(currentUserSession));
        return currentUserSession;
      }

      throw new Error("Login failed: no token received");
    } catch (error) {
      const err = error as ApiError;

      if (err.message?.includes("Network error")) {
        throw new Error(
          "Unable to connect to server. Please check your internet connection.",
        );
      }

      if (err.code === "ERR_NETWORK") {
        throw new Error(
          "Network connection failed. The server may be unavailable or there may be a CORS issue.",
        );
      }

      if (err.response?.data) {
        throw new Error(err.response.data.message || "Login failed");
      }

      throw new Error(err.message || "Login failed");
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    currentUserSession = null;
    currentUserCache = null;
    hasInitialized = false;
    loadingPromise = null;
    this.clearCache();
    clearFeaturesCache();
  },

  getCurrentUser(): User | null {
    if (!currentUserSession) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        currentUserSession = JSON.parse(userStr) as User;
      }
    }
    return currentUserSession;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  },

  async fetchCurrentUserProfile(): Promise<User | null> {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) return null;
    try {
      const data: any = await apiClient.get('/auth/me');
      const raw = data?.data || data?.result || data;
      if (!raw) return null;
      const user = mapRawToUser(raw);
      if (user.id) {
        userByIdCache.set(user.id, user);
      }
      return user;
    } catch {
      return null;
    }
  },

  async getById(userId: string): Promise<User | null> {
    if (userByIdCache.has(userId)) return userByIdCache.get(userId)!;
    try {
      const data: any = await apiClient.get(`/users/profile/${userId}`);
      const raw = data?.data || data?.result || data;
      if (!raw) return null;
      const user = mapRawToUser(raw, userId);
      userByIdCache.set(user.id, user);
      return user;
    } catch {
      return null;
    }
  },

  async getAll(): Promise<User[]> {
    if (allUsersCache) return allUsersCache;
    if (loadingAllPromise) return loadingAllPromise;
    loadingAllPromise = (async () => {
      try {
        // GET /users/all — unpaged endpoint, use for dropdowns/search only
        const data: any = await apiClient.get('/users/all');
        const rawList = data?.data || data?.result || data || [];
        if (!Array.isArray(rawList)) return [];
        const users = rawList.map((raw: any) => {
          const u = mapRawToUser(raw);
          userByIdCache.set(u.id, u);
          return u;
        });
        allUsersCache = users;
        return users;
      } catch {
        allUsersCache = [];
        return [];
      } finally {
        loadingAllPromise = null;
      }
    })();
    return loadingAllPromise;
  },

  async search(query: string): Promise<User[]> {
    const all = await this.getAll();
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(u => u.name.toLowerCase().includes(q) || u.account.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  },

  async register(data: RegisterRequest): Promise<void> {
    await apiClient.post("/auth/register", data);
  },

  async forgotPassword(accountOrEmail: string): Promise<void> {
    await apiClient.post("/auth/forgot-password", { accountOrEmail });
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await apiClient.post("/auth/reset-password", data);
  },

  async updateProfile(data: { fullName: string; phone?: string | null; address?: string | null; avatarUrl?: string | null }): Promise<void> {
    await apiClient.put("/users/profile", data);
  },

  async changePassword(data: { oldPassword: string; newPassword: string }): Promise<void> {
    await apiClient.put("/users/profile/change-password", data);
  },

  clearCache() {
    userByIdCache.clear();
    allUsersCache = null;
    loadingAllPromise = null;
  },
};

export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState<User | null>(currentUserCache);
  const [isLoadingUser, setIsLoadingUser] = useState(isLoadingCache);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (hasInitialized && currentUserCache !== null) {
      setIsLoadingUser(false);
      return;
    }
    if (loadingPromise) {
      loadingPromise
        .then((user) => {
          if (mountedRef.current) {
            setCurrentUser(user);
            setIsLoadingUser(false);
          }
        })
        .catch(() => {
          if (mountedRef.current) setIsLoadingUser(false);
        });
      return;
    }
    if (hasInitialized) return;
    hasInitialized = true;

    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      if (!token) {
        if (mountedRef.current) {
          setIsLoadingUser(false);
          setCurrentUser(null);
        }
        return;
      }

      isLoadingCache = true;
      if (mountedRef.current) setIsLoadingUser(true);
      setError(null);

      loadingPromise = userApi
        .fetchCurrentUserProfile()
        .then((user) => {
          currentUserCache = user;
          if (user) {
              currentUserSession = user;
              localStorage.setItem("user", JSON.stringify(user));
          }
          if (mountedRef.current) setCurrentUser(user);
          return user;
        })
        .catch(() => {
          if (mountedRef.current) {
            setError(null);
            setCurrentUser(null);
          }
          return null;
        })
        .finally(() => {
          isLoadingCache = false;
          if (mountedRef.current) setIsLoadingUser(false);
          loadingPromise = null;
        });
    };

    fetchCurrentUser();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    currentUser,
    isLoadingUser,
    error,
    refetch: async () => {
      try {
        setIsLoadingUser(true);
        setError(null);
        const user = await userApi.fetchCurrentUserProfile();
        if (user) {
          currentUserCache = user;
          currentUserSession = user;
          localStorage.setItem("user", JSON.stringify(user));
        }
        setCurrentUser(user);
        return user;
      } catch (err) {
        const currentError = err instanceof Error ? err : new Error("Failed to fetch current user");
        setError(currentError);
        throw currentError;
      } finally {
        setIsLoadingUser(false);
      }
    },
  };
}

export function getUserInitials(name: string | null | undefined): string {
  if (!name) return "U";
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return "U";
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  const first = words[0].charAt(0).toUpperCase();
  const last = words[words.length - 1].charAt(0).toUpperCase();
  return first + last;
}
