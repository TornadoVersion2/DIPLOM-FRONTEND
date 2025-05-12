<template>
  <div class="products-list">
    <div class="header-actions">
      <h2>Список товаров</h2>
      <RouterLink v-if="user?.roles.includes(Role.ADMIN)" to="/products/add" class="add-button">Добавить товар
      </RouterLink>
    </div>

    <div class="search-filters">
      <div class="search-box">
        <input type="text" v-model="searchQuery" placeholder="Поиск по названию..." class="search-input" />
      </div>
      <div class="category-filter">
        <select v-model="selectedCategory" class="category-select">
          <option value="">Все категории</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="filteredProducts.length === 0" class="no-products">
      {{ searchQuery || selectedCategory ? 'Товары не найдены' : 'Товары отсутствуют' }}
    </div>
    <div v-else>
      <div class="products-grid">
        <div v-for="product in paginatedProducts" :key="product.id" class="product-card"
          @click="goToProduct(product.id)">
          <div class="product-image">
            <img :src="product.imageUrl ? `http://localhost:3000/api/images/${product.imageUrl}` : '/placeholder.png'"
              :alt="product.name" class="product-img" />
          </div>
          <div class="product-header">
            <div class="product_name">
              {{ product.name }}
            </div>
          </div>
          <p class="description">{{ product.description }}</p>

          <div class="product-details">
            <p>Цена: ₽{{ product.price }}</p>
            <p>Количество: {{ product.quantity }}</p>
            <p class="category-name">Категория: {{ getCategoryName(product.categoryId) }}</p>
          </div>
          <button @click.stop="addToCart(product.id)" class="add-to-cart-button">
            Добавить в корзину
          </button>
        </div>
      </div>

      <!-- Пагинация -->
      <div class="pagination">
        <button @click="currentPage--" :disabled="currentPage === 1" class="pagination-button">
          Назад
        </button>

        <div class="page-numbers">
          <button v-for="page in displayedPages" :key="page" @click="currentPage = page"
            :class="['page-number', { active: currentPage === page }]">
            {{ page }}
          </button>
        </div>

        <button @click="currentPage++" :disabled="currentPage === totalPages" class="pagination-button">
          Вперед
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import authService from '../services/auth.service'
import productsService from '../services/products.service'
import categoriesService from '../services/categories.service'
import cartService from '../services/cart.service'
import { Role } from '../services/auth.service'
import type { Product } from '../services/products.service'
import type { Category } from '../services/categories.service'

const router = useRouter()
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const searchQuery = ref('')
const selectedCategory = ref('')
const user = authService.getCurrentUser()

const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = !selectedCategory.value || product.categoryId === Number(selectedCategory.value)
    return matchesSearch && matchesCategory
  })
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredProducts.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage)
})

const displayedPages = computed(() => {
  const pages = []
  const maxVisiblePages = 5

  if (totalPages.value <= maxVisiblePages) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    let start = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2))
    let end = start + maxVisiblePages - 1

    if (end > totalPages.value) {
      end = totalPages.value
      start = Math.max(1, end - maxVisiblePages + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }

  return pages
})

watch([searchQuery, selectedCategory], () => {
  currentPage.value = 1
})

const fetchProducts = async () => {
  try {
    loading.value = true
    error.value = ''
    products.value = await productsService.getAllProducts()
  } catch (err) {
    error.value = 'Произошла ошибка при загрузке товаров'
    console.error('Error fetching products:', err)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    categories.value = await categoriesService.getAllCategories()
  } catch (err) {
    error.value = 'Произошла ошибка при загрузке категорий'
    console.error('Error fetching categories:', err)
  }
}

const goToProduct = (productId: number) => {
  router.push(`/products/${productId}`)
}

const getCategoryName = (categoryId: number) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : 'Без категории'
}

const addToCart = async (productId: number) => {
  try {
    const userId = authService.getCurrentUser()?.id
    if (!userId) {
      router.push('/login')
      return
    }
    await cartService.addToCart(productId, userId)
    alert('Товар добавлен в корзину')
  } catch (err) {
    alert('Произошла ошибка при добавлении товара в корзину')
    console.error('Error adding to cart:', err)
  }
}

onMounted(() => {
  fetchProducts()
  fetchCategories()
})

</script>

<style scoped>
.products-list {
  padding: 20px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.product-card {
  width: 210px;
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.product-image {
  width: 100%;
  height: 150px;
  margin-bottom: 10px;
  overflow: hidden;
  border-radius: 4px;
  flex-shrink: 0;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: fill;
  transition: transform 0.3s ease;
  background-color: #f8f9fa;
}

.product-card:hover .product-img {
  transform: scale(1.05);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  height: 1.5em;
  flex-shrink: 0;
}

.product_name {
  max-height: 1.5em;
  font-size: 18.72px;
  line-height: 1.5;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  flex: 1;
  margin-right: 10px;
}

.delete-button {
  background: none;
  border: none;
  color: #dc3545;
  font-size: 24px;
  cursor: pointer;
  padding: 0 5px;
  line-height: 1;
  transition: color 0.3s;
}

.delete-button:hover {
  color: #c82333;
}

.product-card .description {
  color: #666;
  font-style: italic;
  margin: 0 0 8px 0;
  height: 4.5em;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.product-details {
  height: 4.5em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
  margin-bottom: 8px;
}

.product-details p {
  margin: 0;
  line-height: 1.5;
  height: 1.5em;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.error {
  color: red;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
  margin: 10px 0;
}

.no-products {
  text-align: center;
  padding: 20px;
  color: #666;
}

/* Стили для модального окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.confirm-delete {
  background-color: #dc3545;
  color: white;
}

.confirm-delete:hover {
  background-color: #c82333;
}

.cancel-delete {
  background-color: #6c757d;
  color: white;
}

.cancel-delete:hover {
  background-color: #5a6268;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination-button:hover:not(:disabled) {
  background-color: #45a049;
}

.pagination-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-number {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.page-number:hover:not(.active) {
  background-color: #f5f5f5;
  border-color: #4CAF50;
}

.page-number.active {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.search-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #4CAF50;
}

.category-filter {
  min-width: 200px;
}

.category-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

.category-select:focus {
  outline: none;
  border-color: #4CAF50;
}

.category-name {
  max-height: 1.5em;
  line-height: 1.5;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.add-to-cart-button {
  width: 100%;
  padding: 8px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: auto;
  flex-shrink: 0;
}

.add-to-cart-button:hover {
  background-color: #45a049;
}
</style>