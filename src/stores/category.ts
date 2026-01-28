import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Category, CreateCategoryDto, TransactionType } from "@/types";
import { categoryApi } from "@/api/category";

export const useCategoryStore = defineStore("category", () => {
  const categories = ref<Category[]>([]);
  const loading = ref(false);

  const incomeCategories = computed(() =>
    categories.value.filter((c) => c.type === "INCOME"),
  );

  const expenseCategories = computed(() =>
    categories.value.filter((c) => c.type === "EXPENSE"),
  );

  async function fetchCategories(type?: TransactionType) {
    loading.value = true;
    try {
      categories.value = await categoryApi.getAll(type);
      return categories.value;
    } finally {
      loading.value = false;
    }
  }

  async function createCategory(data: CreateCategoryDto) {
    const category = await categoryApi.create(data);
    categories.value.push(category);
    return category;
  }

  async function updateCategory(id: string, data: Partial<CreateCategoryDto>) {
    const category = await categoryApi.update(id, data);
    const index = categories.value.findIndex((c) => c.id === id);
    if (index !== -1) {
      categories.value[index] = category;
    }
    return category;
  }

  async function deleteCategory(id: string) {
    await categoryApi.delete(id);
    categories.value = categories.value.filter((c) => c.id !== id);
  }

  function reset() {
    categories.value = [];
  }

  return {
    categories,
    incomeCategories,
    expenseCategories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reset,
  };
});
