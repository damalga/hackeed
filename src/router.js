import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
import Shop from './pages/Shop.vue'
import About from './pages/About.vue'

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
