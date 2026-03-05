<script setup lang="ts">
import { Icon } from '@iconify/vue'

definePageMeta({
  layout: 'admin'
})

const { data: customers, pending } = await useFetch<any[]>('/api/admin/customers')

const searchQuery = ref('')

const filteredCustomers = computed(() => {
  if (!customers.value) return []
  if (!searchQuery.value) return customers.value
  const q = searchQuery.value.toLowerCase()
  return customers.value.filter((c: any) =>
    c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  )
})

const totalRevenue = computed(() => {
  if (!customers.value) return 0
  return customers.value.reduce((sum: number, c: any) => sum + c.totalSpent, 0)
})
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Zákazníci</h1>
        <p class="page-subtitle">Přehled zákaznické základny</p>
      </div>
    </div>

    <!-- Summary stats -->
    <div class="customer-stats" v-if="!pending && customers">
      <div class="mini-stat">
        <Icon icon="lucide:users" height="20" class="text-blue-400" />
        <div>
          <span class="mini-stat-value">{{ customers.length }}</span>
          <span class="mini-stat-label">Celkem zákazníků</span>
        </div>
      </div>
      <div class="mini-stat">
        <Icon icon="lucide:banknote" height="20" class="text-emerald-400" />
        <div>
          <span class="mini-stat-value">{{ totalRevenue.toLocaleString('cs-CZ') }} Kč</span>
          <span class="mini-stat-label">Celková útrata</span>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="filters-row">
      <div class="search-box">
        <Icon icon="lucide:search" height="18" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Hledat dle jména nebo emailu..."
          class="search-input"
        />
      </div>
    </div>

    <div v-if="pending" class="text-center py-12 text-gray-400">
      <Icon icon="lucide:loader-2" height="32" class="animate-spin mx-auto mb-3" />
      Načítání...
    </div>

    <div v-else class="admin-card">
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Zákazník</th>
              <th>Email</th>
              <th>Objednávky</th>
              <th>Celková útrata</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in filteredCustomers" :key="customer.email">
              <td>
                <div class="customer-cell">
                  <div class="customer-avatar">
                    {{ customer.name.charAt(0).toUpperCase() }}
                  </div>
                  <span class="customer-name">{{ customer.name }}</span>
                </div>
              </td>
              <td class="text-gray-400">{{ customer.email }}</td>
              <td>
                <span class="orders-badge">{{ customer.orders }}</span>
              </td>
              <td class="font-semibold">
                <span :class="customer.totalSpent > 0 ? 'text-emerald-400' : 'text-gray-500'">
                  {{ customer.totalSpent.toLocaleString('cs-CZ') }} Kč
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
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

.customer-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.mini-stat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: #1e2030;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.75rem;
}

.mini-stat-value {
  display: block;
  font-size: 1.1rem;
  font-weight: 700;
  color: #f1f5f9;
}

.mini-stat-label {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
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

.customer-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.customer-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6dc995, #3a91aa);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  color: #0f1117;
  flex-shrink: 0;
}

.customer-name {
  font-weight: 500;
  color: #e2e8f0;
}

.orders-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  font-size: 0.8rem;
  font-weight: 600;
}

.text-emerald-400 { color: #34d399; }
.text-blue-400 { color: #60a5fa; }
.text-gray-500 { color: #6b7280; }
</style>
