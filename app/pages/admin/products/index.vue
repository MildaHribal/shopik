<script setup lang="ts">
import { Icon } from '@iconify/vue'

definePageMeta({
  layout: 'admin'
})

const { data: products, pending, refresh } = await useFetch<any[]>('/api/admin/products')
const toast = useCosmicToast()

// Search & filter
const searchQuery = ref('')
const selectedCategory = ref('')

const { data: allCategories, refresh: refreshCategories } = await useFetch<any[]>('/api/categories')

const categoryTree = computed(() => {
  if (!allCategories.value) return []
  const map = new Map()
  allCategories.value.forEach(cat => {
    map.set(cat.id, { ...cat, children: [] })
  })
  const tree: any[] = []
  allCategories.value.forEach(cat => {
    const node = map.get(cat.id)
    if (cat.parentId) {
      const parent = map.get(cat.parentId)
      if (parent) parent.children.push(node)
    } else {
      tree.push(node)
    }
  })
  return tree
})

// Helper to get flat category name including parents
function getCategoryPath(id: number | null): string {
  if (!id || !allCategories.value) return ''
  const path: string[] = []
  let current = allCategories.value.find(c => c.id === id)
  while (current) {
    path.unshift(current.name)
    const nextId = current.parentId
    current = nextId ? allCategories.value.find(c => c.id === nextId) : null
  }
  return path.join(' > ')
}

const filteredProducts = computed(() => {
  if (!products.value) return []
  let result = products.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((p: any) =>
      p.title.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
    )
  }
  if (selectedCategory.value) {
    result = result.filter((p: any) => p.category === selectedCategory.value)
  }
  return result
})

// Modal state
const showModal = ref(false)
const isEditing = ref(false)
const editingProduct = ref<any>(null)

const form = ref({
  title: '',
  description: '',
  price: 0,
  image: '',
  images: [] as string[],
  stock: 0,
  category: '',
  categoryId: null as number | null
})

// Hierarchical picker state
const pickerPath = ref<any[]>([]) // Breadcrumbs for navigation
const currentLevelCategories = computed(() => {
  if (pickerPath.value.length === 0) return categoryTree.value
  return pickerPath.value[pickerPath.value.length - 1].children || []
})

function selectLevel(cat: any) {
  if (cat.children && cat.children.length > 0) {
    pickerPath.value.push(cat)
  } else {
    // Leaf category selected
    form.value.categoryId = cat.id
    form.value.category = cat.name
  }
}

function resetPicker() {
  pickerPath.value = []
}

function setFinalCategory(cat: any) {
  form.value.categoryId = cat.id
  form.value.category = cat.name
}

// Image upload state
const uploading = ref(false)
const uploadError = ref('')
const MAX_IMAGES = 5

function openCreate() {
  isEditing.value = false
  editingProduct.value = null
  form.value = { title: '', description: '', price: 0, image: '', images: [], stock: 0, category: '', categoryId: null }
  uploadError.value = ''
  pickerPath.value = []
  showModal.value = true
}

function openEdit(product: any) {
  isEditing.value = true
  editingProduct.value = product
  form.value = {
    title: product.title,
    description: product.description || '',
    price: product.price,
    image: product.image || '',
    images: product.images || [],
    stock: product.stock,
    category: product.category || '',
    categoryId: product.categoryId || null
  }
  uploadError.value = ''
  pickerPath.value = []
  showModal.value = true
}

async function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return

  const remaining = MAX_IMAGES - form.value.images.length
  if (remaining <= 0) {
    uploadError.value = `Maximálně ${MAX_IMAGES} obrázků`
    return
  }

  const filesToUpload = Array.from(files).slice(0, remaining)
  uploading.value = true
  uploadError.value = ''

  try {
    for (const file of filesToUpload) {
      const formData = new FormData()
      formData.append('file', file)

      const result = await $fetch<{ url: string }>('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      form.value.images.push(result.url)

      // Auto-set first image as thumbnail
      if (!form.value.image) {
        form.value.image = result.url
      }
    }
  } catch (e: any) {
    uploadError.value = e.data?.message || e.message || 'Chyba při nahrávání'
  } finally {
    uploading.value = false
    // Reset file input
    input.value = ''
  }
}

function setAsThumbnail(url: string) {
  form.value.image = url
}

function removeImage(index: number) {
  const removed = form.value.images.splice(index, 1)[0]
  // If removed image was the thumbnail, pick another one
  if (form.value.image === removed) {
    form.value.image = form.value.images[0] || ''
  }
}

const saving = ref(false)

