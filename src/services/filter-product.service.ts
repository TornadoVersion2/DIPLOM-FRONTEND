import axios from 'axios'
import type { CreateFilterProductDto, FilterProduct } from '../types/filter.types'

const API_URL = 'http://localhost:3000/api/filter/product'

export class FilterProductService {
    async create(filterProduct: CreateFilterProductDto): Promise<FilterProduct> {
        const response = await axios.post(API_URL, filterProduct)
        return response.data
    }

    async getAll(): Promise<FilterProduct[]> {
        const response = await axios.get(API_URL)
        return response.data
    }

    async getById(id: number): Promise<FilterProduct> {
        const response = await axios.get(`${API_URL}/${id}`)
        return response.data
    }

    async getByCategory(categoryId: number): Promise<FilterProduct[]> {
        const response = await axios.get(`${API_URL}/category/${categoryId}`)
        return response.data
    }

    async update(id: number, filterProduct: FilterProduct): Promise<FilterProduct> {
        const response = await axios.patch(`${API_URL}/${id}`, filterProduct)
        return response.data
    }

    async delete(id: number): Promise<void> {
        await axios.delete(`${API_URL}/${id}`)
    }

    async getByManager(managerId: number): Promise<FilterProduct[]> {
        const response = await axios.get(`${API_URL}/manager/${managerId}`)
        return response.data
    }
}

export default new FilterProductService() 