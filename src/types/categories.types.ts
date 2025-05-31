// import { PickType } from '@nestjs/mapped-types'

export interface Category {
  id: number;
  name: string;
  description?: string;
  quantity?: number;
  managerId: number;
}

export interface createCategory {
  name: string;
  description?: string;
  quantity?: number;
  managerId: number;
}
