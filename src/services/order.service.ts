import axios from 'axios'
import type { Order, CreateOrderDto, UpdateOrderDto } from '../types/order.types'

const API_URL = 'http://localhost:3000/api/orders'

class OrderService {
  async getAllOrders(): Promise<Order[]> {
    const response = await axios.get(API_URL)
    return response.data
  }

  async getOrderById(id: number): Promise<Order> {
    const response = await axios.get(`${API_URL}/${id}`)
    return response.data
  }

  async createOrder(order: CreateOrderDto): Promise<Order> {
    const response = await axios.post(API_URL, order)
    return response.data
  }

  async createBulkOrders(orders: CreateOrderDto[]): Promise<{ count: number }> {
    const response = await axios.post(`${API_URL}/bulk`, orders)
    return response.data
  }

  async updateOrder(id: number, order: UpdateOrderDto): Promise<Order> {
    const response = await axios.patch(`${API_URL}/${id}`, order)
    return response.data
  }

  async deleteOrder(id: number): Promise<void> {
    await axios.delete(`${API_URL}/${id}`)
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    const response = await axios.get(`${API_URL}/user/${userId}`)
    return response.data
  }

  async getOrdersHistoryByUser(userId: number): Promise<Order[]> {
    const response = await axios.get(`${API_URL}/user/${userId}`)
    return response.data
  }

  async getOrdersHistoryByManager(managerId: number): Promise<Order[]> {
    const response = await axios.get(`${API_URL}/manager/${managerId}`)
    return response.data
  }

  async getOrdersByManager(managerId: number): Promise<Order[]> {
    const response = await axios.get(`${API_URL}/manager/${managerId}`)
    return response.data
  }
}

export default new OrderService() 