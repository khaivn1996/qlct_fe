import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
} from "@/types";
import { transactionApi } from "@/api/transaction";

export const useTransactionStore = defineStore("transaction", () => {
  const transactions = ref<Transaction[]>([]);
  const loading = ref(false);

  async function fetchTransactions(
    from: string,
    to: string,
    walletId?: string,
  ) {
    loading.value = true;
    try {
      transactions.value = await transactionApi.getAll(from, to, walletId);
      return transactions.value;
    } finally {
      loading.value = false;
    }
  }

  async function createTransaction(data: CreateTransactionDto) {
    const transaction = await transactionApi.create(data);
    transactions.value.unshift(transaction);
    // Re-sort by date
    transactions.value.sort(
      (a, b) => new Date(b.txnDate).getTime() - new Date(a.txnDate).getTime(),
    );
    return transaction;
  }

  async function updateTransaction(id: string, data: UpdateTransactionDto) {
    const transaction = await transactionApi.update(id, data);
    const index = transactions.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      transactions.value[index] = transaction;
    }
    // Re-sort by date
    transactions.value.sort(
      (a, b) => new Date(b.txnDate).getTime() - new Date(a.txnDate).getTime(),
    );
    return transaction;
  }

  async function deleteTransaction(id: string) {
    await transactionApi.delete(id);
    transactions.value = transactions.value.filter((t) => t.id !== id);
  }

  function reset() {
    transactions.value = [];
  }

  return {
    transactions,
    loading,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    reset,
  };
});
