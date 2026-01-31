<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    :title="transaction ? 'Sửa giao dịch' : 'Thêm giao dịch'"
    width="90%"
    style="max-width: 480px"
    :close-on-click-modal="false"
    class="glass-dialog"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="Loại giao dịch" prop="type">
        <div class="type-selector">
          <div
            class="type-option"
            :class="{ active: form.type === 'EXPENSE' }"
            @click="
              form.type = 'EXPENSE';
              handleTypeChange();
            "
          >
            <el-icon><Minus /></el-icon>
            Chi tiêu
          </div>
          <div
            class="type-option"
            :class="{ active: form.type === 'INCOME' }"
            @click="
              form.type = 'INCOME';
              handleTypeChange();
            "
          >
            <el-icon><Plus /></el-icon>
            Thu nhập
          </div>
        </div>
      </el-form-item>

      <el-form-item label="Danh mục" prop="categoryId">
        <el-select
          v-model="form.categoryId"
          placeholder="Chọn danh mục"
          style="width: 100%"
          filterable
          popper-class="glass-dropdown"
        >
          <el-option
            v-for="cat in filteredCategories"
            :key="cat.id"
            :label="cat.name"
            :value="cat.id"
          >
            <div style="display: flex; align-items: center; gap: 10px">
              <div class="option-icon-wrapper">
                <img
                  v-if="
                    cat.icon.startsWith('data:') || cat.icon.startsWith('http')
                  "
                  :src="cat.icon"
                  style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 4px;
                  "
                />
                <component
                  v-else
                  :is="icons[cat.icon] || icons.HelpCircle"
                  :size="16"
                />
              </div>
              <span>{{ cat.name }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <div class="form-row">
        <el-form-item label="Số tiền (VND)" prop="amount" style="flex: 1">
          <el-input-number
            v-model="form.amount"
            :min="1"
            :step="10000"
            :controls="false"
            placeholder="0"
            style="width: 100%"
            class="amount-input"
          />
        </el-form-item>

        <el-form-item label="Ngày" prop="txnDate" style="width: 160px">
          <el-date-picker
            v-model="form.txnDate"
            type="date"
            placeholder="Chọn ngày"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            :clearable="false"
          />
        </el-form-item>
      </div>

      <el-form-item label="Ghi chú">
        <el-input
          v-model="form.note"
          type="textarea"
          :rows="3"
          placeholder="Thêm ghi chú..."
          resize="none"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-actions">
        <el-button @click="$emit('update:visible', false)" class="cancel-btn"
          >Hủy</el-button
        >
        <el-button
          type="primary"
          @click="handleSave"
          :loading="saving"
          class="submit-btn"
          size="large"
        >
          {{ transaction ? "Cập nhật" : "Lưu giao dịch" }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { Plus, Minus } from "lucide-vue-next";
import * as LucideIcons from "lucide-vue-next";
import { useTransactionStore } from "@/stores/transaction";
import { useCategoryStore } from "@/stores/category";
import { useWalletStore } from "@/stores/wallet";
import type { Transaction, TransactionType } from "@/types";
import { format } from "date-fns";

const props = defineProps<{
  visible: boolean;
  transaction?: Transaction;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  saved: [];
}>();

const transactionStore = useTransactionStore();
const categoryStore = useCategoryStore();
const walletStore = useWalletStore();
const icons: any = LucideIcons;

const formRef = ref<FormInstance>();
const saving = ref(false);

const form = reactive({
  type: "EXPENSE" as TransactionType,
  categoryId: "",
  amount: 0,
  txnDate: format(new Date(), "yyyy-MM-dd"),
  note: "",
});

const rules: FormRules = {
  categoryId: [
    { required: true, message: "Vui lòng chọn danh mục", trigger: "change" },
  ],
  amount: [
    { required: true, message: "Vui lòng nhập số tiền", trigger: "blur" },
    {
      type: "number",
      min: 1,
      message: "Số tiền phải lớn hơn 0",
      trigger: "blur",
    },
  ],
  txnDate: [
    { required: true, message: "Vui lòng chọn ngày", trigger: "change" },
  ],
};

const filteredCategories = computed(() => {
  return form.type === "EXPENSE"
    ? categoryStore.expenseCategories
    : categoryStore.incomeCategories;
});

function handleTypeChange() {
  form.categoryId = "";
}

async function handleSave() {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    if (!walletStore.currentWallet) {
      ElMessage.error("Không tìm thấy ví");
      return;
    }

    saving.value = true;
    try {
      if (props.transaction) {
        // Update
        await transactionStore.updateTransaction(props.transaction.id, {
          categoryId: form.categoryId,
          type: form.type,
          amount: form.amount,
          txnDate: form.txnDate,
          note: form.note || undefined,
        });
        ElMessage.success("Đã cập nhật giao dịch");
      } else {
        // Create
        await transactionStore.createTransaction({
          walletId: walletStore.currentWallet.id,
          categoryId: form.categoryId,
          type: form.type,
          amount: form.amount,
          txnDate: form.txnDate,
          note: form.note || undefined,
        });
        ElMessage.success("Đã thêm giao dịch");
      }
      emit("saved");
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || "Lỗi khi lưu giao dịch");
    } finally {
      saving.value = false;
    }
  });
}

// Reset form when dialog opens/closes
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      if (props.transaction) {
        // Edit mode
        form.type = props.transaction.type;
        form.categoryId = props.transaction.categoryId;
        form.amount = parseInt(props.transaction.amount);
        form.txnDate = props.transaction.txnDate.split("T")[0];
        form.note = props.transaction.note || "";
      } else {
        // Add mode
        form.type = "EXPENSE";
        form.categoryId = "";
        form.amount = 0;
        form.txnDate = format(new Date(), "yyyy-MM-dd");
        form.note = "";
      }
    }
  },
);
</script>

<style scoped>
.type-selector {
  display: flex;
  background: rgba(15, 23, 42, 0.6);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid var(--border-glass);
}

.type-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.type-option.active {
  background: var(--primary-color);
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
}

.form-row {
  display: flex;
  gap: 16px;
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}

.option-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  width: 20px;
  height: 20px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

:deep(.el-input-number .el-input__inner) {
  text-align: left;
}
</style>
