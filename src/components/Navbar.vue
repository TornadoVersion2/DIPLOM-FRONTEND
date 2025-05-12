<template>
  <nav class="navbar">
    <div class="nav-brand">
      <router-link to="/">Магазин</router-link>
    </div>

    <div class="nav-links">
      <template v-if="isAuthenticated">
        <router-link to="/products" class="nav-link">Товары</router-link>
        <router-link v-if="user?.roles?.includes(Role.ADMIN)" to="/categories"
          class="nav-link">Категории</router-link>
        <router-link v-if="user?.roles?.includes(Role.USER)" to="/cart" class="nav-link cart-link">
          <span class="cart-icon">🛒</span>
          Корзина
        </router-link>
        <router-link to="/profile" class="nav-link">
          <span v-if="user?.name" class="user-info">
            Привет, {{ currentUserName }}
          </span>
        </router-link>
        <button @click="handleLogout" class="nav-button logout">
          Выйти
        </button>
      </template>
      <template v-else>
        <router-link to="/login" class="nav-button login">
          Войти
        </router-link>
        <router-link to="/register" class="nav-button register">
          Регистрация
        </router-link>
      </template>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import authService, { type User } from '../services/auth.service'
import { Role } from '../services/auth.service'
import { useDefaultStore } from '../storages/default.store'
import { storeToRefs } from 'pinia'

const router = useRouter()
const { user } = storeToRefs(useDefaultStore())

const isAuthenticated = computed(() => user.value?.id)
const currentUserName = computed(() => user.value?.name || user.value?.email)

const handleLogout = () => {
  authService.logout()
  user.value = reactive<User>({} as User)
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.nav-brand a {
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: #444;
}

.cart-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4CAF50;
  font-weight: 500;
}

.cart-link:hover {
  background-color: rgba(76, 175, 80, 0.1);
}

.cart-icon {
  font-size: 1.2rem;
}

.user-info {
  color: #fff;
  margin-right: 1rem;
  font-weight: 500;
}

.nav-button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.login {
  background-color: transparent;
  color: white;
  border: 1px solid white;
}

.login:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.register {
  background-color: #4CAF50;
  color: white;
}

.register:hover {
  background-color: #45a049;
}

.logout {
  background-color: #dc3545;
  color: white;
}

.logout:hover {
  background-color: #c82333;
}
</style>