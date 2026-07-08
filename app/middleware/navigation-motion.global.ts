// Page motion is now a single, reliable fade configured globally in nuxt.config
// (`app.pageTransition`). The previous per-route View Transition / slide system
// was removed because it snapshotted loading skeletons and fought with scroll
// restoration, producing janky "blank then pop-in" navigations.
//
// This middleware is intentionally a no-op; it's kept as a global route
// middleware placeholder so the fade defined in nuxt.config drives every route.
export default defineNuxtRouteMiddleware(() => {})
