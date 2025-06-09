<template>
  <div class="categories-list">
    <div class="header-actions">
      <h2>Категории товаров</h2>
      <button @click="showAddModal = true" class="add-button">Добавить категорию</button>
    </div>

    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="categories.length === 0" class="no-categories">
      Категории отсутствуют
    </div>
    <div v-else class="categories-grid">
      <div v-for="category in categories" :key="category.id" class="category-card">
        <div class="category-header">
          <h3>{{ category.name }}</h3>
          <div class="category-actions">
            <button @click="editCategory(category)" class="edit-button" title="Редактировать">
              ✎
            </button>
            <button @click="confirmDelete(category)" class="delete-button" title="Удалить">
              ×
            </button>
          </div>
        </div>
        <p v-if="category.description" class="description">{{ category.description }}</p>
      </div>
    </div>

    <!-- Модальное окно добавления/редактирования категории -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ showEditModal ? 'Редактировать категорию' : 'Добавить категорию' }}</h3>
        <form @submit.prevent="submitCategory" class="category-form">
          <div class="form-group">
            <label for="name">Название категории</label>
            <input id="name" v-model="categoryForm.name" type="text" required class="form-input" />
          </div>
          <div class="form-group">
            <label for="description">Описание (необязательно)</label>
            <textarea id="description" v-model="categoryForm.description" class="form-input" rows="3"></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="submit-button">
              {{ showEditModal ? 'Сохранить' : 'Добавить' }}
            </button>
            <button type="button" @click="closeModal" class="cancel-button">
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Подтверждение удаления</h3>
        <p>Вы уверены, что хотите удалить категорию "{{ categoryToDelete?.name }}"?</p>

        <div class="modal-actions">
          <button @click="deleteCategory" class="confirm-delete">Удалить</button>
          <button @click="cancelDelete" class="cancel-delete">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import categoriesService from '../services/categories.service'
import type { Category } from '../types/categories.types'
import { useDefaultStore } from '../storages/default.store'
import { storeToRefs } from 'pinia'
import authService from '@/services/auth.service'


const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const categoryToDelete = ref<Category | null>(null)
const { user } = storeToRefs(useDefaultStore())

const categoryForm = ref({
  id: null as number | null,
  name: '',
  description: ''
})

const fetchCategories = async () => {
  try {
    loading.value = true
    error.value = ''
    // categories.value = await categoriesService.getAll()
    categories.value = await categoriesService.getCategoryByManager(user.value.id)
  } catch (err) {
    error.value = 'Произошла ошибка при загрузке категорий'
    console.error('Error fetching categories:', err)
  } finally {
    loading.value = false
  }
}


const editCategory = (category: Category) => {
  categoryForm.value = {
    id: category.id,
    name: category.name,
    description: category.description || ''
  }
  showEditModal.value = true
}

const submitCategory = async () => {
  try {
    loading.value = true
    error.value = ''

    if (showEditModal.value && categoryForm.value.id) {
      await categoriesService.updateCategory(categoryForm.value.id, {
        name: categoryForm.value.name,
        description: categoryForm.value.description
      })
    } else {
      await categoriesService.createCategory({
        name: categoryForm.value.name,
        description: categoryForm.value.description,
        managerId: user.value.id
      })
    }

    await fetchCategories()
    closeModal()
  } catch (err) {
    error.value = 'Произошла ошибка при сохранении категории'
    console.error('Error saving category:', err)
  } finally {
    loading.value = false
  }
}

const confirmDelete = (category: Category) => {
  categoryToDelete.value = category
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  categoryToDelete.value = null
}

const deleteCategory = async () => {
  if (!categoryToDelete.value) return

  try {
    loading.value = true
    error.value = ''
    await categoriesService.deleteCategory(categoryToDelete.value.id)
    await fetchCategories()
    showDeleteModal.value = false
    categoryToDelete.value = null
  } catch (err) {
    error.value = 'Произошла ошибка при удалении категории'
    console.error('Error deleting category:', err)
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  categoryForm.value = {
    id: null,
    name: '',
    description: ''
  }
}

onMounted(() => {
  fetchCategories()
  const currentUser = authService.getCurrentUser()
  if (currentUser){
    user.value = currentUser
  }
})
</script>

<style scoped>
.categories-list {
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
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.category-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.category-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.category-actions {
  display: flex;
  gap: 8px;
}

.edit-button,
.delete-button {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.3s;
}

.edit-button {
  color: #2196F3;
}

.delete-button {
  color: #dc3545;
}

.edit-button:hover {
  color: #1976D2;
}

.delete-button:hover {
  color: #c82333;
}

.description {
  color: #666;
  margin: 10px 0;
  font-style: italic;
}

.products-count {
  color: #666;
  font-size: 0.9rem;
  margin: 10px 0 0;
}

.error {
  color: #dc3545;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
  margin: 10px 0;
}

.no-categories {
  text-align: center;
  padding: 20px;
  color: #666;
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
  max-width: 500px;
  width: 90%;
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
}

.category-form {
  margin-top: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #4CAF50;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.submit-button,
.cancel-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.submit-button {
  background-color: #4CAF50;
  color: white;
}

.submit-button:hover {
  background-color: #45a049;
}

.cancel-button {
  background-color: #6c757d;
  color: white;
}

.cancel-button:hover {
  background-color: #5a6268;
}

.warning {
  color: #dc3545;
  margin: 1rem 0;
  padding: 0.5rem;
  background-color: #ffebee;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.confirm-delete,
.cancel-delete {
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
</style>