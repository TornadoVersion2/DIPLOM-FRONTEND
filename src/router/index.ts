import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'
import ProductsList from '../components/ProductsList.vue'
import AddProduct from '../components/AddProduct.vue'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import Profile from '../components/Profile.vue'
import ProductDetail from '../components/ProductDetail.vue'
import CategoriesList from '../components/CategoriesList.vue'
import Cart from '../components/Cart.vue'
import authService from '../services/auth.service'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/products'
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsList,
    },
    {
      path: '/products/add',
      name: 'add-product',
      component: AddProduct,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true }
    },
    {
      path: '/products/:id',
      name: 'product-detail',
      component: ProductDetail
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoriesList
    },
    {
      path: '/cart',
      name: 'cart',
      component: Cart,
      meta: { requiresAuth: true }
    }
  ],
})

// Навигационный guard для проверки аутентификации
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !authService.isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})

export default router
