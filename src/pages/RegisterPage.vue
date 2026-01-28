<template>
  <div class="register-page">
    <div class="register-card">
      <div class="register-header">
        <div class="logo">
          <el-icon size="48"><Wallet /></el-icon>
        </div>
        <h1>Tạo tài khoản</h1>
        <p>Bắt đầu quản lý tài chính của bạn</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        @submit.prevent="handleRegister"
        class="register-form"
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
            placeholder="Mật khẩu (tối thiểu 6 ký tự)"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="Xác nhận mật khẩu"
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
            class="register-button"
          >
            Đăng ký
          </el-button>
        </el-form-item>
      </el-form>

      <div class="register-footer">
        <span>Đã có tài khoản?</span>
        <router-link to="/login">Đăng nhập</router-link>
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
  confirmPassword: "",
});

const validateConfirmPassword = (
  _rule: any,
  value: string,
  callback: Function,
) => {
  if (value !== form.password) {
    callback(new Error("Mật khẩu không khớp"));
  } else {
    callback();
  }
};

const rules: FormRules = {
  email: [
    { required: true, message: "Vui lòng nhập email", trigger: "blur" },
    { type: "email", message: "Email không hợp lệ", trigger: "blur" },
  ],
  password: [
    { required: true, message: "Vui lòng nhập mật khẩu", trigger: "blur" },
    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "Vui lòng xác nhận mật khẩu", trigger: "blur" },
    { validator: validateConfirmPassword, trigger: "blur" },
  ],
};

async function handleRegister() {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;
    try {
      await authStore.register(form.email, form.password);
      ElMessage.success("Đăng ký thành công!");
      router.push("/transactions");
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || "Đăng ký thất bại");
    } finally {
      loading.value = false;
    }
  });
}
</script>

<style scoped>
.register-page {
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

.register-card {
  width: 100%;
  max-width: 400px;
  background: var(--bg-card);
  border-radius: 20px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  color: var(--primary-color);
  margin-bottom: 16px;
}

.register-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.register-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.register-form {
  margin-bottom: 24px;
}

.register-button {
  width: 100%;
}

.register-footer {
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
}

.register-footer a {
  color: var(--primary-color);
  text-decoration: none;
  margin-left: 8px;
}

.register-footer a:hover {
  text-decoration: underline;
}
</style>
