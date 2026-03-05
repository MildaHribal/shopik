<script setup lang="ts">
import { Icon } from '@iconify/vue'

const supabase = useSupabase()
const emit = defineEmits<{
  (e: 'upload-success', url: string): void
}>()

const uploading = ref(false)
const error = ref('')

const uploadImage = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploading.value = true
  error.value = ''

  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
    const filePath = `products/${fileName}`

    const { data, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      error.value = uploadError.message
      return
    }

    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    emit('upload-success', urlData.publicUrl)
  } catch (e: any) {
    error.value = e.message || 'Chyba při nahrávání'
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="file-upload">
    <label class="upload-btn" :class="{ disabled: uploading }">
      <Icon v-if="uploading" icon="lucide:loader-2" height="16" class="animate-spin" />
      <Icon v-else icon="lucide:upload" height="16" />
      <span>{{ uploading ? 'Nahrávání...' : 'Nahrát obrázek' }}</span>
      <input type="file" @change="uploadImage" accept="image/*" class="hidden" :disabled="uploading" />
    </label>
    <p v-if="error" class="error-text">{{ error }}</p>
  </div>
</template>

<style scoped>
.file-upload {
  display: inline-flex;
  flex-direction: column;
  gap: 0.25rem;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(109, 201, 149, 0.1);
  color: #6dc995;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
}

.upload-btn:hover:not(.disabled) {
  background: rgba(109, 201, 149, 0.2);
}

.upload-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-btn input.hidden {
  display: none;
}

.error-text {
  color: #f87171;
  font-size: 0.8rem;
}
</style>