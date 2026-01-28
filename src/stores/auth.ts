import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User } from "@/types";
import { authApi } from "@/api/auth";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(localStorage.getItem("accessToken"));
  const refreshToken = ref<string | null>(localStorage.getItem("refreshToken"));
  const loading = ref(false);

  const isAuthenticated = computed(() => !!accessToken.value);

  async function register(email: string, password: string) {
    loading.value = true;
    try {
      const response = await authApi.register(email, password);
      accessToken.value = response.accessToken;
      refreshToken.value = response.refreshToken;
      user.value = response.user;
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      return response;
    } finally {
      loading.value = false;
    }
  }

  async function login(email: string, password: string) {
    loading.value = true;
    try {
      const response = await authApi.login(email, password);
      accessToken.value = response.accessToken;
      refreshToken.value = response.refreshToken;
      user.value = response.user;
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      return response;
    } finally {
      loading.value = false;
    }
  }

  async function fetchUser() {
    if (!accessToken.value) return null;
    try {
      const userData = await authApi.getMe();
      user.value = userData;
      return userData;
    } catch {
      logout();
      return null;
    }
  }

  async function logout() {
    if (refreshToken.value) {
      try {
        await authApi.logout(refreshToken.value);
      } catch {
        // Ignore logout errors
      }
    }

    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  return {
    user,
    accessToken,
    refreshToken,
    loading,
    isAuthenticated,
    register,
    login,
    fetchUser,
    logout,
  };
});
