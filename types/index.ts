export interface Product {
    id: number | string;
    title: string;
    name?: string; // For backward compatibility if needed
    price: number;
    image?: string | null;
    images?: string[] | null;
    category?: string | null;
    description?: string | null;
    stock?: number;
    slug?: string;
}