async function saveProduct() {
  saving.value = true
  try {
    const payload = {
      ...form.value,
      images: form.value.images,
    }
    if (isEditing.value && editingProduct.value) {
      await $fetch(`/api/admin/products/${editingProduct.value.id}`, {
        method: 'PUT',
        body: payload
      })
    } else {
      await $fetch('/api/admin/products', {
        method: 'POST',
        body: payload
      })
    }
    showModal.value = false
    await refresh()
    toast.success('Uloženo', isEditing.value ? 'Produkt byl upraven.' : 'Produkt byl vytvořen.')
  } catch (e: any) {
    toast.error('Uložení selhalo', e?.data?.statusMessage || e?.message || 'Produkt se nepodařilo uložit.')
    console.error('Chyba při ukládání:', e)
  } finally {
    saving.value = false
  }
}

const deletingId = ref<number | null>(null)
const pendingDeleteId = ref<number | null>(null)
const deleteConfirmUntil = ref(0)

async function deleteProduct(id: number) {
  const now = Date.now()
  if (pendingDeleteId.value !== id || now > deleteConfirmUntil.value) {
    pendingDeleteId.value = id
    deleteConfirmUntil.value = now + 5000
    toast.info('Potvrďte smazání', 'Klikněte znovu do 5 sekund.')
    return
  }
  deletingId.value = id
  try {
    await $fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    await refresh()
    toast.success('Smazáno', 'Produkt byl odstraněn.')
  } catch (e: any) {
    toast.error('Mazání selhalo', e?.data?.statusMessage || e?.message || 'Produkt se nepodařilo smazat.')
    console.error('Chyba při mazání:', e)
  } finally {
    pendingDeleteId.value = null
    deleteConfirmUntil.value = 0
    deletingId.value = null
  }
}

