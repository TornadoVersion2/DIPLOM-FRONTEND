export interface Filter {
    id: number;
    name: string;
    description: string;
    possibleValue: string;
    categoryId: number;
    isRanged: Boolean;
    maxValue: number;
    minValue: number;
}

export interface CreateFilterDto {
    name: string;
    description?: string;
    possibleValue: string
    categoryId: number;
    isRanged: Boolean;
    maxValue?: number;
    minValue?: number;
}

export interface FilterProduct extends CreateFilterProductDto {
    id: number
}

export interface CreateFilterProductDto {
    filterId: number;
    productId: number;
    value?: number;
}