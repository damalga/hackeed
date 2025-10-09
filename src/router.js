import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home_pag.vue'
import Shop from './pages/Shop_pag.vue'
import About from './pages/About_pag.vue'
import Cart from './pages/Cart_pag.vue'
import Faq from './pages/SFAQ_pag.vue'
import Contact from './pages/Contact_pag.vue'
import PaymentSuccess from './pages/PaymentSuccess_pag.vue'

// ==========================================
// RUTAS BASE (siempre disponibles)
// ==========================================
const routes = [
  { path: '/', component: Home },
  { path: '/shop', component: Shop },
  { path: '/about', component: About },
  { path: '/cart', component: Cart },
  { path: '/sfaq', component: Faq },
  { path: '/contact', component: Contact },
  { path: '/success', component: PaymentSuccess },
]

// ==========================================
// RUTAS DE DEBUG (solo en desarrollo)
// ==========================================
// Estas rutas se añaden SOLO si VITE_DEBUG_MODE=true
// Útil para testing sin exponerlas en staging/producción

const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true'

if (isDebugMode) {
  console.log('🔧 Modo DEBUG activado - Rutas de desarrollo disponibles')

  // Importaciones lazy de componentes de debug (solo se cargan si se necesitan)
  const TestCart = () => import('./pages/TestCart_pag.vue')
  const StripeDebug = () => import('./pages/StripeDebug_pag.vue')

  routes.push(
    { path: '/test-cart', component: TestCart, name: 'TestCart' },
    { path: '/debug', component: StripeDebug, name: 'StripeDebug' },
  )
} else {
  console.log('🔒 Modo PRODUCCIÓN - Rutas de debug deshabilitadas')
}

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
