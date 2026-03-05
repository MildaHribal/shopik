export type ToastVariant = 'success' | 'error' | 'info'

export type ToastItem = {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  createdAt: number
  timeoutMs: number
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

export function useCosmicToast() {
  const toasts = useState<ToastItem[]>('toast-items', () => [])

  function remove(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function push(input: Omit<ToastItem, 'id' | 'createdAt' | 'timeoutMs'> & { timeoutMs?: number }) {
    const item: ToastItem = {
      id: uid(),
      createdAt: Date.now(),
      timeoutMs: input.timeoutMs ?? 3500,
      title: input.title,
      description: input.description,
      variant: input.variant,
    }
    toasts.value = [item, ...toasts.value].slice(0, 5)

    if (process.client && item.timeoutMs > 0) {
      window.setTimeout(() => remove(item.id), item.timeoutMs)
    }
  }

  return {
    toasts,
    push,
    remove,
    success: (title: string, description?: string) => push({ variant: 'success', title, description }),
    error: (title: string, description?: string) => push({ variant: 'error', title, description, timeoutMs: 5000 }),
    info: (title: string, description?: string) => push({ variant: 'info', title, description }),
  }
}

