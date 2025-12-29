export interface Product {
    id: number;
    title: string;
    name?: string; // For backward compatibility if needed
    price: number;
    image?: string;
    category?: string;
    description?: string;
    stock?: number;
    slug?: string;
}