<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDefaultStore } from '../storages/default.store'
import { storeToRefs } from 'pinia'
import { Role, type User } from '../types/auth.types'
import adminServise from '../services/admin.servise'

const { user } = storeToRefs(useDefaultStore())
const managersToApprove = ref<User[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const loadManagersToApprove = async () => {
  managersToApprove.value = []
  try {
    loading.value = true
    managersToApprove.value = await adminServise.getManagersToApprove()
  } catch (err) {
    error.value = 'Ошибка при загрузке списка потенциалных менеджеров'
  } finally {
    loading.value = false
  }
}

const approveManager = async (managerId: number, index: number) => {
  try {
    adminServise.approveManager(managerId)
    managersToApprove.value.splice(index, 1)
  } catch (err) {
    error.value = 'Ошибка при подтверждении менеджера'
  }
}

onMounted(() => {
  loadManagersToApprove()
})
</script>

<template>
  <div class="managers-list">
    <div class="managers">
      <h2>Подтверждение менеджеров</h2>
    </div>

    <div v-if="loading" class="loading">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      <p class="mt-2">Загрузка...</p>
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="managersToApprove.length === 0" class="empty-managers">
      <p>Менеджры на подтверждение не найдены</p>
    </div>
    <div v-else v-for="(manager, index) in managersToApprove" class="manager-item">
      <div class="manager-content">
        <div class="item-details">
          <h3 class="item-name">Id пользователя: {{ manager.id }}</h3>
          <p class="description">Имя пользователя: {{ manager.name }}</p>
          <div class="manager-info">
            <div class="info-row">
              <span class="info-label">Email пользователя: </span>
              <span class="info-value">{{ manager.email }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Роли менеджера:</span>
              <span class="info-value">{{ manager.roles }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="manager-actions">
        <button @click="approveManager(manager.id, index)" class="approve-button">
          Утвердить менеджера
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

.managers {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.description {
  font-size: 14px;
  color: #666;
  max-height: 4.5em;
  width: 280px;
  line-height: 1.5;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: left;
  margin: 0 0 10px 0;
}

.manager-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 10px 0;
}



.loading {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error {
  color: #dc3545;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
  margin: 10px 0;
}

.empty-managers {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #666;
}

.managers-list {
  padding: 20px;
}

.managers {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.error {
  color: red;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
  margin: 10px 0;
}


.managers {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.managers-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.manager-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.manager-content {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  width: 100%;
  max-width: 800px;
}

.item-details {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 300px;
  min-height: 150px;
  padding: 10px;
  box-sizing: border-box;
}

.item-name {
  max-height: 1.5em;
  font-size: 18.72px;
  line-height: 1.5;
  width: 280px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: left;
  margin: 0 0 10px 0;
}

.description {
  font-size: 14px;
  color: #666;
  max-height: 4.5em;
  width: 280px;
  line-height: 1.5;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: left;
  margin: 0 0 10px 0;
}

.manager-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 10px 0;
}

.info-row {
  display: flex;
  gap: 10px;
  font-size: 14px;
}

.info-label {
  color: #666;
  min-width: 80px;
}

.info-value {
  color: #333;
}


.manager-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  min-width: 200px;
}

.approve-button {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 28px;
  font-weight: 500;
  background-color: white;
  border-color: green;
  /* background-color: #4CAF50; */
}

.loading {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error {
  color: #dc3545;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
  margin: 10px 0;
}

.empty-managers {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #666;
}
</style> 