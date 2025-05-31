<template>
  <div class="profile-container">
    <div class="profile-card">
      <h2>Профиль пользователя</h2>

      <div v-if="isAuthenticated" class="profile-info">
        <div class="info-group">
          <label>Email:</label>
          <span>{{ user?.email }}</span>
        </div>

        <div class="info-group">
          <label>Имя:</label>
          <span>{{ user?.name || 'Не указано' }}</span>
        </div>
        <router-link to="/OrdersHistory" v-if="user?.roles?.includes(Role.MANAGER) || user?.roles?.includes(Role.USER)">
          <div class="info-group">
            <h2>История заказов</h2>
            <!-- <span>
              перейти
            </span> -->
          </div>
        </router-link>

        <router-link to="/ManagerApprove" v-if="user?.roles?.includes(Role.ADMIN)">
          <div class="info-group">
            <h2>Менеджеры на подтверждение</h2>
            <!-- <span>
              перейти
            </span> -->
          </div>
        </router-link>

        <!-- <router-link to="/OrdersHistory" v-if="user?.roles?.includes(Role.MANAGER) || user?.roles?.includes(Role.USER)">
          <div class="info-group">
            <h2>История заказов</h2>
             <span>
              перейти
            </span> 
          </div>
        </router-link> -->

        <!-- <div class="info-group">
          <label>История заказов</label>
          <span>Перейти</span>
        </div> -->
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from '../types/auth.types'
import { Role } from '../types/auth.types'
import authService from '../services/auth.service'
import { useDefaultStore } from '../storages/default.store'
import { storeToRefs } from 'pinia'



const { user } = storeToRefs(useDefaultStore())
const isAuthenticated = computed(() => user.value?.id)
const router = useRouter()
// const user = ref<User | null>(null)

onMounted(() => {
  // const userStr = localStorage.getItem('user')
  var currentUser = authService.getCurrentUser()
  if (currentUser) {
    user.value = currentUser
  }
  // if (userStr) {
  //   try {
  //     user.value = JSON.parse(userStr)
  //   } catch (e) {
  //     console.error('Error parsing user data:', e)
  //   }
  // }
})

const handleLogout = () => {
  authService.logout()
  user.value = reactive<User>({} as User)
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