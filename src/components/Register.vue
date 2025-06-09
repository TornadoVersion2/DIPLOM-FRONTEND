<template>
  <div class="register-container">
    <form @submit.prevent="handleRegister" class="register-form">
      <h2>Регистрация</h2>
      
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <div v-if="error" class="error-message" :class="{ 'user-exists': isUserExists }">
        {{ error }}
        <div v-if="isUserExists" class="error-suggestion">
          <router-link to="/login">Перейти на страницу входа</router-link>
        </div>
      </div>

      <div class="form-group">
        <label for="email">Email:</label>
        <input
          type="email"
          id="email"
          v-model="email"
          required
          placeholder="Введите ваш email"
        />
      </div>

      <div class="form-group">
        <label for="name">Имя:</label>
        <input
          type="text"
          id="name"
          v-model="name"
          placeholder="Введите ваше имя"
        />
      </div>

      <div class="form-group">
        <label for="password">Пароль:</label>
        <input
          type="password"
          id="password"
          v-model="password"
          required
          placeholder="Введите пароль"
        />
      </div>

      <div class="form-group">
        <label for="confirmPassword">Подтвердите пароль:</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="confirmPassword"
          required
          placeholder="Подтвердите пароль"
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Загрузка...' : 'Зарегистрироваться' }}
      </button>

      <div class="form-footer">
        <p>
          Уже есть аккаунт?
          <router-link to="/login">Войти</router-link>
        </p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import authService from '../services/auth.service'

const router = useRouter()
const email = ref('')
const name = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const successMessage = ref('')
const loading = ref(false)

const isUserExists = computed(() => {
  return error.value === 'Пользователь с таким email уже существует'
})

const isFormValid = computed(() => {
  return email.value && 
         password.value && 
         confirmPassword.value && 
         password.value === confirmPassword.value
})

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Пароли не совпадают'
    return
  }

  try {
    loading.value = true
    error.value = ''
    successMessage.value = ''
    
    const response = await authService.register(
      email.value,
      password.value,
      name.value || ''
    )

    successMessage.value = 'Регистрация успешно завершена! Перенаправление...'
    setTimeout(() => {
      router.push('/')
    }, 2000)
  } catch (err: any) {
    console.error('Registration error: ', err)
    error.value = err.message || 'Произошла ошибка при регистрации'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.register-form {
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

.error-message.user-exists {
  background-color: #fff3cd;
  border-color: #ffeeba;
  color: #856404;
}

.error-suggestion {
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.error-suggestion a {
  color: #4CAF50;
  text-decoration: none;
  font-weight: bold;
}

.error-suggestion a:hover {
  text-decoration: underline;
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

.success-message {
  color: #28a745;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  text-align: center;
}
</style> 