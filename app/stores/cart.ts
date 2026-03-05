import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Product } from "~~/types";

export const useCartStore = defineStore('cart', () => {
    const items = ref<Product[]>([])
    
    const totalPrice = computed(() => {
        return items.value.reduce((sum, item) => sum + item.price, 0)
    })
    
    const itemCount = computed(() => items.value.length)
    
    function addToCart(product: Product) {
        // Ensure we have a title property, falling back to name if needed
        const itemToAdd = {
            ...product,
            title: product.title || product.name || 'Unknown Product'
        };
        items.value.push(itemToAdd)
    }
    
    function removeFromCart(index: number) {
        items.value.splice(index, 1)
    }
    
    function clearCart() {
        items.value = []
    }
    
    return { items, totalPrice, itemCount, addToCart, removeFromCart, clearCart }
})
