<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Danh mục</h1>
      <el-button type="primary" @click="showAddDialog = true">
        <template #icon><Plus /></template>
        Thêm danh mục
      </el-button>
    </div>

    <!-- Expense Categories -->
    <div
      class="category-section animate-fade-in-up"
      style="animation-delay: 0.1s"
    >
      <h2 class="section-title">
        <span class="title-icon expense"><Minus /></span>
        <span class="text-gradient">Chi tiêu</span>
      </h2>
      <div class="category-grid">
        <div
          v-for="(cat, index) in categoryStore.expenseCategories"
          :key="cat.id"
          class="glass-card category-card"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <div class="category-icon-wrapper expense">
            <img
              v-if="cat.icon.startsWith('data:') || cat.icon.startsWith('http')"
              :src="cat.icon"
              class="custom-icon-img"
            />
            <component
              v-else
              :is="icons[cat.icon] || icons.HelpCircle"
              :size="24"
            />
          </div>
          <div class="category-content">
            <div class="category-name">{{ cat.name }}</div>
            <div class="category-note" v-if="cat.note">{{ cat.note }}</div>
          </div>
          <el-button
            class="action-btn"
            text
            circle
            @click.stop="deleteCategory(cat)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- Income Categories -->
    <div
      class="category-section animate-fade-in-up"
      style="animation-delay: 0.2s"
    >
      <h2 class="section-title">
        <span class="title-icon income"><Plus /></span>
        <span class="text-gradient">Thu nhập</span>
      </h2>
      <div class="category-grid">
        <div
          v-for="(cat, index) in categoryStore.incomeCategories"
          :key="cat.id"
          class="glass-card category-card"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <div class="category-icon-wrapper income">
            <img
              v-if="cat.icon.startsWith('data:') || cat.icon.startsWith('http')"
              :src="cat.icon"
              class="custom-icon-img"
            />
            <component
              v-else
              :is="icons[cat.icon] || icons.HelpCircle"
              :size="24"
            />
          </div>
          <div class="category-content">
            <div class="category-name">{{ cat.name }}</div>
            <div class="category-note" v-if="cat.note">{{ cat.note }}</div>
          </div>
          <el-button
            class="action-btn"
            text
            circle
            @click.stop="deleteCategory(cat)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- Add Category Dialog -->
    <el-dialog
      v-model="showAddDialog"
      title="Thêm danh mục"
      width="400px"
      :close-on-click-modal="false"
      class="glass-dialog"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="Tên danh mục" prop="name">
          <el-input
            v-model="form.name"
            placeholder="Ví dụ: Ăn sáng, Lương..."
          />
        </el-form-item>

        <el-form-item label="Loại" prop="type">
          <div class="type-selector">
            <div
              class="type-option"
              :class="{ active: form.type === 'EXPENSE' }"
              @click="form.type = 'EXPENSE'"
            >
              Chi tiêu
            </div>
            <div
              class="type-option"
              :class="{ active: form.type === 'INCOME' }"
              @click="form.type = 'INCOME'"
            >
              Thu nhập
            </div>
          </div>
          <!-- Hidden input for validation -->
          <el-input v-model="form.type" style="display: none" />
        </el-form-item>

        <el-form-item label="Icon" prop="icon">
          <div class="icon-input-tabs">
            <div
              class="icon-tab"
              :class="{ active: iconType === 'library' }"
              @click="iconType = 'library'"
            >
              Thư viện
            </div>
            <div
              class="icon-tab"
              :class="{ active: iconType === 'upload' }"
              @click="iconType = 'upload'"
            >
              Tải ảnh
            </div>
          </div>

          <div v-if="iconType === 'library'">
            <el-popover
              placement="bottom-start"
              :width="340"
              trigger="click"
              popper-class="glass-popover"
              :show-arrow="false"
              transition="el-zoom-in-top"
            >
              <template #reference>
                <div class="icon-select-trigger glass-input">
                  <div class="selected-icon-preview">
                    <component
                      :is="icons[form.icon] || icons.HelpCircle"
                      :size="20"
                    />
                  </div>
                  <span class="selected-icon-label">{{ form.icon }}</span>
                  <el-icon class="dropdown-chevron"><ArrowDown /></el-icon>
                </div>
              </template>

              <div class="icon-picker-container">
                <div class="search-box">
                  <el-input
                    v-model="searchText"
                    placeholder="Tìm kiếm icon..."
                    clearable
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </div>
                <div class="icon-grid-scroll">
                  <div
                    v-for="iconName in currentIconOptions"
                    :key="iconName"
                    class="icon-option"
                    :class="{ active: form.icon === iconName }"
                    @click="form.icon = iconName"
                  >
                    <div class="icon-crate">
                      <component :is="icons[iconName]" :size="20" />
                    </div>
                  </div>
                </div>
              </div>
            </el-popover>
          </div>

          <div v-else class="upload-container">
            <div class="upload-box" @click="triggerFileUpload">
              <div class="upload-preview" v-if="form.icon.startsWith('data:')">
                <img :src="form.icon" class="preview-img" />
              </div>
              <div class="upload-placeholder" v-else>
                <el-icon :size="24"><Upload /></el-icon>
                <span>Chọn ảnh (PNG, JPG)</span>
              </div>
              <input
                type="file"
                ref="fileInput"
                accept="image/*"
                style="display: none"
                @change="handleFileUpload"
              />
            </div>
            <div class="upload-hint">Tối đa 2MB.</div>
          </div>
        </el-form-item>

        <el-form-item label="Ghi chú" prop="note">
          <el-input
            v-model="form.note"
            type="textarea"
            :rows="2"
            placeholder="Mô tả thêm về danh mục này..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-actions">
          <el-button @click="showAddDialog = false" class="cancel-btn"
            >Hủy</el-button
          >
          <el-button
            type="primary"
            @click="handleAdd"
            :loading="saving"
            class="submit-btn"
          >
            Tạo danh mục
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
} from "element-plus";
import {
  Plus,
  Minus,
  Delete,
  ArrowDown,
  Search,
  Upload,
} from "lucide-vue-next";
import * as LucideIcons from "lucide-vue-next";
import { useCategoryStore } from "@/stores/category";
import type { Category, TransactionType } from "@/types";

