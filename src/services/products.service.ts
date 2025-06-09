import type { Product } from '../types/product.types'
import axios from 'axios'
// import type { Filter } from '../types/filter.types'
const API_URL = 'http://localhost:3000/api'


class ProductsService {
  async getAllProducts(): Promise<Product[]> {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  }

  async search(searchQuery: string, currentPage: number = 1, itemsPerPage = 10, selectedCategoryId?: number, filtersId?: number[]): Promise<{ products: Product[], totalProducts: number }> {
    // console.log("searchQuery: ", searchQuery)
    // console.log("selectedCategoryId: ", selectedCategoryId)
    const response = await axios.post(`${API_URL}/products/search/`, {
      searchQuery,
      currentPage,
      itemsPerPage,
      selectedCategoryId,
      filters: filtersId
    });
    // console.log("resoncedat a: ", response.data)
    // console.log("Responce.products: ", response.data.products)
    // console.log("Responce.productsCounts: ", response.data.totalProducts)
    return { products: response.data.products, totalProducts: response.data.totalProducts };
  }

  async getPaginatedProducts(currentPage: number): Promise<Product[]> {
    const response = await axios.get(`${API_URL}/products/paginate/?currentPage=${currentPage}`);
    return response.data;
  }

  async getTotalPages(): Promise<number> {
    const response = await axios.get(`${API_URL}/products/totalPages`);
    return response.data;
  }

  async getProduct(id: number): Promise<Product | null> {
    const response = await axios.get(`${API_URL}/products/product/${id}`);
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