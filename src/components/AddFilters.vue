<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useDefaultStore } from '../storages/default.store'
import { storeToRefs } from 'pinia'
import authService from '@/services/auth.service'
import categoriesService from '../services/categories.service'
import filterService from '@/services/filter.service'
import type { Category } from '../types/categories.types'
import type { CreateFilterDto, CreateFilterDescriptionDto } from '@/types/filter.types'
import filterDescriptionService from '@/services/filter-description.service'

const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref('')
const { user } = storeToRefs(useDefaultStore())
const selectedCategoryId = ref(0)
const selectedCategory = ref<Category>({
  id: 0,
  name: '',
  description: '',
  quantity: 0,
  managerId: 0,
})
const isRangedFilter = ref('false')
const filterDescription = ref<CreateFilterDescriptionDto>({
  name: '',
  description: '',
  categoryId: 0,
  measureName: ''
})
const filter = ref<CreateFilterDto>({
  descriptionId: 0,
  possibleValue: ''
})

const fetchCategories = async () => {
  try {
    loading.value = true
    error.value = ''
    categories.value = await categoriesService.getAll()
  } catch (err) {
    error.value = 'Произошла ошибка при загрузке категорий'
    console.error('Error fetching categories:', err)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (loading.value) return
  if (selectedCategoryId.value === 0) return
  try {
    error.value = ''
    const description = await filterDescriptionService.create(filterDescription.value)
    console.log("Description: ", description)
    filter.value.descriptionId = description.id
    console.log("createFilterDto", filter.value)
    await filterService.create(filter.value)
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message
    console.error('Ошибка при создании фильтра', err.response?.data?.message || err.message)
  }
  loading.value = false
}

watch(selectedCategoryId, () => {
  filterDescription.value.categoryId = selectedCategoryId.value
  categories.value.forEach((category) => {
    if (category.id === selectedCategoryId.value) {
      selectedCategory.value = category
    }
  })
})

watch(isRangedFilter, () => {
  if (isRangedFilter) {
    filter.value.possibleValue = ''
  }
  else {
    filterDescription.value.measureName = ''
  }
  // filter.value.isRanged = isRangedFilter.value === "true" ? true : false
})


onMounted(() => {
  fetchCategories()
  const currentUser = authService.getCurrentUser()
  if (currentUser) {
    user.value = currentUser
  }
})
</script>

<template>
  <div class="containter">
    <div class="search-filters">
      <div class="category-filter">
        <select v-model="selectedCategoryId" class="category-select">
          <option value="0">Все категории</option>
          <option v-for="category in categories" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>
    </div>
    <h2>Добавление фильтра</h2>

    <h2>
      Для категории: {{ selectedCategory.name }}</h2>
    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <form v-else @submit.prevent="handleSubmit" class="product-form">
      <div class="form-group">
        <label for="name">Название:</label>
        <input type="text" id="name" v-model="filterDescription.name" required placeholder="Введите название фильтра" />
      </div>

      <div class="form-group">
        <label for="description">Описание:</label>
        <textarea id="description" v-model="filterDescription.description"
          placeholder="Введите описание фильтра"></textarea>
      </div>

      <div>Выбрано: {{ isRangedFilter === "true" ? 'Ранжированный фильтр' : 'Обычный фильтр' }}</div>
      <div class="picked">
        <div>
          <input type="radio" value="false" v-model="isRangedFilter" />
          <label for="two">Обычный фильтр</label>
        </div>
        <div>
          <input type="radio" value="true" v-model="isRangedFilter" />
          <label for="one">Ранжированный фильтр</label>
        </div>
      </div>

      <div v-if="isRangedFilter === 'false'" class="form-group">
        <label for="name">Значение фильтра:</label>
        <input type="text" id="name" v-model="filter.possibleValue" required
          placeholder="Введите возможное значение фильтра" />

      </div>
      <div v-else-if="isRangedFilter === 'true'" class="form-group">
        <!-- <label>Минималное значение:</label>
        <input type="number" min="0" step="0.01" v-model="filter.value" required
          placeholder="Введите минимальное значение филтра" /> -->
        <label>Единицы измерения для фильтра:</label>
        <input type="text" v-model="filterDescription.measureName" required
          placeholder="Введите единицы измерения для фильтра" />
      </div>
      <div class="form-actions">
        <button type="submit" :disabled="loading" class="submit-button">
          {{ loading ? 'Сохранение...' : 'Сохранить' }}
        </button>
        <RouterLink to="/Profile" class="cancel-button">Отмена</RouterLink>
      </div>
    </form>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>



<style scoped>
.containter {
  padding: 20px;
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

.picked {
  display: flex;
  gap: 20px;
}
</style>