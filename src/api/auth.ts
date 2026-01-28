import api from "./index";
import type { AuthResponse, User } from "@/types";

export const authApi = {
  async register(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post("/auth/register", { email, password });
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post("/auth/refresh", { refreshToken });
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post("/auth/logout", { refreshToken });
  },

  async getMe(): Promise<User> {
    const response = await api.get("/auth/me");
    return response.data;
  },
};