const categoryStore = useCategoryStore();
const icons: any = LucideIcons;

const showAddDialog = ref(false);
const saving = ref(false);
const formRef = ref<FormInstance>();
const iconType = ref<"library" | "upload">("library");
const fileInput = ref<HTMLInputElement | null>(null);

const searchText = ref("");

// Get all icon names from Lucide, excluding internal exports
const allIconNames = Object.keys(LucideIcons).filter(
  (key) => key !== "createLucideIcon" && key !== "default",
);

const form = reactive({
  name: "",
  type: "EXPENSE" as TransactionType,
  icon: "Utensils",
  note: "",
});

const rules: FormRules = {
  name: [
    { required: true, message: "Vui lòng nhập tên danh mục", trigger: "blur" },
  ],
  type: [{ required: true, message: "Vui lòng chọn loại", trigger: "change" }],
  icon: [{ required: true, message: "Vui lòng chọn icon", trigger: "change" }],
};

// Filter icons based on search text
const currentIconOptions = computed(() => {
  if (!searchText.value) return allIconNames.slice(0, 50);
  const lowerSearch = searchText.value.toLowerCase();
  return allIconNames
    .filter((name) => name.toLowerCase().includes(lowerSearch))
    .slice(0, 50);
});

function triggerFileUpload() {
  fileInput.value?.click();
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error("File quá lớn (tối đa 2MB)");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target?.result as string;
    if (base64) {
      form.icon = base64;
    }
  };
  reader.readAsDataURL(file);
}

