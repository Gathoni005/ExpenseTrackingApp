export interface AppEvent {
    id?: number;
    cost: number;
    category: string;
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