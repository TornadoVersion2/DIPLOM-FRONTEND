<template>
  <div class="profile-container">
    <div class="profile-card">
      <h2>Профиль пользователя</h2>
      
      <div v-if="user" class="profile-info">
        <div class="info-group">
          <label>Email:</label>
          <span>{{ user.email }}</span>
        </div>
        
        <div class="info-group">
          <label>Имя:</label>
          <span>{{ user.name || 'Не указано' }}</span>
        </div>

        <div class="info-group">
          <label>ID пользователя:</label>
          <span>{{ user.id }}</span>
        </div>
      </div>

      <div v-else class="error-message">
        Информация о пользователе не найдена
      </div>

      <button @click="handleLogout" class="logout-button">
        Выйти из аккаунта
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface User {
  id: number
  email: string
  name?: string
}

const router = useRouter()
const user = ref<User | null>(null)

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      user.value = JSON.parse(userStr)
    } catch (e) {
      console.error('Error parsing user data:', e)
    }
  }
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem;
}

.profile-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.profile-info {
  margin: 2rem 0;
}

.info-group {
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.info-group label {
  display: block;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.info-group span {
  color: #333;
  font-size: 1.1rem;
}

.logout-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

.logout-button:hover {
  background-color: #c82333;
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
</style> 