async function handleAdd() {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    saving.value = true;
    try {
      await categoryStore.createCategory({
        name: form.name,
        type: form.type,
        icon: form.icon,
        note: form.note,
      });
      ElMessage.success("Đã thêm danh mục");
      showAddDialog.value = false;
      form.name = "";
      form.type = "EXPENSE";
      form.icon = "Utensils";
      form.note = "";
    } catch (error: any) {
      ElMessage.error(
        error.response?.data?.message || "Thêm danh mục thất bại",
      );
    } finally {
      saving.value = false;
    }
  });
}

async function deleteCategory(cat: Category) {
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc muốn xóa danh mục "${cat.name}"?`,
      "Xác nhận xóa",
      {
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
        type: "warning",
        title: "Xác nhận",
      },
    );

    await categoryStore.deleteCategory(cat.id);
    ElMessage.success("Đã xóa danh mục");
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.response?.data?.message || "Xóa danh mục thất bại");
    }
  }
}

onMounted(() => {
  categoryStore.fetchCategories();
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 16px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

.category-section {
  margin-bottom: 40px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
}

.title-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.title-icon.expense {
  background: rgba(239, 68, 68, 0.2);
  color: var(--expense-color);
}

.title-icon.income {
  background: rgba(16, 185, 129, 0.2);
  color: var(--income-color);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.category-card {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.category-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--text-tertiary);
  opacity: 0.3;
  transition: all 0.3s ease;
}

.custom-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px; /* Slightly less than wrapper to fit nicely */
}

.category-card:hover::before {
  opacity: 1;
  background: var(--primary-color);
}

.category-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.category-icon-wrapper.expense {
  background: rgba(239, 68, 68, 0.1);
  color: var(--expense-color);
}

.category-icon-wrapper.income {
  background: rgba(16, 185, 129, 0.1);
  color: var(--income-color);
}

.category-content {
  flex: 1;
  overflow: hidden;
}

.category-name {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 2px;
}

.category-note {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-btn {
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;
}

.category-card:hover .action-btn {
  opacity: 1;
  transform: translateX(0);
}

.action-btn:hover {
  color: var(--danger-color);
  background: rgba(239, 68, 68, 0.1);
}

/* Add Dialog Styles */
.type-selector {
  display: flex;
  background: rgba(15, 23, 42, 0.6);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid var(--border-glass);
}

.type-option {
  flex: 1;
  text-align: center;
  padding: 8px;
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

.icon-select-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border: 1px solid var(--border-glass);
  border-radius: 8px;
  cursor: pointer;
  background: rgba(15, 23, 42, 0.4);
  transition: all 0.3s ease;
}

.icon-select-trigger:hover {
  border-color: var(--primary-color);
  background: rgba(15, 23, 42, 0.8);
}

.selected-icon-preview {
  width: 32px;
  height: 32px;
  background: var(--bg-deep);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  border: 1px solid var(--border-glass);
}

.selected-icon-label {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
}

.dropdown-chevron {
  color: var(--text-tertiary);
}

/* Popover Internal Styles */
.icon-picker-container {
  padding: 8px;
}

.search-box {
  margin-bottom: 12px;
}

.icon-grid-scroll {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
}

.icon-option {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.icon-crate {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.icon-option:hover .icon-crate {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.icon-option.active .icon-crate {
  background: var(--primary-color);
  color: white;
  box-shadow: 0 4px 12px var(--primary-glow);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.icon-input-tabs {
  display: flex;
  gap: 8px;
  background: rgba(15, 23, 42, 0.4);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid var(--border-glass);
  margin-bottom: 12px;
}

.icon-tab {
  flex: 1;
  text-align: center;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.icon-tab.active {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  font-weight: 500;
}

.upload-container {
  width: 100%;
}

.upload-box {
  width: 100%;
  height: 120px;
  border: 2px dashed var(--border-glass);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
}

.upload-box:hover {
  border-color: var(--primary-color);
  background: rgba(255, 255, 255, 0.05);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-tertiary);
  font-size: 13px;
}

.upload-preview {
  width: 100%;
  height: 100%;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.upload-hint {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 6px;
  text-align: center;
}
</style>
