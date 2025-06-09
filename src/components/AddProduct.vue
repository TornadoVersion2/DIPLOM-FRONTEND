<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useDefaultStore } from '../storages/default.store'
import { storeToRefs } from 'pinia'
import categoriesService from '../services/categories.service'
import productsService from '../services/products.service'
import imagesService from '../services/images.service'
import authService from '../services/auth.service'
import filterService from '../services/filter.service'
import filterDescriptionService from '../services/filter-description.service'
import type { Category } from '../types/categories.types'
import type { Product } from '../types/product.types'
import type { CreateFilterProductDto, Filter, FilterDescription, FilterProduct } from '../types/filter.types'
import filterProductService, { FilterProductService } from '@/services/filter-product.service'

const router = useRouter()
const error = ref('')
const loading = ref(false)
const imagePreview = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const selectedCategoryId = ref(0)
const categories = ref<Category[]>([])
const { user } = storeToRefs(useDefaultStore())
const filters = ref<Filter[]>([])
const filterDescriptions = ref<FilterDescription[]>([])
const filterProduct = ref(reactive<Map<number, CreateFilterProductDto>>(new Map()))
// const filterDescriptions = ref<FilterDescription[]>([])
// const product = ref<Product>({

// })
// const noneRangedFilterNames = ref<string[]>([])
// const RangedFilterNames = ref<string[]>([])
// const RangedProductFilters = ref<Map<Filter, number>>(reactive(new Map()))
// const noneRangedProductFilters = ref<number[]>([])


const form = ref<Omit<Product, 'id'>>({
  name: '',
  description: '',
  price: 0,
  quantity: 0,
  categoryId: 0,
  managerId: user.value.id
})

const fetchCategories = async () => {
  try {
    categories.value = await categoriesService.getAll()
  } catch (err) {
    error.value = 'Произошла ошибка при загрузке категорий'
    console.error('Error fetching categories:', err)
  }
}

const fetchFilters = async () => {
  if (form.value.categoryId > 0) {
    try {
      filters.value = await filterService.getByCategory(form.value.categoryId)
      // console.log("Filters: ")
      // filters.value.forEach(filter => console.log(filter))
      filterDescriptions.value = await filterDescriptionService.getByCategory(selectedCategoryId.value)
      // filterProduct.value =
      // filterDescriptions.value.forEach((desc) => filterProduct.value.set(desc.id, {}))
      // console.log("FilterDescriptions: ")      
      // filterDescriptions.value.forEach(filter => console.log(filter))
      // filterDescriptions.value.forEach((desc) => filterProduct.value.push())
    } catch (err) {
      error.value = 'Произошла ошибка при загрузке фильтров'
      console.error('Error fetching filters:', err)
    }
  }
  // filtrateFilters()
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
    const prod = await productsService.createProduct({
      ...form.value,
      imageUrl,
      // managerId: user.value.id,

    })

    filterProduct.value.forEach(async (filter) => {
      await filterProductService.create({
        ...filter,
        productId: prod.id
      })
    })
    // noneRangedProductFilters.value.forEach((id) => filterService.create({ filterId: id, productId: prod.id }))
    // RangedProductFilters.value.forEach((value, filter) => filterService.create({ filterId: filter.id, productId: prod.id, value }))
    router.push('/ProductsForManager')
  } catch (err) {
    error.value = 'Произошла ошибка при создании товара'
    console.error('Error creating product:', err)
  } finally {
    loading.value = false
  }
}
const handleUnrangedFilter = async (id: number, filterId: number) => {
  filterProduct.value.set(id, { filterId: filterId, productId: 0 })

}

const handleRangedFilter = async (descId: number, filterId: number, value: number) => {
  console.log("handleRanged")
  filterProduct.value.set(descId, { filterId, productId: 0, value })

}
//   noneRangedProductFilters.value.push(Number(id))
// }

// const handleChangeNoneRangedFilter = async (id: string) => {
//   noneRangedProductFilters.value.push(Number(id))
// }

// const handleChangeRangedFilter = async (id: Filter, value: string) => {
//   RangedProductFilters.value.set(id, Number(value))
// }

// const filtrateFilters = () => {
//   noneRangedFilterNames.value = [...new Set(filters.value.filter((filter) => !filter.isRanged).map((filter) => filter.name))]
//   RangedFilterNames.value = [...new Set(filters.value.filter((filter) => filter.isRanged).map((filter) => filter.name))]
// }


watch([selectedCategoryId], async () => {
  form.value.categoryId = selectedCategoryId.value
  console.log("selectedCategoryId: ", selectedCategoryId.value)
  await fetchFilters()
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
        <label>Категория:</label>
        <select v-model="selectedCategoryId" required class="form-select">
          <option value=0>Выберите категорию</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>

      <label v-if="filters.length > 0">Фильтры:</label>
      <div v-if="form.categoryId > 0" v-for="filterDesc in filterDescriptions" class="form-group">
        <select v-if="!filterDesc.measureName" class="form-select"
          @change="(e: any) => handleUnrangedFilter(filterDesc.id, e.currentTarget.value)">
          <option selected>{{ filterDesc.name }}</option>
          <div v-for="filter in filters">
            <option :value="filter.id" v-if="filter.descriptionId === filterDesc.id">
              {{ filterDesc.name }} {{ filter.possibleValue }}
            </option>
          </div>
        </select>
        <div v-else>
          <div v-for="filter in filters">
            <div class="input-group" v-if="filter.descriptionId === filterDesc.id">
              <span class="input-group-text">{{ filterDesc.name }}</span>
              <input id="" type="number" min="0" step="0.01" class="input-group-text"
                @change="(e: any) => handleRangedFilter(filterDesc.id, filter.id, e.currentTarget.value,)" required
                placeholder="Введите значение фильтра" />
              <span class="input-group-text-measure">{{ filterDesc.measureName }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- <div v-if="form.categoryId > 0" v-for="filterName in noneRangedFilterNames" class="form-group">
        <select class="form-select" @change="(e) => handleChangeNoneRangedFilter(e.currentTarget!.value)">
          <option selected>{{ filterDesc }}</option>
          <div v-for="filter in filters">
            <option :value="filter.id" v-if="filter.name === filterDesc">
              {{ filter.name }} {{ filter.possibleValue }}
            </option>
          </div>
        </select>
      </div>


      <div v-if="form.categoryId > 0" v-for="filterName in RangedFilterNames" class="form-group">
        <div v-for="filter in filters">
          <div v-if="filter.name === filterName">
            <label>{{ filterName }}:</label>
            <input @change="(e) => handleChangeRangedFilter(filter, e.currentTarget!.value)" type="number"
              :min="filter.minValue" :max="filter.maxValue" step="0.01" id="min-value" required
              placeholder="Введите значение фильтра" />
          </div>
        </div>
      </div> -->

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
        <RouterLink to="/ProductsForManager" class="cancel-button">Отмена</RouterLink>
      </div>
    </form>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

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

.input-group {
  display: flex;
  /* justify-content: space-between; */
  align-items: center;
}

.input-group-text {
  min-width: 33%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  background: #f8f9fa;
  padding: 0.375rem 0.75rem;
  border: 1px solid #ced4da;
  border-left: none;
}

.input-group-text-measure {
  min-width: 13%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  background: #f8f9fa;
  padding: 0.375rem 0.75rem;
  border: 1px solid #ced4da;
  border-left: none;
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