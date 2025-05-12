import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface Category {
  id: number;
  name: string;
  description?: string;
  productsCount?: number;
}

class CategoriesService {
  async getAllCategories(): Promise<Category[]> {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
  }

  async getCategory(id: number): Promise<Category> {
    const response = await axios.get(`${API_URL}/categories/${id}`);
    return response.data;
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const response = await axios.post(`${API_URL}/categories`, category);
    return response.data;
  }

  async updateCategory(id: number, category: Partial<Category>): Promise<Category> {
    const response = await axios.patch(`${API_URL}/categories/${id}`, category);
    return response.data;
  }

  async deleteCategory(id: number): Promise<void> {
    await axios.delete(`${API_URL}/categories/${id}`);
  }
}

export default new CategoriesService(); 