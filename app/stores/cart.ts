import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Product } from "~~/types";

export interface CartItem extends Product {
    quantity: number;
}

export const useCartStore = defineStore('cart', () => {
    const items = ref<CartItem[]>([])
    
    const totalPrice = computed(() => {
        return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    })
    
    const itemCount = computed(() => {
        return items.value.reduce((sum, item) => sum + item.quantity, 0)
    })
    
    function addToCart(product: Product, quantity: number = 1) {
        const existingItem = items.value.find(item => item.id === product.id)
        
        if (existingItem) {
            existingItem.quantity += quantity
        } else {
            items.value.push({
                ...product,
                title: product.title || product.name || 'Unknown Product',
                quantity
            })
        }
    }
    
    function updateQuantity(productId: number | string, quantity: number) {
        const item = items.value.find(item => item.id === productId)
        if (item) {
            item.quantity = Math.max(1, quantity)
            if (item.stock && item.quantity > item.stock) {
                item.quantity = item.stock
            }
        }
    }

    function removeFromCart(productId: number | string) {
        const index = items.value.findIndex(item => item.id === productId)
        if (index !== -1) {
            items.value.splice(index, 1)
        }
    }
    
    function clearCart() {
        items.value = []
    }
    
    return { items, totalPrice, itemCount, addToCart, updateQuantity, removeFromCart, clearCart }
})
