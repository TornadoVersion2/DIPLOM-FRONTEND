import type { Product } from './product.types'
import type { User } from './auth.types'


export enum OrderStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export interface Order {
    id: number
    status: OrderStatus
    user: User
    manager: User
    product: Product
    createdAt: string
    updatedAt: string
}

// export interface Manager {
//     id: number
//     email: string
//     name: string
// }

export interface CreateOrderDto {
    productId: number
    userId: number
    managerId?: number
}

export interface UpdateOrderDto {
    status?: OrderStatus
    managerId?: number
} 