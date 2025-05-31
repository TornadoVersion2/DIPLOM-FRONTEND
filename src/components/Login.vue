<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin" class="login-form">
      <h2>Вход в систему</h2>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required placeholder="Введите ваш email" />
      </div>

      <div class="form-group">
        <label for="password">Пароль:</label>
        <input type="password" id="password" v-model="password" required placeholder="Введите пароль" />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Загрузка...' : 'Войти' }}
      </button>

      <div class="form-footer">
        <p>
          Нет аккаунта?
          <router-link to="/register">Зарегистрироваться</router-link>
        </p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import authService from '../services/auth.service'
import { useDefaultStore } from '../storages/default.store'
import { storeToRefs } from 'pinia'

const { user } = storeToRefs(useDefaultStore())

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await authService.login(email.value, password.value)
    user.value = reactive(response.user)
    router.push('/')
  } catch (err: any) {
    error.value = 'Неправильный email или пароль'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #4CAF50;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 0.75rem;
  margin: 1rem 0;
  text-align: center;
}

.form-footer {
  margin-top: 1rem;
  text-align: center;
}

.form-footer a {
  color: #4CAF50;
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}
</style>