import type { CartItem } from '../types/cart.types'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'


class CartService {
  async getCartItems(userId: number): Promise<CartItem[]> {
    const response = await axios.get(`${API_URL}/cart/${userId}`);
    return response.data;
  }

  async addToCart(productId: number,  userId: number): Promise<CartItem> {
    const response = await axios.post(`${API_URL}/cart`, { productId, userId });
    return response.data;
  }

  async updateCartItem(itemId: number, quantity: number): Promise<CartItem> {
    const response = await axios.patch(`${API_URL}/cart/${itemId}`, { quantity });
    return response.data;
  }

  async removeFromCart(itemId: number): Promise<void> {
    await axios.delete(`${API_URL}/cart/${itemId}`);
  }

  async clearCart(): Promise<void> {
    await axios.delete(`${API_URL}/cart`);
  }
}

export default new CartService(); 