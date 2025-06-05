<template>
  <div class="product-detail">
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="product" class="product-content">
      <div class="product-header">
        <h1>{{ product.name }}</h1>
        <button @click="goBack" class="back-button">← Назад</button>
        <button v-if="user?.roles?.includes(Role.MANAGER)" @click="editProduct" class="edit-button">Редактировать
          товар</button>
      </div>

      <div v-if="editing === true" class="product-info">
        <form @submit.prevent="handleSubmit" class="product-form">
          <div class="form-group">
            <label for="name">Название:</label>
            <input type="text" id="name" v-model="form.name" required placeholder="Введите название товара" />
          </div>

          <div class="form-group">
            <label for="description">Описание:</label>
            <textarea id="description" v-model="form.description" required
              placeholder="Введите описание товара"></textarea>
          </div>

          <div class="form-group">
            <label for="price">Цена:</label>
            <input type="number" id="price" v-model="form.price" required min="0" placeholder="Введите цену" />
          </div>

          <div class="form-group">
            <label for="quantity">Количество:</label>
            <input type="number" id="quantity" v-model="form.quantity" required min="0"
              placeholder="Введите количество" />
          </div>

          <div class="form-group">
            <label>Категория:</label>
            <!-- <div class="search-box">
          <input type="text" v-model="searchQuery" placeholder="Найти категорию..." class="search-input" />
        </div> -->
          </div>

          <div v-if="form.categoryId > 0" class="form-group">
            <label>Фильтры:</label>
            <select class="form-select">
              <option selected>Выберите фильтр</option>
              <option v-for="filter in filters">
                {{ filter.name }}
              </option>
            </select>
            <!-- <input type="number" id="quantity" v-model="form.quantity" required min="0" placeholder="Введите количество" /> -->
          </div>

          <div class="form-group">
            <input type="file" id="image" @change="handleImageUpload" accept="image/*" class="form-control" />
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="Preview" />
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" :disabled="loading" class="submit-button">
              {{ loading ? 'Сохранение...' : 'Сохранить' }}
            </button>

            <button @click="editProduct" class="cancel-button">
              Отмена
            </button>
          </div>
        </form>
      </div>

      <div v-if="editing === false" class="product-info">
        <div class="product-main">
          <div class="product-description">
            <h2>Описание</h2>
            <p>{{ product.description }}</p>
          </div>
          <div class="product-image">
            <img :src="`http://localhost:3000/api/images/${product.imageUrl}`" :alt="product.name" class="product-img" />
          </div>

          <div class="product-details">
            <div class="detail-item">
              <span class="label">Цена:</span>
              <span class="value">₽{{ product.price }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Количество:</span>
              <span class="value">{{ product.quantity }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Категория:</span>
              <span class="value">{{ getCategoryName(product.categoryId) }}</span>
            </div>
          </div>
        </div>

        <div class="product-actions">
          <button @click="confirmDelete" class="delete-button"
            v-if="user?.roles.includes(Role.ADMIN) || user?.roles.includes(Role.MANAGER)">
            Удалить товар
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Подтверждение удаления</h3>
        <p>Вы уверены, что хотите удалить товар "{{ product?.name }}"?</p>
        <div class="modal-actions">
          <button @click="deleteProduct" class="confirm-delete">Удалить</button>
          <button @click="showDeleteModal = false" class="cancel-delete">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useDefaultStore } from '../storages/default.store'
import { storeToRefs } from 'pinia'
import authService from '../services/auth.service'
import imagesService from '@/services/images.service'
import productsService from '@/services/products.service'
import type { Product } from '../types/product.types'
import type { Category } from '../types/categories.types'
import type { Filter } from '../types/filter.types'
import { Role } from '../types/auth.types'

const route = useRoute()
const router = useRouter()
const product = ref<Product | null>(null)
const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref('')
const showDeleteModal = ref(false)
const { user } = storeToRefs(useDefaultStore())
const editing = ref(false)

const imagePreview = ref<string | undefined>(undefined)
const selectedFile = ref<File | null>(null)
const form = ref<Omit<Product, 'id'>>({
  name: '',
  description: '',
  price: 0,
  quantity: 0,
  categoryId: 0,
  managerId: 0
})

const filters = ref<Filter[]>([])
const getCategoryName = (categoryId: number) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : 'Без категории'
}

const fetchCategories = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/categories')
    categories.value = response.data
  } catch (err) {
    if (axios.isAxiosError(err)) {
      error.value = `Ошибка загрузки категорий: ${err.response?.data?.message || err.message}`
    } else {
      error.value = 'Произошла ошибка при загрузке категорий'
    }
    console.error('Error fetching categories:', err)
  }
}

