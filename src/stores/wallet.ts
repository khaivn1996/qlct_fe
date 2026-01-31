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
      const res = await walletApi.getAll();
      wallets.value = res;

      if (wallets.value.length > 0) {
        if (!currentWallet.value) {
          currentWallet.value = wallets.value[0];
        } else {
          // Update current wallet reference to reflect changes (balance, etc)
          const found = wallets.value.find(
            (w) => w.id === currentWallet.value?.id,
          );
          if (found) {
            currentWallet.value = found;
          }
        }
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
