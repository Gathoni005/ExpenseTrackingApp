export interface AppEvent {
    cost: number;
    category: string;
    description: string;
    date?: Date;
}
export interface User {
    email: string;
    password: string;
}