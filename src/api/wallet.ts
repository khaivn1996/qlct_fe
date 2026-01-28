import api from "./index";
import type { Wallet } from "@/types";

export const walletApi = {
  async getAll(): Promise<Wallet[]> {
    const response = await api.get("/wallets");
    return response.data;
  },
};
