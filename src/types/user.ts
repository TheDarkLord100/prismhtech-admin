export interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    role_id: number;
    permissions: string[];
}