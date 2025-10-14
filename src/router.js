import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home_pag.vue'
import Shop from './pages/Shop_pag.vue'
import About from './pages/About_pag.vue'
import Cart from './pages/Cart_pag.vue'
import Faq from './pages/SFAQ_pag.vue'
import Contact from './pages/Contact_pag.vue'
import TestCart from './pages/TestCart_pag.vue'
import PaymentSuccess from './pages/PaymentSuccess_pag.vue'
import StripeDebug from './pages/StripeDebug_pag.vue'
import ProductDetail from './pages/ProductDetail_pag.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/shop', component: Shop },
  { path: '/product/:slug', component: ProductDetail, name: 'product' },
  { path: '/about', component: About },
  { path: '/cart', component: Cart },
  { path: '/sfaq', component: Faq },
  { path: '/contact', component: Contact },
  { path: '/test-cart', component: TestCart },
  { path: '/success', component: PaymentSuccess },
  { path: '/debug', component: StripeDebug },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
