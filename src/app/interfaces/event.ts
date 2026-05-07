export type EntityId = string | number;

export interface AppEvent {
    id?: EntityId;
    cost: number;
    category?: string;
    categoryId?: EntityId;
    description: string;
    serviceProvider: string;
    serviceProviderDetails: string | number;
    date?: Date | string;
}
export interface User {
    email: string;
    password: string;
    confirmPassword?: string;
    name?: string;
}
export interface category {
    id?: EntityId;
    categoryName: string;
}

export interface categoryDescription {
    id?: EntityId;
    categoryId: EntityId;
    description: string;
}
