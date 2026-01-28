<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <el-icon size="48"><Wallet /></el-icon>
        </div>
        <h1>Kwallet</h1>
        <p>Quản lý thu chi thông minh</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        @submit.prevent="handleLogin"
        class="login-form"
      >
        <el-form-item prop="email">
          <el-input
            v-model="form.email"
            placeholder="Email"
            size="large"
            :prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Mật khẩu"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            native-type="submit"
            :loading="loading"
            class="login-button"
          >
            Đăng nhập
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <span>Chưa có tài khoản?</span>
        <router-link to="/register">Đăng ký ngay</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { Wallet, Message, Lock } from "@element-plus/icons-vue";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const formRef = ref<FormInstance>();
const loading = ref(false);

const form = reactive({
  email: "",
  password: "",
});

const rules: FormRules = {
  email: [
    { required: true, message: "Vui lòng nhập email", trigger: "blur" },
    { type: "email", message: "Email không hợp lệ", trigger: "blur" },
  ],
  password: [
    { required: true, message: "Vui lòng nhập mật khẩu", trigger: "blur" },
  ],
};

async function handleLogin() {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;
    try {
      await authStore.login(form.email, form.password);
      ElMessage.success("Đăng nhập thành công!");
      router.push("/transactions");
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      loading.value = false;
    }
  });
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--bg-dark) 0%,
    var(--bg-sidebar) 100%
  );
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--bg-card);
  border-radius: 20px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  color: var(--primary-color);
  margin-bottom: 16px;
}

.login-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.login-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.login-form {
  margin-bottom: 24px;
}

.login-button {
  width: 100%;
}

.login-footer {
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
}

.login-footer a {
  color: var(--primary-color);
  text-decoration: none;
  margin-left: 8px;
}

.login-footer a:hover {
  text-decoration: underline;
}
</style>
