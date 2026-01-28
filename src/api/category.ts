import api from "./index";
import type { Category, CreateCategoryDto, TransactionType } from "@/types";

export const categoryApi = {
  async getAll(type?: TransactionType): Promise<Category[]> {
    const params = type ? { type } : {};
    const response = await api.get("/categories", { params });
    return response.data;
  },

  async create(data: CreateCategoryDto): Promise<Category> {
    const response = await api.post("/categories", data);
    return response.data;
  },

  async update(
    id: string,
    data: Partial<CreateCategoryDto>,
  ): Promise<Category> {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
