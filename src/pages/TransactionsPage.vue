<template>
  <div class="page-container">
    <!-- Month Tabs -->
    <div class="tabs-wrapper glass-panel">
      <div
        v-for="tab in tabs"
        :key="tab.name"
        class="tab-item"
        :class="{ active: activeTab === tab.name }"
        @click="handleTabChange(tab.name)"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards animate-fade-in-up" style="animation-delay: 0.1s">
      <div class="glass-card stat-card income">
        <div class="stat-icon-wrapper">
          <el-icon><ArrowUpRight /></el-icon>
        </div>
        <div class="stat-content">
          <h3 class="stat-label">Tiền vào</h3>
          <div class="stat-value income">
            +{{ formatCurrency(totalIncome) }}
          </div>
        </div>
      </div>
      <div class="glass-card stat-card expense">
        <div class="stat-icon-wrapper">
          <el-icon><ArrowDownLeft /></el-icon>
        </div>
        <div class="stat-content">
          <h3 class="stat-label">Tiền ra</h3>
          <div class="stat-value expense">
            -{{ formatCurrency(totalExpense) }}
          </div>
        </div>
      </div>
      <div class="glass-card stat-card balance">
        <div class="stat-icon-wrapper">
          <el-icon><Wallet /></el-icon>
        </div>
        <div class="stat-content">
          <h3 class="stat-label">Còn lại</h3>
          <div
            class="stat-value"
            :class="{ income: balance >= 0, expense: balance < 0 }"
          >
            {{ formatCurrency(balance) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Transaction List -->
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading" size="40"><Loader2 /></el-icon>
    </div>

    <div v-else-if="groupedTransactions.length === 0" class="empty-state">
      <el-icon><FileText /></el-icon>
      <p>Chưa có giao dịch nào</p>
    </div>

    <div
      v-else
      class="transaction-list animate-fade-in-up"
      style="animation-delay: 0.2s"
    >
      <div
        v-for="(group, index) in groupedTransactions"
        :key="group.date"
        class="transaction-group"
        :style="{ animationDelay: `${0.2 + index * 0.05}s` }"
      >
        <div class="group-date">
          <span class="date-text">{{ formatDateFull(group.date) }}</span>
          <div class="date-line"></div>
        </div>
        <div class="group-items">
          <div
            v-for="txn in group.transactions"
            :key="txn.id"
            class="glass-card transaction-item"
            @click="editTransaction(txn)"
          >
            <div class="item-icon-wrapper" :class="txn.type.toLowerCase()">
              <component
                :is="icons[txn.category.icon] || icons.HelpCircle"
                :size="20"
              />
            </div>
            <div class="item-content">
              <div class="item-name">{{ txn.category.name }}</div>
              <div class="item-note" v-if="txn.note">{{ txn.note }}</div>
            </div>
            <div class="item-amount" :class="txn.type.toLowerCase()">
              {{ txn.type === "INCOME" ? "+" : "-"
              }}{{ formatCurrency(txn.amount) }}
            </div>
            <el-button
              class="delete-btn"
              text
              circle
              @click.stop="deleteTransaction(txn)"
            >
              <el-icon><Trash2 /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Transaction Dialog -->
    <TransactionDialog
      v-model:visible="showEditDialog"
      :transaction="selectedTransaction"
      @saved="handleTransactionSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Loader2,
  FileText,
  Trash2,
} from "lucide-vue-next";
import * as LucideIcons from "lucide-vue-next";
import { useTransactionStore } from "@/stores/transaction";
import { useWalletStore } from "@/stores/wallet";
import {
  formatCurrency,
  formatDateFull,
  getMonthRange,
  getPreviousMonth,
  getNextMonth,
} from "@/utils/format";
import type { Transaction } from "@/types";
import TransactionDialog from "@/components/TransactionDialog.vue";

const transactionStore = useTransactionStore();
const walletStore = useWalletStore();
const icons: any = LucideIcons;

const activeTab = ref("current");
const loading = ref(false);
const showEditDialog = ref(false);
const selectedTransaction = ref<Transaction | undefined>();

const tabs = [
  { label: "Tháng trước", name: "previous" },
  { label: "Tháng này", name: "current" },
  { label: "Tương lai", name: "future" },
];

const today = new Date();

const dateRange = computed(() => {
  if (activeTab.value === "previous") {
    return getMonthRange(getPreviousMonth(today));
  } else if (activeTab.value === "future") {
    const future = getNextMonth(today);
    return {
      from: getMonthRange(today).to,
      to: getMonthRange(getNextMonth(getNextMonth(getNextMonth(future)))).to,
    };
  } else {
    return getMonthRange(today);
  }
});

const groupedTransactions = computed(() => {
  const groups: { date: string; transactions: Transaction[] }[] = [];
  const dateMap = new Map<string, Transaction[]>();

  for (const txn of transactionStore.transactions) {
    const date = txn.txnDate.split("T")[0];
    if (!dateMap.has(date)) {
      dateMap.set(date, []);
    }
    dateMap.get(date)!.push(txn);
  }

  // Sort dates descending
  const sortedDates = Array.from(dateMap.keys()).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  for (const date of sortedDates) {
    groups.push({
      date,
      transactions: dateMap.get(date)!,
    });
  }

  return groups;
});

const totalIncome = computed(() => {
  return transactionStore.transactions
    .filter((t: Transaction) => t.type === "INCOME")
    .reduce((sum: number, t: Transaction) => sum + parseInt(t.amount), 0);
});

const totalExpense = computed(() => {
  return transactionStore.transactions
    .filter((t: Transaction) => t.type === "EXPENSE")
    .reduce((sum: number, t: Transaction) => sum + parseInt(t.amount), 0);
});

const balance = computed(() => totalIncome.value - totalExpense.value);

async function fetchTransactions() {
  loading.value = true;
  try {
    const { from, to } = dateRange.value;
    await transactionStore.fetchTransactions(from, to);
  } finally {
    loading.value = false;
  }
}

function handleTabChange(tabName: string) {
  activeTab.value = tabName;
  fetchTransactions();
}

function editTransaction(txn: Transaction) {
  selectedTransaction.value = txn;
  showEditDialog.value = true;
}

async function deleteTransaction(txn: Transaction) {
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc muốn xóa giao dịch "${txn.category.name}"?`,
      "Xác nhận xóa",
      {
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
        type: "warning",
        title: "Xác nhận",
      },
    );

    await transactionStore.deleteTransaction(txn.id);
    walletStore.fetchWallets(); // Refresh balance
    ElMessage.success("Đã xóa giao dịch");
  } catch {
    // User cancelled
  }
}

function handleTransactionSaved() {
  showEditDialog.value = false;
  selectedTransaction.value = undefined;
  fetchTransactions();
  walletStore.fetchWallets(); // Refresh balance
}

onMounted(() => {
  fetchTransactions();
});

watch(
  () => walletStore.currentWallet,
  () => {
    fetchTransactions();
  },
);
</script>

<style scoped>
/* Tabs */
.tabs-wrapper {
  display: flex;
  padding: 4px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.6);
  margin-bottom: 24px;
  width: fit-content;
}

.tab-item {
  padding: 8px 24px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
}

.tab-item:hover {
  color: var(--text-primary);
}

.tab-item.active {
  background: var(--primary-color);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
}

.stat-card::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03));
  pointer-events: none;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 24px;
}

.stat-card.income .stat-icon-wrapper {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.stat-card.expense .stat-icon-wrapper {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.stat-card.balance .stat-icon-wrapper {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
}

.stat-content {
  flex: 1;
}

.stat-label {
  margin: 0 0 4px 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-value.income {
  color: var(--success-color);
}
.stat-value.expense {
  color: var(--danger-color);
}

/* Transaction List */
.transaction-group {
  margin-bottom: 24px;
  animation: fadeInUp 0.5s ease-out forwards;
  opacity: 0; /* Handled by animation */
}

.group-date {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.date-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-tertiary);
  white-space: nowrap;
}

.date-line {
  height: 1px;
  flex: 1;
  background: var(--border-glass);
}

.group-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 16px;
  cursor: pointer;
  border-radius: 16px;
}

.transaction-item:hover {
  transform: translateX(4px) translateY(-2px);
  background: rgba(30, 41, 59, 0.6);
  border-color: rgba(99, 102, 241, 0.3);
}

.item-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.item-icon-wrapper.expense {
  background: rgba(239, 68, 68, 0.1);
  color: var(--expense-color);
}

.item-icon-wrapper.income {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.item-content {
  flex: 1;
}

.item-name {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 2px;
}

.item-note {
  font-size: 12px;
  color: var(--text-secondary);
}

.item-amount {
  font-weight: 700;
  font-size: 16px;
}

.item-amount.income {
  color: var(--success-color);
}
.item-amount.expense {
  color: var(--danger-color);
}

.delete-btn {
  opacity: 0;
  color: var(--text-tertiary);
  transition: all 0.2s;
}

.transaction-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: var(--danger-color);
  background: rgba(239, 68, 68, 0.1);
}

/* Empty State */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: var(--text-secondary);
  gap: 16px;
}

.empty-state .el-icon {
  font-size: 48px;
  opacity: 0.3;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}
</style>
