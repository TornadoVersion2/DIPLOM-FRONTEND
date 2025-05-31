<template>
  <div class="cart">
    <div class="header-actions">
      <h2>Корзина</h2>
      <button v-if="cartItems.length > 0" @click="checkout" class="checkout-button" :disabled="loading">
        {{ loading ? 'Оформление...' : 'Оформить заказ' }}
      </button>
    </div>
    <div v-if="loading" class="loading">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      <p class="mt-2">Загрузка...</p>
    </div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="cartItems.length === 0" class="empty-cart">
      Корзина пуста
    </div>
    <div v-else class="cart-items">
      <div v-for="item in cartItems" :key="item.id" class="cart-item">
        <div class="cart-item-content">
          <div v-if="item.product" class="item-image">
            <img
              :src="item.product.imageUrl ? `http://localhost:3000/api/images/${item.product.imageUrl}` : '/placeholder.png'"
              :alt="item.product.name" />
          </div>
          <div v-if="item.product" class="item-details">
            <h3 class="item-name">{{ item.product.name }}</h3>
            <p class="description">{{ item.product.description }}</p>
            <p class="quantity">Количество: {{ item.product.quantity }}</p>
            <p class="price">₽{{ item.product.price }}</p>
          </div>
        </div>
        <button @click="removeFromCart(item.id)" class="remove-button">
          Убрать из корзины
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import cartService from '../services/cart.service'
import orderService from '../services/order.service'
import authService from '../services/auth.service'
import type { CartItem } from '../types/cart.types'
import { useRouter } from 'vue-router'

const router = useRouter()
const cartItems = ref<CartItem[]>([])
const loading = ref(true)
const error = ref('')

const fetchCartItems = async () => {
  loading.value = true
  try {
    error.value = ''
    const userId = authService.getCurrentUser()?.id
    if (!userId) {
      error.value = 'Пользователь не авторизован'
      return
    }
    cartItems.value = await cartService.getCartItems(userId)
  } catch (err) {
    error.value = 'Произошла ошибка при загрузке корзины'
    console.error('Error fetching cart:', err)
  } finally {
    loading.value = false
  }
}

const removeFromCart = async (itemId: number) => {
  try {
    await cartService.removeFromCart(itemId)
    cartItems.value = cartItems.value.filter(item => item.id !== itemId)
  } catch (err) {
    error.value = 'Произошла ошибка при удалении товара'
    console.error('Error removing item from cart:', err)
  }
}

const checkout = async () => {
  try {
    loading.value = true
    error.value = ''

    const userId = authService.getCurrentUser()?.id
    if (!userId) {
      error.value = 'Пользователь не авторизован'
      return
    }



    // Создаем заказ для каждого товара в корзине
    for (const item of cartItems.value) {
      if (item.product && item.product.quantity > 0) {
        await orderService.createOrder({
          productId: item.product.id,
          userId: userId
        })
      }
    }

    // Очищаем корзину
    for (const item of cartItems.value) {
      if (item.product && item.product.quantity > 0) {
        await cartService.removeFromCart(item.id)
      }
    }

    // Обновляем список товаров в корзине
    cartItems.value = []

    // Перенаправляем на страницу заказов
    // router.push('/orders')
  } catch (err) {
    error.value = 'Произошла ошибка при оформлении заказа'
    console.error('Error during checkout:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCartItems()
})
</script>

<style scoped>
.cart {
  padding: 20px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.checkout-button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.checkout-button:hover {
  background-color: #45a049;
}

.checkout-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.cart-items {
  /* width: 100%; */
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cart-item-content {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  max-width: 800px;
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

.quantity {
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
  height: 150px;
  padding: 10px;
  box-sizing: border-box;
}

.item-details h3 {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
}

.price {
  color: #4CAF50;
  font-weight: bold;
  font-size: 1.1rem;
  margin: 0;
  /* width: 600px; */
  text-align: left;
}

.remove-button {
  padding: 8px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-button:hover {
  background-color: #c82333;
}

.error {
  color: red;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
  margin: 10px 0;
}

.empty-cart {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #666;
}

.loading {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>