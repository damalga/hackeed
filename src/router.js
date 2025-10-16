import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home_pag.vue'
import Shop from './pages/Shop_pag.vue'
import About from './pages/About_pag.vue'
import Cart from './pages/Cart_pag.vue'
import Faq from './pages/SFAQ_pag.vue'
import Contact from './pages/Contact_pag.vue'
import PaymentSuccess from './pages/PaymentSuccess_pag.vue'
import ProductDetail from './pages/ProductDetail_pag.vue'
import NotFound from './pages/NotFound_pag.vue'
import ServerError from './pages/ServerError_pag.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/shop', component: Shop },
  { path: '/product/:slug', component: ProductDetail, name: 'product' },
  { path: '/about', component: About },
  { path: '/cart', component: Cart },
  { path: '/sfaq', component: Faq },
  { path: '/contact', component: Contact },
  { path: '/success', component: PaymentSuccess },
  { path: '/500', component: ServerError, name: 'server-error' },
  { path: '/:pathMatch(.*)*', component: NotFound, name: 'not-found' },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
