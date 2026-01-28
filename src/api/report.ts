import api from "./index";
import type { MonthlyReport } from "@/types";

export const reportApi = {
  async getMonthly(month: string): Promise<MonthlyReport> {
    const response = await api.get("/reports/monthly", { params: { month } });
    return response.data;
  },
};
