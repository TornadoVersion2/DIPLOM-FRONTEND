export interface CreateFilterDescriptionDto {
    name: string;
    description?: string;
    categoryId: number;
    measureName?: string
}

export interface FilterDescription extends CreateFilterDescriptionDto {
    id: number;
}

export interface CreateFilterDto {
    descriptionId: number;
    possibleValue?: string,
}

export interface Filter extends CreateFilterDto {
    id: number
}

export interface CreateFilterProductDto {
    filterId: number;
    productId: number;
    value?: number;
}

export interface FilterProduct extends CreateFilterProductDto {
    id: number
} 
