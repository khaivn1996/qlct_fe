import api from "./index";
import type {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
} from "@/types";

export const transactionApi = {
  async getAll(
    from: string,
    to: string,
    walletId?: string,
  ): Promise<Transaction[]> {
    const params: Record<string, string> = { from, to };
    if (walletId) {
      params.walletId = walletId;
    }
    const response = await api.get("/transactions", { params });
    return response.data;
  },

  async create(data: CreateTransactionDto): Promise<Transaction> {
    const response = await api.post("/transactions", data);
    return response.data;
  },

  async update(id: string, data: UpdateTransactionDto): Promise<Transaction> {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },
};
