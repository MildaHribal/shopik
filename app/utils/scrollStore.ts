// Shared per-path scroll memory. Vue Router's own savedPosition proved
// unreliable with the page fade (it captured a stale offset), so we record the
// real window scroll ourselves at navigation-start and restore from here.
export const scrollPositions = new Map<string, number>()
