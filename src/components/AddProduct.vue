<template>
  <div class="add-product">
    <h2>Добавление товара</h2>
    <form @submit.prevent="handleSubmit" class="product-form">
      <div class="form-group">
        <label for="name">Название:</label>
        <input type="text" id="name" v-model="form.name" required placeholder="Введите название товара" />
      </div>

      <div class="form-group">
        <label for="description">Описание:</label>
        <textarea id="description" v-model="form.description" required placeholder="Введите описание товара"></textarea>
      </div>

      <div class="form-group">
        <label for="price">Цена:</label>
        <input type="number" id="price" v-model="form.price" required min="0" placeholder="Введите цену" />
      </div>

      <div class="form-group">
        <label for="quantity">Количество:</label>
        <input type="number" id="quantity" v-model="form.quantity" required min="0" placeholder="Введите количество" />
      </div>

      <div class="form-group">
        <label for="categoryId">Категория:</label>
        <select id="categoryId" v-model="form.categoryId" required class="form-select">
          <option value="">Выберите категорию</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="image">Изображение:</label>
        <input type="file" id="image" @change="handleImageUpload" accept="image/*" class="form-control" />
        <div v-if="imagePreview" class="image-preview">
          <img :src="imagePreview" alt="Preview" />
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="loading" class="submit-button">
          {{ loading ? 'Сохранение...' : 'Сохранить' }}
        </button>
        <RouterLink to="/products" class="cancel-button">Отмена</RouterLink>
      </div>
    </form>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import categoriesService from '../services/categories.service'
import productsService from '../services/products.service'
import imagesService from '../services/images.service'
import type { Category } from '../services/categories.service'
import type { Product } from '../services/products.service'

const router = useRouter()
const error = ref('')
const loading = ref(false)
const categories = ref<Category[]>([])
const imagePreview = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

const form = ref<Omit<Product, 'id'>>({
  name: '',
  description: '',
  price: 0,
  quantity: 0,
  categoryId: 0
})

const fetchCategories = async () => {
  try {
    categories.value = await categoriesService.getAllCategories()
  } catch (err) {
    error.value = 'Произошла ошибка при загрузке категорий'
    console.error('Error fetching categories:', err)
  }
}

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    selectedFile.value = input.files[0]
    imagePreview.value = URL.createObjectURL(input.files[0])
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

    await productsService.createProduct({
      ...form.value,
      imageUrl,
    })
    router.push('/products')
  } catch (err) {
    error.value = 'Произошла ошибка при создании товара'
    console.error('Error creating product:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
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