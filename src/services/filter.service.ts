import axios from 'axios'
import type { CreateFilterDto, Filter } from '../types/filter.types'

const API_URL = 'http://localhost:3000/api/filter'

class FilterService {
    async create(filter: CreateFilterDto): Promise<Filter> {
        const response = await axios.post(API_URL, filter)
        return response.data
    }

    async getAll(): Promise<Filter[]> {
        return (await axios.get(API_URL)).data
    }

    async getById(id: number): Promise<Filter> {
        return (await axios.get(`${API_URL}/${id}`)).data
    }

    async getByCategory(categoryId: number): Promise<Filter[]> {
        return (await axios.get(`${API_URL}/category/${categoryId}`)).data
    }

    async update(filter: Filter): Promise<Filter> {
        return (await axios.patch(`${API_URL}/${filter.id}`, filter)).data
    }

    async delete(id: number): Promise<void> {
        await axios.delete(`${API_URL}/${id}`)
    }

    async getByManager(managerId: number): Promise<Filter[]> {
        return (await axios.get(`${API_URL}/manager/${managerId}`)).data
    }
}

export default new FilterService() 