function getImageSrc(image: string) {
  if (!image) return ''
  if (image.startsWith('http')) return image
  return `/${image}`
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Produkty</h1>
        <p class="page-subtitle">Správa produktového katalogu</p>
      </div>
      <button class="btn-primary add-btn" @click="openCreate">
        <Icon icon="lucide:plus" height="18" />
        Přidat produkt
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-row">
      <div class="search-box">
        <Icon icon="lucide:search" height="18" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Hledat produkty..."
          class="search-input"
        />
      </div>
      <select v-model="selectedCategory" class="filter-select">
        <option value="">Všechny kategorie</option>
        <option v-for="cat in allCategories" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
      </select>
    </div>

    <!-- Products count -->
    <p class="results-count" v-if="!pending">
      {{ filteredProducts.length }} produktů
    </p>

    <!-- Loading -->
    <div v-if="pending" class="text-center py-12 text-gray-400">
      <Icon icon="lucide:loader-2" height="32" class="animate-spin mx-auto mb-3" />
      Načítání...
    </div>

    <!-- Table -->
    <div v-else class="admin-card">
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Produkt</th>
              <th>Kategorie</th>
              <th>Cena</th>
              <th>Sklad</th>
              <th>Vytvořeno</th>
              <th class="text-right">Akce</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in filteredProducts" :key="product.id">
              <td>
                <div class="product-cell">
                  <div class="product-thumb">
                    <img v-if="product.image" :src="getImageSrc(product.image)" :alt="product.title" />
                    <Icon v-else icon="lucide:image" height="20" class="text-gray-600" />
                  </div>
                  <div>
                    <span class="product-name">{{ product.title }}</span>
                    <span class="product-id">#{{ product.id }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="category-badge" v-if="product.category">{{ product.category }}</span>
              </td>
              <td class="font-semibold">{{ product.price.toLocaleString('cs-CZ') }} Kč</td>
              <td>
                <span :class="['stock-badge', product.stock <= 5 ? 'stock-low' : 'stock-ok']">
                  {{ product.stock }}
                </span>
              </td>
              <td class="text-sm text-gray-400">
                {{ new Date(product.createdAt).toLocaleDateString('cs-CZ') }}
              </td>
              <td>
                <div class="actions-cell">
                  <button class="action-btn edit-btn" @click="openEdit(product)" title="Upravit">
                    <Icon icon="lucide:pencil" height="16" />
                  </button>
                  <button
                    class="action-btn delete-btn"
                    @click="deleteProduct(product.id)"
                    :disabled="deletingId === product.id"
                    title="Smazat"
                  >
                    <Icon :icon="deletingId === product.id ? 'lucide:loader-2' : 'lucide:trash-2'" height="16" :class="{ 'animate-spin': deletingId === product.id }" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="modal-title">
                {{ isEditing ? 'Upravit produkt' : 'Nový produkt' }}
              </h3>
              <button @click="showModal = false" class="modal-close">
                <Icon icon="lucide:x" height="20" />
              </button>
            </div>

            <form @submit.prevent="saveProduct" class="modal-body">
              <div class="form-group">
                <label class="form-label">Název</label>
                <input v-model="form.title" type="text" class="form-input" required placeholder="Název produktu" />
              </div>
              <div class="form-group">
                <label class="form-label">Popis</label>
                <textarea v-model="form.description" class="form-input form-textarea" placeholder="Popis produktu"></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Cena (Kč)</label>
                  <input v-model.number="form.price" type="number" class="form-input" required min="0" />
                </div>
                <div class="form-group">
                  <label class="form-label">Sklad</label>
                  <input v-model.number="form.stock" type="number" class="form-input" min="0" />
                </div>
              </div>
              <div class="form-group font-sans">
                <label class="form-label">Kategorie</label>
                <div class="category-picker-box border border-white/5 rounded-xl bg-black/20 p-4">
                  <!-- Selected Category Breadcrumb -->
                  <div v-if="form.categoryId" class="flex items-center gap-2 p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg mb-4">
                    <Icon icon="lucide:check-circle" class="text-primary-400" />
                    <span class="text-sm font-bold text-primary-200 uppercase tracking-tight">{{ getCategoryPath(form.categoryId) }}</span>
                    <button type="button" @click="form.categoryId = null; form.category = ''" class="ml-auto p-1.5 hover:bg-red-500/10 rounded-full text-red-500 transition-all">
                      <Icon icon="lucide:x" height="14" />
                    </button>
                  </div>

                  <!-- Picker Stepper -->
                  <div class="picker-stepper bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                    <!-- Picker Breadcrumbs (Navigation) -->
                    <div class="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/10 text-xs">
                      <button type="button" @click="resetPicker" class="text-gray-400 hover:text-white transition-colors">Všechny</button>
                      <template v-for="(p, i) in pickerPath" :key="p.id">
                        <Icon icon="lucide:chevron-right" height="10" class="text-gray-600" />
                        <button type="button" @click="pickerPath = pickerPath.slice(0, i + 1)" class="text-gray-300 hover:text-white font-medium">
                          {{ p.name }}
                        </button>
                      </template>
                    </div>

                    <!-- Options Grid -->
                    <div class="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                      <button 
                        v-for="cat in currentLevelCategories" 
                        :key="cat.id"
                        type="button"
                        class="picker-btn group"
                        @click="selectLevel(cat)"
                      >
                        <span class="text-sm font-semibold">{{ cat.name }}</span>
                        <Icon v-if="cat.children && cat.children.length > 0" icon="lucide:folder-tree" height="14" class="ml-auto opacity-30 group-hover:opacity-100 transition-opacity" />
                        <Icon v-else icon="lucide:check" height="14" class="ml-auto opacity-0 group-hover:opacity-100 text-primary-400 transition-opacity" />
                      </button>

                      <div v-if="currentLevelCategories.length === 0" class="col-span-2 py-8 text-center text-gray-500 italic text-sm">
                        Žádné další podkategorie
                      </div>
                    </div>

                    <!-- "Select This" button for intermediate levels -->
                    <div v-if="pickerPath.length > 0" class="p-3 bg-white/[0.02] border-t border-white/5">
                      <button 
                        type="button"
                        class="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 text-sm font-bold border border-primary-500/20 transition-all"
                        @click="setFinalCategory(pickerPath[pickerPath.length - 1])"
                      >
                        <Icon icon="lucide:plus-circle" height="16" />
                        Zvolit: {{ pickerPath[pickerPath.length - 1].name }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Multi-image upload -->
              <div class="form-group">
                <label class="form-label">Obrázky produktu (max {{ MAX_IMAGES }})</label>

                <!-- Uploaded images grid -->
                <div v-if="form.images.length > 0" class="images-grid">
                  <div
                    v-for="(img, index) in form.images"
                    :key="index"
                    class="image-item"
                    :class="{ 'is-thumbnail': form.image === img }"
                    @click="setAsThumbnail(img)"
                    :title="form.image === img ? 'Náhledový obrázek' : 'Klikněte pro nastavení jako náhled'"
                  >
                    <img :src="getImageSrc(img)" alt="Obrázek" />
                    <div class="image-overlay">
                      <div v-if="form.image === img" class="thumbnail-badge">
                        <Icon icon="lucide:star" height="12" />
                        Náhled
                      </div>
                      <div v-else class="set-thumbnail-hint">
                        <Icon icon="lucide:mouse-pointer-click" height="12" />
                        Zvolit jako náhled
                      </div>
                    </div>
                    <button
                      type="button"
                      class="remove-image"
                      @click.stop="removeImage(index)"
                      title="Odebrat"
                    >
                      <Icon icon="lucide:x" height="12" />
                    </button>
                  </div>
                </div>

                <!-- Upload button -->
                <div v-if="form.images.length < MAX_IMAGES" class="upload-area">
                  <label class="upload-label" :class="{ 'upload-loading': uploading }">
                    <Icon v-if="uploading" icon="lucide:loader-2" height="20" class="animate-spin" />
                    <Icon v-else icon="lucide:image-plus" height="20" />
                    <span>{{ uploading ? 'Nahrávání...' : 'Přidat obrázky' }}</span>
                    <span class="upload-hint">{{ form.images.length }}/{{ MAX_IMAGES }}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      class="hidden-input"
                      @change="handleImageUpload"
                      :disabled="uploading"
                    />
                  </label>
                </div>

                <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn-ghost" @click="showModal = false">Zrušit</button>
                <button type="submit" class="btn-primary" :disabled="saving || uploading">
                  <Icon v-if="saving" icon="lucide:loader-2" height="16" class="animate-spin" />
                  {{ isEditing ? 'Uložit změny' : 'Vytvořit' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.02em;
}

.page-subtitle {
  color: #64748b;
  margin-top: 0.25rem;
  font-size: 0.95rem;
}

.add-btn {
  flex-shrink: 0;
  z-index: 10;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: #6dc995;
  color: #0f1117;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover { background: #8bdfaf; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-ghost {
  padding: 0.625rem 1.25rem;
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ghost:hover {
  color: #e2e8f0;
  border-color: rgba(255, 255, 255, 0.2);
}

.filters-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.search-input {
  width: 100%;
  padding: 0.625rem 0.875rem 0.625rem 2.5rem;
  background: #1e2030;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.5rem;
  color: #e2e8f0;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #6dc995;
}

.filter-select {
  padding: 0.625rem 0.875rem;
  background: #1e2030;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.5rem;
  color: #e2e8f0;
  font-size: 0.875rem;
  outline: none;
  cursor: pointer;
}

.results-count {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 0.75rem;
}

.admin-card {
  background: #1e2030;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.75rem;
  overflow: hidden;
}

.table-wrap { overflow-x: auto; }

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  padding: 0.75rem 1.25rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(0, 0, 0, 0.15);
}

.admin-table td {
  padding: 0.75rem 1.25rem;
  color: #cbd5e1;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.admin-table tbody tr { transition: background 0.15s; }
.admin-table tbody tr:hover { background: rgba(255, 255, 255, 0.02); }

.product-cell {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.product-thumb {
  width: 40px;
  height: 40px;
  border-radius: 0.375rem;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.product-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-name {
  display: block;
  font-weight: 500;
  color: #e2e8f0;
}

.product-id {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  font-family: monospace;
}

.category-badge {
  display: inline-flex;
  padding: 0.2rem 0.6rem;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 9999px;
  font-size: 0.8rem;
  color: #94a3b8;
}

.stock-badge {
  font-weight: 600;
  font-size: 0.875rem;
}

.stock-low { color: #f87171; }
.stock-ok { color: #34d399; }

.actions-cell {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.action-btn {
  padding: 0.4rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
}

.edit-btn:hover {
  background: rgba(59, 130, 246, 0.2);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Multi-image upload */
.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.image-item:hover {
  border-color: rgba(109, 201, 149, 0.5);
}

.image-item.is-thumbnail {
  border-color: #6dc995;
  box-shadow: 0 0 0 1px #6dc995, 0 0 12px rgba(109, 201, 149, 0.25);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.25rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-badge {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.65rem;
  font-weight: 600;
  color: #6dc995;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.set-thumbnail-hint {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.6rem;
  color: #94a3b8;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .set-thumbnail-hint {
  opacity: 1;
}

.remove-image {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  opacity: 0;
}

.image-item:hover .remove-image {
  opacity: 1;
}

.remove-image:hover {
  background: rgba(239, 68, 68, 0.9);
}

.upload-area {
  margin-top: 0.25rem;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 1rem;
  border: 2px dashed rgba(255, 255, 255, 0.12);
  border-radius: 0.5rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  font-size: 0.85rem;
}

.upload-label:hover {
  border-color: #6dc995;
  color: #6dc995;
}

.upload-loading {
  cursor: wait;
  opacity: 0.7;
}

.upload-hint {
  font-size: 0.7rem;
  opacity: 0.6;
}

.hidden-input {
  display: none;
}

.upload-error {
  color: #f87171;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  overflow-y: auto;
  background: #1e2030;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.75rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f1f5f9;
}

.modal-close {
  padding: 0.375rem;
  border-radius: 0.375rem;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.05);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
  flex: 1;
}

.form-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 0.375rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.form-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: #161822;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.5rem;
  color: #e2e8f0;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #6dc995;
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.text-right {
  text-align: right;
}

/* Category Picker Styles */
.picker-btn {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
}

.picker-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(109, 201, 149, 0.3);
  color: #fff;
  transform: translateY(-1px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
