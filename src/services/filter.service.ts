import axios from 'axios'
import type { CreateFilterDto, Filter, FilterProduct, CreateFilterProductDto } from '../types/filter.types'

const API_URL = 'http://localhost:3000/api/filter'

class FilterService {
    async getAllFilters(): Promise<Filter[]> {
        const response = await axios.get(API_URL)
        return response.data
    }

    async getFilterById(id: number): Promise<Filter> {
        const response = await axios.get(`${API_URL}/${id}`)
        return response.data
    }

    async getFilterByCategory(categoryId: number): Promise<Filter[]> {
        const response = await axios.get(`${API_URL}/category/${categoryId}`)
        return response.data
    }

    async createFilter(Filter: CreateFilterDto): Promise<Filter> {
        let response
        try {
            response = await axios.post(API_URL, Filter)
        }
        catch {
            throw Error("Ошибка при создании фильтра")
            // console.log("Ошибка при создании фильтра")
        }
        if (response)
            return response.data
        else {
            throw Error("Ошибка при создании фильтра")
            // console.log("Ошибка при создании фильтра")
        }
    }

    async updateFilter(id: number, Filter: Filter): Promise<Filter> {
        const response = await axios.patch(`${API_URL}/${id}`, Filter)
        return response.data
    }

    async deleteFilter(id: number): Promise<void> {
        await axios.delete(`${API_URL}/${id}`)
    }

    async getFiltersByManager(managerId: number): Promise<Filter[]> {
        const response = await axios.get(`${API_URL}/manager/${managerId}`)
        return response.data
    }



    async getAllFilterProductss(): Promise<Filter[]> {
        const response = await axios.get(API_URL + `/product`)
        return response.data
    }

    async getFilterProductsById(id: number): Promise<Filter> {
        const response = await axios.get(`${API_URL}/product/${id}`)
        return response.data
    }

    async getFilterProductsByCategory(categoryId: number): Promise<Filter[]> {
        const response = await axios.get(`${API_URL}/product/category/${categoryId}`)
        return response.data
    }

    async createFilterProducts(Filter: CreateFilterProductDto): Promise<Filter> {
        let response
        console.log("Filter: ", Filter)
        try {
            response = await axios.post(API_URL + `/product`, Filter)
        }
        catch {
            throw Error("Ошибка при создании фильтра")
            // console.log("Ошибка при создании фильтра")
        }
        if (response)
            return response.data
        else {
            throw Error("Ошибка при создании фильтра")
            // console.log("Ошибка при создании фильтра")
        }
    }

    async updateFilterProducts(id: number, Filter: Filter): Promise<Filter> {
        const response = await axios.patch(`${API_URL}/product/${id}`, Filter)
        return response.data
    }

    async deleteFilterProducts(id: number): Promise<void> {
        await axios.delete(`${API_URL}/product/${id}`)
    }

    async getFiltersByManagerProducts(managerId: number): Promise<Filter[]> {
        const response = await axios.get(`${API_URL}/product/manager/${managerId}`)
        return response.data
    }
}

export default new FilterService() 