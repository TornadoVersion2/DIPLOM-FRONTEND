import type { Product } from '../types/product.types'
import axios from 'axios'
const API_URL = 'http://localhost:3000/api'


class ProductsService {
  async getAllProducts(): Promise<Product[]> {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  }

  async getProduct(id: number): Promise<Product> {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
  }

  async getProducByManager(id: number): Promise<Product[]> {
    const response = await axios.get(`${API_URL}/products/manager/${id}`);
    return response.data;
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const response = await axios.post(`${API_URL}/products`, product);
    return response.data;
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    const response = await axios.patch(`${API_URL}/products/${id}`, product);
    return response.data;
  }

  async deleteProduct(id: number): Promise<void> {
    await axios.delete(`${API_URL}/products/${id}`);
  }
}

export default new ProductsService(); 