const fetchProduct = async () => {
  try {
    loading.value = true
    error.value = ''
    // const response = await axios.get(`http://localhost:3000/api/products/${route.params.id}`)
    product.value = await productsService.getProduct(+route.params.id)
    console.log("Product.value: ", product.value)
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        error.value = `Ошибка: ${err.response.data.message || err.response.statusText}`
      } else if (err.request) {
        error.value = 'Нет ответа от сервера'
      } else {
        error.value = `Ошибка: ${err.message}`
      }
    } else {
      error.value = 'Произошла неизвестная ошибка'
    }
    console.error('Error fetching product:', err)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  if (editing.value) {
    editing.value = false
    return
  }
  router.back()
}

const editProduct = () => {
  editing.value = !editing.value
  console.log("form: ", form.value)
  console.log("Product: ", product.value)
  if (product.value) {
    form.value.name = product.value.name
    form.value.description = product.value.description
    form.value.price = product.value.price
    form.value.quantity = product.value.quantity
    form.value.categoryId = product.value.categoryId
    form.value.managerId = user.value.id
    console.log("imagePrevew: ", imagePreview.value)
    console.log("productImage: ", product.value.imageUrl)
    imagePreview.value = product.value.imageUrl
    console.log("imagePrevew: ", imagePreview.value)
    console.log("productImage: ", product.value.imageUrl)
  }

}

const confirmDelete = () => {
  showDeleteModal.value = true
}

const deleteProduct = async () => {
  if (!product.value) return

  try {
    loading.value = true
    await axios.delete(`http://localhost:3000/api/products/${product.value.id}`)
    router.push('/')
  } catch (err) {
    if (axios.isAxiosError(err)) {
      error.value = `Ошибка при удалении: ${err.response?.data?.message || 'Неизвестная ошибка'}`
    } else {
      error.value = 'Произошла ошибка при удалении товара'
    }
    console.error('Error deleting product:', err)
  } finally {
    loading.value = false
    showDeleteModal.value = false
  }
}

const handleSubmit = async () => {
  if (loading.value) return

  try {
    loading.value = true
    error.value = ''

    let imageUrl = ''
    if (selectedFile.value) {
      imageUrl = await imagesService.uploadImage(selectedFile.value)
    }
    if (user)
      if (product.value)
        await productsService.updateProduct(product.value.id, {
          ...form.value,
          imageUrl,
          managerId: user.value.id
        })
    router.push('/products')
  } catch (err) {
    error.value = 'Произошла ошибка при создании товара'
    console.error('Error creating product:', err)
  } finally {
    loading.value = false
  }
}

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement

  if (input.files && input.files[0]) {
    selectedFile.value = input.files[0]
    imagePreview.value = URL.createObjectURL(input.files[0])
  }
}


onMounted(() => {
  fetchProduct()
  fetchCategories()
})
</script>

<style scoped>
.product-detail {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}

.error {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 1rem;
  margin: 1rem 0;
  text-align: center;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.product-header h1 {
  margin: 0;
  color: #333;
}

.back-button {
  padding: 0.5rem 1rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: #5a6268;
}

.edit-button {
  padding: 0.5rem 1rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.edit-button:hover {
  background-color: #5a6268;
}

.product-info {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.product-main {
  margin-bottom: 2rem;
}

.product-description {
  margin-bottom: 2rem;
}

.product-description h2 {
  color: #333;
  margin-bottom: 1rem;
}

.product-description p {
  color: #666;
  line-height: 1.6;
}

.product-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.detail-item {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.detail-item .label {
  display: block;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.detail-item .value {
  color: #333;
  font-size: 1.2rem;
  font-weight: 500;
}

.product-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #dee2e6;
}

.delete-button {
  padding: 0.75rem 1.5rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.delete-button:hover {
  background-color: #c82333;
}

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

.product-image {
  margin: 2rem 0;
  text-align: center;
}

.product-img {
  max-width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.product-img:hover {
  transform: scale(1.02);
}


.add-product {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.product-form {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input,

/* .search-box {
  flex: 1;
  min-width: 200px;
} */
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.form-group select {
  background-color: white;
  cursor: pointer;
}

.form-group select:focus {
  outline: none;
  border-color: #4CAF50;
}

.search-input {
  flex: 1;
  margin-bottom: 10px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.submit-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.cancel-button {
  padding: 8px 16px;
  border-radius: 4px;
  background-color: #f5f5f5;
  color: #666;
  text-decoration: none;
  border: 1px solid #ddd;
}

.error {
  color: red;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
  margin-top: 20px;
}

.image-preview {
  margin-top: 10px;
  max-width: 200px;
}

.image-preview img {
  width: 100%;
  height: auto;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}
</style> 