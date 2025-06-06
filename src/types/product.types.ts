export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
    categoryId: number;
    imageUrl?: string;
    managerId: number;
    isActive?: boolean;
  }