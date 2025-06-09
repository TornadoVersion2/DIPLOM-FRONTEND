import axios from 'axios'
import type { CreateFilterDescriptionDto, FilterDescription } from '../types/filter.types'

const API_URL = 'http://localhost:3000/api/filter/filter-description'

export class FilterDescriptionService {
    async create(Filter: CreateFilterDescriptionDto): Promise<FilterDescription> {
        const response = await axios.post(API_URL, Filter)
        return response.data
    }

    async getIdsByCategory(category: number): Promise<number[]> {
        const response = await axios.get(`${API_URL}/category/${category}`)
        return response.data
    }

    async getAll(): Promise<FilterDescription[]> {
        const response = await axios.get(API_URL)
        return response.data
    }

    async getById(id: number): Promise<FilterDescription> {
        const response = await axios.get(`${API_URL}/${id}`)
        return response.data
    }

    async getByCategory(categoryId: number): Promise<FilterDescription[]> {
        const response = await axios.get(`${API_URL}/category/${categoryId}`)
        return response.data
    }

    async update(id: number, Filter: FilterDescription): Promise<FilterDescription> {
        const response = await axios.patch(`${API_URL}/${id}`, Filter)
        return response.data
    }

    async delete(id: number): Promise<void> {
        await axios.delete(`${API_URL}/${id}`)
    }

    async getByManager(managerId: number): Promise<FilterDescription[]> {
        const response = await axios.get(`${API_URL}/manager/${managerId}`)
        return response.data
    }
}

export default new FilterDescriptionService() 
