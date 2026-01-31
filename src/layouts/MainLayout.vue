<template>
  <div class="main-layout">
    <!-- Ambient Background -->
    <div class="ambient-bg"></div>

    <!-- Sidebar -->
    <aside class="sidebar glass-panel">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">
            <el-icon size="24"><Wallet /></el-icon>
          </div>
          <span class="logo-text">Kwallet</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link
          to="/transactions"
          class="nav-item"
          :class="{ active: route.path === '/transactions' }"
        >
          <el-icon><List /></el-icon>
          <span>Giao dịch</span>
        </router-link>
        <router-link
          to="/categories"
          class="nav-item"
          :class="{ active: route.path === '/categories' }"
        >
          <el-icon><Grid /></el-icon>
          <span>Danh mục</span>
        </router-link>
        <router-link
          to="/reports"
          class="nav-item"
          :class="{ active: route.path === '/reports' }"
        >
          <el-icon><PieChart /></el-icon>
          <span>Báo cáo</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-card" v-if="authStore.user">
          <div class="user-avatar" @click="triggerFileUpload">
            <img
              v-if="authStore.user.avatar"
              :src="authStore.user.avatar"
              alt="Avatar"
              class="avatar-image"
            />
            <el-icon v-else><User /></el-icon>
            <input
              type="file"
              ref="fileInput"
              accept="image/*"
              style="display: none"
              @change="handleFileChange"
            />
          </div>
          <div class="user-info">
            <span class="user-email">{{ authStore.user.email }}</span>
          </div>
        </div>
        <el-button class="logout-btn" text @click="handleLogout">
          <el-icon><LogOut /></el-icon>
        </el-button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="main-content">
      <!-- Header -->
      <header class="main-header glass-panel">
        <div class="wallet-info" v-if="walletStore.currentWallet">
          <div class="wallet-name">
            <div class="wallet-icon-wrapper">
              <el-icon><Wallet /></el-icon>
            </div>
            {{ walletStore.currentWallet.name }}
          </div>
          <div class="wallet-divider"></div>
          <div class="wallet-balance">
            <span class="balance-label">Số dư</span>
            <span
              class="balance-value"
              :class="{
                income: parseInt(walletStore.currentWallet.balance) >= 0,
                expense: parseInt(walletStore.currentWallet.balance) < 0,
              }"
            >
              {{ formatCurrency(walletStore.currentWallet.balance) }}
            </span>
          </div>
        </div>
        <div class="header-actions">
          <button class="theme-toggle-btn" @click="toggleTheme">
            <el-icon v-if="theme === 'dark'"><Sun /></el-icon>
            <el-icon v-else><Moon /></el-icon>
          </button>

          <el-button
            type="primary"
            class="add-btn"
            @click="showAddTransaction = true"
          >
            <el-icon><Plus /></el-icon>
            <span>Thêm giao dịch</span>
          </el-button>
        </div>
      </header>

      <!-- Page content -->
      <main class="page-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- Add Transaction Dialog -->
    <TransactionDialog
      v-model:visible="showAddTransaction"
      @saved="handleTransactionSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Wallet,
  List,
  Grid,
  PieChart,
  User,
  LogOut,
  Plus,
  Sun,
  Moon,
} from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { useWalletStore } from "@/stores/wallet";
import { useCategoryStore } from "@/stores/category";
import { formatCurrency } from "@/utils/format";
import TransactionDialog from "@/components/TransactionDialog.vue";
import { useTheme } from "@/composables/useTheme";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const walletStore = useWalletStore();
const categoryStore = useCategoryStore();
const { theme, toggleTheme } = useTheme();

const showAddTransaction = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

function triggerFileUpload() {
  fileInput.value?.click();
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  if (file.size > 5 * 1024 * 1024) {
    alert("File size too large (max 5MB)");
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target?.result as string;
    if (base64) {
      await authStore.updateAvatar(base64);
    }
  };
  reader.readAsDataURL(file);
}

onMounted(async () => {
  await Promise.all([
    authStore.fetchUser(),
    walletStore.fetchWallets(),
    categoryStore.fetchCategories(),
  ]);
});

async function handleLogout() {
  await authStore.logout();
  walletStore.reset();
  categoryStore.reset();
  router.push("/login");
}

function handleTransactionSaved() {
  showAddTransaction.value = false;
  walletStore.fetchWallets(); // Refresh balance
}
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: var(--bg-deep); /* Fallback */
}

.ambient-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(
      circle at 10% 20%,
      rgba(99, 102, 241, 0.15) 0%,
      transparent 40%
    ),
    radial-gradient(
      circle at 90% 80%,
      rgba(236, 72, 153, 0.1) 0%,
      transparent 40%
    );
  z-index: 0;
  pointer-events: none;
}

.sidebar {
  width: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  z-index: 10;
  border-right: 1px solid var(--border-glass);
}

.sidebar-header {
  padding: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--accent-color)
  );
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px var(--primary-glow);
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  background: var(--logo-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.5px;
}

.sidebar-nav {
  flex: 1;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 12px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  border: 1px solid transparent;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  transform: translateX(4px);
}

[data-theme="light"] .nav-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.15), transparent);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  font-weight: 600;
}

.nav-item.active .el-icon {
  color: var(--primary-color);
}

.sidebar-footer {
  padding: 24px;
  border-top: 1px solid var(--border-glass);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  overflow: hidden;
}

.user-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  overflow: hidden;
  position: relative;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-email {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 11px;
  color: var(--text-tertiary);
}

.logout-btn {
  color: var(--text-secondary) !important;
  padding: 8px !important;
  border-radius: 8px !important;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1) !important;
  color: var(--danger-color) !important;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
  overflow: hidden;
}

/* ... existing styles ... */
/* Theme Toggle */
.theme-toggle-btn {
  margin-right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.05); /* Dark mode hover */
  color: var(--primary-color);
}

[data-theme="light"] .theme-toggle-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.animate-spin-slow {
  animation: spin 3s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ... keep existing styles below if needed, but we are appending ... */
.main-header {
  height: 80px;
  padding: 0 40px;
  display: flex;
  justify-content: flex-end; /* Changed to accommodate new item order if needed, but existing was space-between */
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-glass);
}

.header-actions {
  display: flex;
  align-items: center;
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 20px;
  background: rgba(15, 23, 42, 0.4);
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid var(--border-glass);
}

.wallet-name {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: var(--text-primary);
}

.wallet-icon-wrapper {
  color: var(--primary-color);
  display: flex;
}

.wallet-divider {
  width: 1px;
  height: 24px;
  background: var(--border-glass);
}

.wallet-balance {
  display: flex;
  flex-direction: column;
}

.balance-label {
  font-size: 11px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.balance-value {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.add-btn {
  height: 44px;
  padding: 0 24px;
  font-size: 14px;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 0; /* Padding handled by page container */
}

/* Page Transition Specs */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
