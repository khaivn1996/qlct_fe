import api from "./index";
import type { User } from "@/types";

export const userApi = {
  async updateProfile(data: { avatar?: string }): Promise<User> {
    const response = await api.patch("/users/me", data);
    return response.data;
  },
};
