<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Báo cáo tháng</h1>
      <div class="month-picker-wrapper glass-input">
        <el-date-picker
          v-model="selectedMonth"
          type="month"
          placeholder="Chọn tháng"
          format="MM/YYYY"
          value-format="YYYY-MM"
          :clearable="false"
          @change="fetchReport"
        />
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading" size="40"><Loader2 /></el-icon>
    </div>

    <template v-else-if="report">
      <!-- Summary Cards -->
      <div
        class="summary-cards animate-fade-in-up text-xs!"
        style="animation-delay: 0.1s"
      >
        <div class="glass-card stat-card income">
          <div class="stat-icon-wrapper">
            <el-icon><ArrowUpRight /></el-icon>
          </div>
          <div class="stat-content">
            <h3 class="stat-label">Tổng thu</h3>
            <div class="stat-value income">
              {{ formatCurrency(report.totalIncome) }}
            </div>
          </div>
        </div>
        <div class="glass-card stat-card expense">
          <div class="stat-icon-wrapper">
            <el-icon><ArrowDownLeft /></el-icon>
          </div>
          <div class="stat-content">
            <h3 class="stat-label">Tổng chi</h3>
            <div class="stat-value expense">
              {{ formatCurrency(report.totalExpense) }}
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
              :class="{
                income: parseInt(report.balance) >= 0,
                expense: parseInt(report.balance) < 0,
              }"
            >
              {{ formatCurrency(report.balance) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Expense by Category -->
      <div
        class="report-section glass-card animate-fade-in-up"
        style="animation-delay: 0.2s"
        v-if="report.expenseByCategory.length > 0"
      >
        <h2 class="section-title">Chi tiêu theo danh mục</h2>

        <div class="chart-container">
          <v-chart class="chart" :option="chartOption" autoresize />
        </div>

        <div class="category-breakdown">
          <div
            v-for="item in report.expenseByCategory"
            :key="item.categoryId"
            class="breakdown-item"
          >
            <div class="breakdown-icon">
              <img
                v-if="
                  item.icon.startsWith('data:') || item.icon.startsWith('http')
                "
                :src="item.icon"
                class="custom-icon-img"
              />
              <component
                v-else
                :is="icons[item.icon] || icons.HelpCircle"
                :size="20"
              />
            </div>
            <div class="breakdown-info">
              <div class="breakdown-name">{{ item.name }}</div>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${getPercentage(item.total)}%` }"
                ></div>
              </div>
            </div>
            <div class="breakdown-amount">{{ formatCurrency(item.total) }}</div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <el-icon><PieChart /></el-icon>
        <p>Chưa có dữ liệu chi tiêu trong tháng này</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { use } from "echarts/core";
import { PieChart as EChartsPie } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";
import {
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  PieChart,
} from "lucide-vue-next";
import * as LucideIcons from "lucide-vue-next";
import { reportApi } from "@/api/report";
import { formatCurrency, formatMonth } from "@/utils/format";
import type { MonthlyReport } from "@/types";

// Register ECharts components
use([
  EChartsPie,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
]);

const loading = ref(false);
const selectedMonth = ref(formatMonth(new Date()));
const report = ref<MonthlyReport | null>(null);
const icons: any = LucideIcons;
const windowWidth = ref(window.innerWidth);

const updateWidth = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener("resize", updateWidth);
  fetchReport();
});

const chartOption = computed(() => {
  if (!report.value || report.value.expenseByCategory.length === 0) {
    return {};
  }

  const isMobile = windowWidth.value <= 768;

  const data = report.value.expenseByCategory.map((item: any) => ({
    name: item.name,
    value: parseInt(item.total),
  }));
  return {
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        return `${params.name}: ${formatCurrency(params.value)} (${params.percent}%)`;
      },
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      borderColor: "rgba(255, 255, 255, 0.1)",
      textStyle: {
        color: "#fff",
      },
    },
    legend: {
      orient: isMobile ? "horizontal" : "vertical",
      right: isMobile ? "center" : 0,
      bottom: isMobile ? 0 : "center",
      top: isMobile ? "bottom" : "center",
      textStyle: {
        color: "#94a3b8",
        fontSize: 12,
      },
      itemWidth: 12,
      itemHeight: 12,
      padding: [0, 0, 0, 0],
    },
    series: [
      {
        name: "Chi tiêu",
        type: "pie",
        radius: isMobile ? ["40%", "65%"] : ["50%", "80%"],
        center: isMobile ? ["50%", "45%"] : ["30%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: "transparent",
          borderWidth: 0,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: isMobile ? 14 : 16,
            fontWeight: "bold",
            color: "#fff",
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        labelLine: {
          show: false,
        },
        data,
      },
    ],
    color: [
      "#ef4444", // Red
      "#f97316", // Orange
      "#f59e0b", // Amber
      "#84cc16", // Lime
      "#10b981", // Emerald
      "#06b6d4", // Cyan
      "#3b82f6", // Blue
      "#8b5cf6", // Violet
      "#d946ef", // Fuchsia
      "#f43f5e", // Rose
    ],
  };
});

const totalExpense = computed(() => {
  if (!report.value) return 0;
  return parseInt(report.value.totalExpense);
});

function getPercentage(amount: string): number {
  if (totalExpense.value === 0) return 0;
  return Math.round((parseInt(amount) / totalExpense.value) * 100);
}

async function fetchReport() {
  loading.value = true;
  try {
    report.value = await reportApi.getMonthly(selectedMonth.value);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchReport();
});
</script>

<style scoped>
.page-header {
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: center;
  }
}

.month-picker-wrapper {
  width: 200px;
}

/* Force dark theme for date picker inputs specifically */
:deep(.el-input__wrapper) {
  background-color: rgba(15, 23, 42, 0.6) !important;
  box-shadow: none !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-input__inner) {
  color: white !important;
}

.summary-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  flex: 1 1 300px;
  min-width: 0; /* Prevent flex overflow */
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
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
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-value.income {
  color: var(--success-color);
}
.stat-value.expense {
  color: var(--danger-color);
}

.report-section {
  padding: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 32px 0;
  color: var(--text-primary);
}

.chart-container {
  height: 350px;
  margin-bottom: 32px;
}

.chart {
  width: 100%;
  height: 100%;
}

.category-breakdown {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
  transition: all 0.2s;
}

.breakdown-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.05);
}

.breakdown-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--expense-color);
  overflow: hidden; /* Ensure img stays inside */
}

.custom-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.breakdown-info {
  flex: 1;
}

.breakdown-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--text-primary);
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--expense-color);
  border-radius: 3px;
}

.breakdown-amount {
  font-size: 16px;
  font-weight: 600;
  color: var(
    --text-primary
  ); /* Changed from red to white for better contrast */
  min-width: 120px;
  text-align: right;
}

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
</style>
