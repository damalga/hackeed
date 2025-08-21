import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home_pag.vue'
import Shop from './pages/Shop_pag.vue'
import About from './pages/About_pag.vue'
import Account from './pages/Account_pag.vue'
import Cart from './pages/Cart_pag.vue'
import Faq from './pages/FAQ_pag.vue'
import Contact from './pages/Contact_pag.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/shop', component: Shop },
  { path: '/about', component: About },
  { path: '/account', component: Account },
  { path: '/cart', component: Cart },
  { path: '/faq', component: Faq },
  { path: '/contact', component: Contact },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
