import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home_pag.vue'
import Shop from './pages/Shop_pag.vue'
import About from './pages/About_pag.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/shop', component: Shop },
  { path: '/about', component: About },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
