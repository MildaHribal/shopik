<script setup lang="ts">
import { Icon } from '@iconify/vue'

const route = useRoute()

const navItems = [
  { label: 'Dashboard', icon: 'lucide:layout-dashboard', to: '/admin' },
  { label: 'Produkty', icon: 'lucide:package', to: '/admin/products' },
  { label: 'Objednávky', icon: 'lucide:shopping-cart', to: '/admin/orders' },
  { label: 'Zákazníci', icon: 'lucide:users', to: '/admin/customers' },
]

const isActive = (path: string) => {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <NuxtLink to="/admin" class="sidebar-logo">
          <Icon icon="lucide:shield" height="28" class="text-primary-400" />
          <span class="logo-text">Shopik Admin</span>
        </NuxtLink>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="['nav-item', { active: isActive(item.to) }]"
        >
          <Icon :icon="item.icon" height="20" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <NuxtLink to="/" class="nav-item back-link">
          <Icon icon="lucide:arrow-left" height="20" />
          <span>Zpět na obchod</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Main content -->
    <main class="admin-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #0f1117;
}

.admin-sidebar {
  width: 260px;
  background: #161822;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 40;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #e2e8f0;
  letter-spacing: -0.02em;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-item:hover {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  color: #6dc995;
  background: rgba(109, 201, 149, 0.1);
}

.sidebar-footer {
  padding: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.back-link {
  color: #64748b !important;
}

.back-link:hover {
  color: #94a3b8 !important;
}

.admin-main {
  flex: 1;
  margin-left: 260px;
  padding: 2rem;
  min-height: 100vh;
}
</style>
