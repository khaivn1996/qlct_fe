import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("@/pages/LoginPage.vue"),
      meta: { guest: true },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("@/pages/RegisterPage.vue"),
      meta: { guest: true },
    },
    {
      path: "/",
      component: () => import("@/layouts/MainLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          redirect: "/transactions",
        },
        {
          path: "transactions",
          name: "transactions",
          component: () => import("@/pages/TransactionsPage.vue"),
        },
        {
          path: "categories",
          name: "categories",
          component: () => import("@/pages/CategoriesPage.vue"),
        },
        {
          path: "reports",
          name: "reports",
          component: () => import("@/pages/ReportsPage.vue"),
        },
      ],
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login");
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next("/transactions");
  } else {
    next();
  }
});

export default router;
