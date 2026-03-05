<script setup lang="ts">
import { Icon } from '@iconify/vue'

definePageMeta({
  layout: 'admin'
})

const { data: stats, pending } = await useFetch('/api/admin/stats')

const statCards = computed(() => {
  if (!stats.value) return []
  return [
    {
      label: 'Celkový příjem',
      value: `${stats.value.totalRevenue?.toLocaleString('cs-CZ')} Kč`,
      icon: 'lucide:banknote',
      color: 'emerald',
      bgClass: 'stat-card-green'
    },
    {
      label: 'Objednávky',
      value: stats.value.totalOrders,
      icon: 'lucide:shopping-cart',
      color: 'blue',
      bgClass: 'stat-card-blue'
    },
    {
      label: 'Produkty',
      value: stats.value.totalProducts,
      icon: 'lucide:package',
      color: 'purple',
      bgClass: 'stat-card-purple'
    },
    {
      label: 'Zákazníci',
      value: stats.value.totalCustomers,
      icon: 'lucide:users',
      color: 'amber',
      bgClass: 'stat-card-amber'
    },
    {
      label: 'Čekající',
      value: stats.value.pendingOrders,
      icon: 'lucide:clock',
      color: 'orange',
      bgClass: 'stat-card-orange'
    },
    {
      label: 'Nízké zásoby',
      value: stats.value.lowStockProducts,
      icon: 'lucide:alert-triangle',
      color: 'red',
      bgClass: 'stat-card-red'
    }
  ]
})

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: 'Čekající',
    paid: 'Zaplaceno',
    shipped: 'Odesláno',
    delivered: 'Doručeno',
    cancelled: 'Zrušeno'
  }
  return map[status] || status
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
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Přehled vašeho obchodu</p>
    </div>

    <div v-if="pending" class="text-center py-12 text-gray-400">
      <Icon icon="lucide:loader-2" height="32" class="animate-spin mx-auto mb-3" />
      Načítání...
    </div>

    <template v-else-if="stats">
      <!-- Stat Cards -->
      <div class="stats-grid">
        <div v-for="card in statCards" :key="card.label" :class="['stat-card', card.bgClass]">
          <div class="stat-icon-wrap">
            <Icon :icon="card.icon" height="24" />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ card.value }}</span>
            <span class="stat-label">{{ card.label }}</span>
          </div>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="admin-card mt-8">
        <div class="card-header">
          <h2 class="card-title">
            <Icon icon="lucide:clock" height="20" />
            Poslední objednávky
          </h2>
          <NuxtLink to="/admin/orders" class="card-link">
            Zobrazit vše
            <Icon icon="lucide:arrow-right" height="16" />
          </NuxtLink>
        </div>
        <div class="table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Zákazník</th>
                <th>Položky</th>
                <th>Cena</th>
                <th>Stav</th>
                <th>Datum</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in stats.recentOrders" :key="order.id">
                <td class="font-mono text-sm">#{{ order.id }}</td>
                <td>
                  <div class="customer-cell">
                    <span class="customer-name">{{ order.customerName }}</span>
                    <span class="customer-email">{{ order.customerEmail }}</span>
                  </div>
                </td>
                <td>{{ (order.items?.length ?? 0) }} položek</td>
                <td class="font-semibold">{{ order.totalPrice.toLocaleString('cs-CZ') }} Kč</td>
                <td>
                  <span :class="['badge', statusClass(order.status)]">
                    {{ statusLabel(order.status) }}
                  </span>
                </td>
                <td class="text-sm text-gray-400">
                  {{ order.createdAt ? new Date(order.createdAt).toLocaleDateString('cs-CZ') : '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Categories breakdown -->
      <div class="admin-card mt-6">
        <div class="card-header">
          <h2 class="card-title">
            <Icon icon="lucide:folder" height="20" />
            Kategorie produktů
          </h2>
        </div>
        <div class="categories-grid">
          <div
            v-for="(count, category) in stats.categoryCounts"
            :key="String(category)"
            class="category-chip"
          >
            <span class="category-name">{{ category }}</span>
            <span class="category-count">{{ count }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 2rem;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: #1e2030;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card-green .stat-icon-wrap { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.stat-card-blue .stat-icon-wrap { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
.stat-card-purple .stat-icon-wrap { background: rgba(139, 92, 246, 0.15); color: #a78bfa; }
.stat-card-amber .stat-icon-wrap { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.stat-card-orange .stat-icon-wrap { background: rgba(249, 115, 22, 0.15); color: #fb923c; }
.stat-card-red .stat-icon-wrap { background: rgba(239, 68, 68, 0.15); color: #f87171; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.35rem;
  font-weight: 700;
  color: #f1f5f9;
}

.stat-label {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.1rem;
}

.admin-card {
  background: #1e2030;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.75rem;
  overflow: hidden;
}

.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-link {
  font-size: 0.85rem;
  color: #6dc995;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: color 0.2s;
}

.card-link:hover {
  color: #8bdfaf;
}

.table-wrap {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  padding: 0.75rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(0, 0, 0, 0.15);
}

.admin-table td {
  padding: 0.875rem 1.5rem;
  color: #cbd5e1;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.admin-table tbody tr {
  transition: background 0.15s;
}

.admin-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.customer-cell {
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-weight: 500;
  color: #e2e8f0;
}

.customer-email {
  font-size: 0.8rem;
  color: #64748b;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-success { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.badge-info { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
.badge-primary { background: rgba(139, 92, 246, 0.15); color: #a78bfa; }
.badge-warning { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.badge-danger { background: rgba(239, 68, 68, 0.15); color: #f87171; }

.categories-grid {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.category-name {
  font-size: 0.85rem;
  color: #cbd5e1;
}

.category-count {
  font-size: 0.75rem;
  font-weight: 700;
  color: #6dc995;
  background: rgba(109, 201, 149, 0.1);
  padding: 0.1rem 0.45rem;
  border-radius: 9999px;
}
</style>
