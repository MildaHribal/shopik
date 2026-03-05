<script setup lang="ts">
import { Icon } from '@iconify/vue'

definePageMeta({
  layout: 'admin'
})

const { data: orders, pending, refresh } = await useFetch<any[]>('/api/admin/orders')

const searchQuery = ref('')
const statusFilter = ref('')

const allStatuses = [
  { value: 'pending', label: 'Čekající' },
  { value: 'paid', label: 'Zaplaceno' },
  { value: 'shipped', label: 'Odesláno' },
  { value: 'delivered', label: 'Doručeno' },
  { value: 'cancelled', label: 'Zrušeno' }
]

const paymentLabels: Record<string, string> = {
  unpaid: 'Nezaplaceno',
  paid: 'Zaplaceno',
  refunded: 'Vráceno'
}

const filteredOrders = computed(() => {
  if (!orders.value) return []
  let result = orders.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((o: any) =>
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      String(o.id).includes(q)
    )
  }
  if (statusFilter.value) {
    result = result.filter((o: any) => o.status === statusFilter.value)
  }
  return result
})

const statusLabel = (status: string) => {
  return allStatuses.find(s => s.value === status)?.label || status
}

const statusClass = (status: string) => {
  const map: Record<string, string> = {
    pending: 'badge-warning',
    paid: 'badge-info',
    shipped: 'badge-primary',
    delivered: 'badge-success',
    cancelled: 'badge-danger'
  }
  return map[status] || ''
}

const paymentClass = (status: string) => {
  const map: Record<string, string> = {
    unpaid: 'badge-warning',
    paid: 'badge-success',
    refunded: 'badge-danger'
  }
  return map[status] || ''
}

const updatingId = ref<number | null>(null)

async function changeStatus(orderId: number, newStatus: string) {
  updatingId.value = orderId
  try {
    let paymentStatus = undefined
    if (newStatus === 'paid') paymentStatus = 'paid'
    if (newStatus === 'cancelled') paymentStatus = 'refunded'

    await $fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      body: { status: newStatus, paymentStatus }
    })
    await refresh()
  } catch (e) {
    console.error('Chyba při aktualizaci:', e)
  } finally {
    updatingId.value = null
  }
}

