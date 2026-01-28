import { defineStore } from "pinia";
import { ref } from "vue";
import type { Wallet } from "@/types";
import { walletApi } from "@/api/wallet";

export const useWalletStore = defineStore("wallet", () => {
  const wallets = ref<Wallet[]>([]);
  const currentWallet = ref<Wallet | null>(null);
  const loading = ref(false);

  async function fetchWallets() {
    loading.value = true;
    try {
      wallets.value = await walletApi.getAll();
      if (wallets.value.length > 0 && !currentWallet.value) {
        currentWallet.value = wallets.value[0];
      }
      return wallets.value;
    } finally {
      loading.value = false;
    }
  }

  function setCurrentWallet(wallet: Wallet) {
    currentWallet.value = wallet;
  }

  function reset() {
    wallets.value = [];
    currentWallet.value = null;
  }

  return {
    wallets,
    currentWallet,
    loading,
    fetchWallets,
    setCurrentWallet,
    reset,
  };
});
