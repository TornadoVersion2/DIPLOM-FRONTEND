import type { Product } from './product.types'

export interface CartItem {
    id: number;
    productId: number;
    quantity: number;
    userId: number;
    product?: Product;
}