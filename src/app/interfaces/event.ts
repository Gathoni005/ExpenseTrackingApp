export interface AppEvent {
    id?: number;
    cost: number;
    category?: string;
    categoryId?: number;
    description: string;
    serviceProvider: string;
    serviceProviderDetails: string | number;
    date?: Date;
}
export interface User {
    email: string;
    password: string;
    confirmPassword?: string;
    name?: string;
}
export interface category {
    id?: number;
    categoryName: string;
    categoryDescription: string;
   
}