// Detail modal
const selectedOrder = ref<any>(null)
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Objednávky</h1>
        <p class="page-subtitle">Správa objednávek zákazníků</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-row">
      <div class="search-box">
        <Icon icon="lucide:search" height="18" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Hledat dle jména, emailu, ID..."
          class="search-input"
        />
      </div>
      <select v-model="statusFilter" class="filter-select">
        <option value="">Všechny stavy</option>
        <option v-for="s in allStatuses" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
    </div>

    <p class="results-count" v-if="!pending">
      {{ filteredOrders.length }} objednávek
    </p>

    <div v-if="pending" class="text-center py-12 text-gray-400">
      <Icon icon="lucide:loader-2" height="32" class="animate-spin mx-auto mb-3" />
      Načítání...
    </div>

    <div v-else class="admin-card">
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Zákazník</th>
              <th>Položky</th>
              <th>Celkem</th>
              <th>Platba</th>
              <th>Stav</th>
              <th>Datum</th>
              <th>Akce</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id">
              <td class="font-mono text-sm">#{{ order.id }}</td>
              <td>
                <div class="customer-cell">
                  <span class="customer-name">{{ order.customerName }}</span>
                  <span class="customer-email">{{ order.customerEmail }}</span>
                </div>
              </td>
              <td>
                <div class="items-cell">
                  <span v-for="(item, i) in order.items.slice(0, 2)" :key="i" class="item-tag">
                    {{ item.title }} × {{ item.quantity }}
                  </span>
                  <span v-if="order.items.length > 2" class="item-more">
                    +{{ order.items.length - 2 }} dalších
                  </span>
                </div>
              </td>
              <td class="font-semibold">{{ order.totalPrice.toLocaleString('cs-CZ') }} Kč</td>
              <td>
                <span :class="['badge', paymentClass(order.paymentStatus)]">
                  {{ paymentLabels[order.paymentStatus] || order.paymentStatus }}
                </span>
              </td>
              <td>
                <span :class="['badge', statusClass(order.status)]">
                  {{ statusLabel(order.status) }}
                </span>
              </td>
              <td class="text-sm text-gray-400">
                {{ new Date(order.createdAt).toLocaleDateString('cs-CZ') }}
              </td>
              <td>
                <div class="actions-cell">
                  <button class="action-btn detail-btn" @click="selectedOrder = order" title="Detail">
                    <Icon icon="lucide:eye" height="16" />
                  </button>
                  <select
                    :value="order.status"
                    @change="changeStatus(order.id, ($event.target as HTMLSelectElement).value)"
                    class="status-select"
                    :disabled="updatingId === order.id"
                  >
                    <option v-for="s in allStatuses" :key="s.value" :value="s.value">{{ s.label }}</option>
                  </select>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="selectedOrder" class="modal-overlay" @click.self="selectedOrder = null">
          <div class="modal-content modal-lg">
            <div class="modal-header">
              <h3 class="modal-title">
                Objednávka #{{ selectedOrder.id }}
              </h3>
              <button @click="selectedOrder = null" class="modal-close">
                <Icon icon="lucide:x" height="20" />
              </button>
            </div>

            <div class="modal-body">
              <!-- Customer info -->
              <div class="detail-section">
                <h4 class="detail-section-title">
                  <Icon icon="lucide:user" height="16" />
                  Zákazník
                </h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">Jméno</span>
                    <span class="detail-value">{{ selectedOrder.customerName }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">{{ selectedOrder.customerEmail }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Adresa</span>
                    <span class="detail-value">{{ selectedOrder.shippingAddress }}</span>
                  </div>
                </div>
              </div>

              <!-- Items -->
              <div class="detail-section">
                <h4 class="detail-section-title">
                  <Icon icon="lucide:package" height="16" />
                  Položky
                </h4>
                <div class="order-items-list">
                  <div v-for="item in selectedOrder.items" :key="item.productId" class="order-item">
                    <div class="order-item-thumb">
                      <img :src="`/${item.image}`" :alt="item.title" />
                    </div>
                    <div class="order-item-info">
                      <span class="order-item-name">{{ item.title }}</span>
                      <span class="order-item-qty">× {{ item.quantity }}</span>
                    </div>
                    <span class="order-item-price">{{ (item.price * item.quantity).toLocaleString('cs-CZ') }} Kč</span>
                  </div>
                </div>
              </div>

              <!-- Summary -->
              <div class="detail-section summary-section">
                <div class="summary-row">
                  <span>Celkem</span>
                  <span class="summary-total">{{ selectedOrder.totalPrice.toLocaleString('cs-CZ') }} Kč</span>
                </div>
                <div class="summary-row">
                  <span>Stav</span>
                  <span :class="['badge', statusClass(selectedOrder.status)]">{{ statusLabel(selectedOrder.status) }}</span>
                </div>
                <div class="summary-row">
                  <span>Platba</span>
                  <span :class="['badge', paymentClass(selectedOrder.paymentStatus)]">{{ paymentLabels[selectedOrder.paymentStatus] }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
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

.search-input:focus { border-color: #6dc995; }

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

.customer-cell { display: flex; flex-direction: column; }
.customer-name { font-weight: 500; color: #e2e8f0; }
.customer-email { font-size: 0.8rem; color: #64748b; }

.items-cell { display: flex; flex-wrap: wrap; gap: 0.35rem; }

.item-tag {
  display: inline-flex;
  padding: 0.15rem 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #94a3b8;
}

.item-more {
  font-size: 0.75rem;
  color: #64748b;
  font-style: italic;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-success { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.badge-info { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
.badge-primary { background: rgba(139, 92, 246, 0.15); color: #a78bfa; }
.badge-warning { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.badge-danger { background: rgba(239, 68, 68, 0.15); color: #f87171; }

.actions-cell {
  display: flex;
  gap: 0.5rem;
  align-items: center;
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

.detail-btn {
  background: rgba(139, 92, 246, 0.1);
  color: #a78bfa;
}

.detail-btn:hover {
  background: rgba(139, 92, 246, 0.2);
}

.status-select {
  padding: 0.3rem 0.5rem;
  background: #161822;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.375rem;
  color: #cbd5e1;
  font-size: 0.75rem;
  outline: none;
  cursor: pointer;
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
  background: #1e2030;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.75rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-lg { max-width: 620px; }

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  position: sticky;
  top: 0;
  background: #1e2030;
  z-index: 1;
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

.modal-body { padding: 1.5rem; }

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.detail-grid {
  display: grid;
  gap: 0.625rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.detail-label {
  font-size: 0.75rem;
  color: #64748b;
}

.detail-value {
  color: #e2e8f0;
  font-size: 0.9rem;
}

.order-items-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 0.5rem;
}

.order-item-thumb {
  width: 36px;
  height: 36px;
  border-radius: 0.25rem;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05);
}

.order-item-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.order-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.order-item-name {
  font-size: 0.875rem;
  color: #e2e8f0;
  font-weight: 500;
}

.order-item-qty {
  font-size: 0.8rem;
  color: #64748b;
}

.order-item-price {
  font-size: 0.875rem;
  font-weight: 600;
  color: #34d399;
}

.summary-section {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 0.5rem;
  padding: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

.summary-total {
  font-size: 1.15rem;
  font-weight: 700;
  color: #34d399;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
