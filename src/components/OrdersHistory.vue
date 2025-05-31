<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Order } from '../types/order.types'
import { OrderStatus } from '../types/order.types'
import orderService from '../services/order.service'
import { useDefaultStore } from '../storages/default.store'
import { storeToRefs } from 'pinia'
import cartService from '../services/cart.service'
import { Role, type User } from '../types/auth.types'

const { user } = storeToRefs(useDefaultStore())
const orders = ref<Order[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const statusColors = {
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.APPROVED]: 'bg-blue-100 text-blue-800',
  [OrderStatus.REJECTED]: 'bg-red-100 text-red-800',
  [OrderStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [OrderStatus.CANCELLED]: 'bg-gray-100 text-gray-800'
}

const statusLabels = {
  [OrderStatus.PENDING]: 'В обработке',
  [OrderStatus.APPROVED]: 'Одобрен',
  [OrderStatus.REJECTED]: 'Отклонен',
  [OrderStatus.COMPLETED]: 'Выполнен',
  [OrderStatus.CANCELLED]: 'Отменен'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadOrders = async () => {
  try {
    loading.value = true

    // if (!user.value) {
    //   error.value = 'Пользователь не авторизован'
    //   return
    // }

    if (user.value.roles?.includes(Role.MANAGER)) {
      orders.value = (await orderService.getOrdersByManager(user.value.id)).filter((order) => order.status === OrderStatus.COMPLETED)
    } else if (user.value.roles?.includes(Role.USER)) {
      orders.value = (await orderService.getOrdersByUser(user.value.id)).filter((order) => order.status === OrderStatus.COMPLETED)
    }
  } catch (err) {
    error.value = 'Ошибка при загрузке заказов'
  } finally {
    loading.value = false
  }
}

const updateOrderStatus = async (orderId: number, index: number, newStatus: OrderStatus) => {
  try {
    if (newStatus === OrderStatus.CANCELLED || newStatus === OrderStatus.COMPLETED) {
      try {
        // await cartService.removeFromCart(orderId)
        await orderService.deleteOrder(orderId)
        if (orders) {
          orders.value.splice(index, 1)
        }
        return
      } catch (cartErr) {
      }
    }
    await orderService.updateOrder(orderId, { status: newStatus })


    await loadOrders()
  } catch (err) {
    error.value = 'Ошибка при обновлении статуса заказа'
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<template>
  <div class="orders">
    <div class="header-actions">
      <h2>История заказов</h2>
    </div>

    <div v-if="loading" class="loading">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      <p class="mt-2">Загрузка...</p>
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="orders.length === 0" class="empty-orders">
      <p>Заказы не найдены</p>
    </div>

    <div v-else class="orders-list">
      <div v-for="(order, index) in orders" class="order-item">
        <!-- <div v-for="order in orders" :key="order.id" class="order-item"> -->
        <div class="order-content">
          <div class="item-image">
            <img
              :src="order.product.imageUrl ? `http://localhost:3000/api/images/${order.product.imageUrl}` : '/placeholder.png'"
              :alt="order.product.name" />
          </div>
          <div class="item-details">
            <h3 class="item-name">{{ order.product.name }}</h3>
            <p class="description">{{ order.product.description }}</p>
            <div class="order-info">
              <div class="info-row">
                <span class="info-label">Заказчик:</span>
                <span class="info-value">{{ order.user.name || order.user.email }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Менеджер:</span>
                <span class="info-value">{{ order.manager.name || order.manager.email }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Создан:</span>
                <span class="info-value">{{ formatDate(order.createdAt) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Обновлен:</span>
                <span class="info-value">{{ formatDate(order.updatedAt) }}</span>
              </div>
            </div>
            <p class="price">₽{{ order.product.price }}</p>
          </div>
        </div>
        <div class="order-actions">
          <span :class="['status-badge', statusColors[order.status]]">
            {{ statusLabels[order.status] }}
          </span>
          <div v-if="user?.roles?.includes(Role.MANAGER)" class="status-buttons">
            <!-- <button v-for="status in Object.values(OrderStatus)" :key="status"
              @click="updateOrderStatus(order.id, index, status)" :class="[
                'status-button',
                order.status === status ? 'status-button-active' : ''
              ]">
              {{ statusLabels[status] }}
            </button> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders {
  padding: 20px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.order-content {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  width: 100%;
  max-width: 800px;
}

.item-image {
  width: 150px;
  height: 150px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: fill;
  transition: transform 0.3s ease;
  background-color: #f8f9fa;
}

.item-image img:hover {
  transform: scale(1.05);
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

.order-info {
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

.price {
  color: #4CAF50;
  font-weight: bold;
  font-size: 1.1rem;
  margin: 10px 0 0 0;
  text-align: left;
}

.order-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  min-width: 200px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 28px;
  font-weight: 500;
}

.status-buttons {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.status-button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background-color: #f0f0f0;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.status-button:hover {
  background-color: #e0e0e0;
}

.status-button-active {
  background-color: #4CAF50;
  color: white;
  cursor: default;
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

.empty-orders {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #666;
}
</style> 