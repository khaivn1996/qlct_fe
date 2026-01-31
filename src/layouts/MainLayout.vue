<template>
  <div class="main-layout">
    <!-- Ambient Background -->
    <div class="ambient-bg"></div>

    <!-- Mobile Backdrop -->
    <div
      class="mobile-backdrop"
      v-if="isMobileOpen"
      @click="isMobileOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside
      class="sidebar glass-panel"
      :class="{
        collapsed: isCollapsed && !isMobile,
        'mobile-open': isMobileOpen,
      }"
    >
      <div class="sidebar-header">
        <div class="logo-wrapper">
          <div class="logo">
            <div class="logo-icon">
              <el-icon size="24"><Wallet /></el-icon>
            </div>
            <span class="logo-text" v-show="!isCollapsed">Kwallet</span>
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link
          to="/transactions"
          class="nav-item"
          :class="{ active: route.path === '/transactions' }"
          @click="handleNavClick"
        >
          <el-icon><List /></el-icon>
          <span v-show="!isCollapsed">Giao dịch</span>
        </router-link>
        <router-link
          to="/categories"
          class="nav-item"
          :class="{ active: route.path === '/categories' }"
          @click="handleNavClick"
        >
          <el-icon><Grid /></el-icon>
          <span v-show="!isCollapsed">Danh mục</span>
        </router-link>
        <router-link
          to="/reports"
          class="nav-item"
          :class="{ active: route.path === '/reports' }"
          @click="handleNavClick"
        >
          <el-icon><PieChart /></el-icon>
          <span v-show="!isCollapsed">Báo cáo</span>
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
          <div class="user-info" v-if="!isCollapsed">
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
        <div class="mobile-menu-btn" @click="toggleSidebar">
          <el-icon size="24"><Menu /></el-icon>
        </div>
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
  Menu,
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

const isCollapsed = ref(false);
const isMobileOpen = ref(false);
const isMobile = ref(window.innerWidth <= 768);
const showAddTransaction = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

function toggleSidebar() {
  if (isMobile.value) {
    isMobileOpen.value = !isMobileOpen.value;
  } else {
    isCollapsed.value = !isCollapsed.value;
  }
}

// Handle resize
window.addEventListener("resize", () => {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) {
    isMobileOpen.value = false;
  }
});

function handleNavClick() {
  if (isMobile.value) {
    isMobileOpen.value = false;
  }
}

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
  flex-shrink: 0;
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
.mobile-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 8px;
  margin-right: 12px;
  color: var(--text-primary);
  border-radius: 8px;
  transition: background 0.2s;
}

.mobile-menu-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

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

.sidebar.collapsed {
  width: 80px;
}

.sidebar.collapsed .sidebar-header {
  padding: 24px 0;
  display: flex;
  justify-content: center;
}

.sidebar.collapsed .logo {
  justify-content: center;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 14px;
}

.sidebar.collapsed .sidebar-footer {
  flex-direction: column;
  padding: 24px 0;
  gap: 16px;
}

.sidebar.collapsed .user-card {
  flex-direction: column;
  overflow: visible;
}

.sidebar.collapsed .user-avatar {
  width: 40px;
  height: 40px;
}

/* Mobile Responsive */
.mobile-backdrop {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 90;
}

.menu-toggle {
  display: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: var(--text-secondary);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -100%;
    height: 100vh;
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.2);
    z-index: 99;
  }

  .sidebar.mobile-open {
    left: 0;
  }

  .mobile-backdrop {
    display: block;
  }

  .menu-toggle {
    display: flex; /* Keep this for the one inside sidebar if used to close */
    align-items: center;
    justify-content: center;
  }

  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .main-header {
    padding: 0 12px;
    justify-content: space-between;
    gap: 8px; /* Add gap for tight spaces */
  }

  .logo-wrapper {
    gap: 16px;
  }

  /* Hide "Thêm giao dịch" text on mobile */
  .add-btn span {
    display: none;
  }

  .add-btn {
    padding: 0 12px; /* Reduce padding since text is gone */
  }

  /* Make wallet info more compact */
  .wallet-info {
    gap: 10px;
    padding: 6px 12px;
  }

  .wallet-divider {
    display: none; /* Hide divider on small screens */
  }

  .balance-label {
    display: none; /* Hide "Số dư" label */
  }

  .wallet-balance {
    flex-direction: row;
    align-items: center;
  }

  /* Show logo in header on mobile if needed, 
     but currently logo is in sidebar. 
     We might need to adjust header layout */

  .logo {
    display: flex; /* Sidebar logo visible when open */
  }
}
</style>
