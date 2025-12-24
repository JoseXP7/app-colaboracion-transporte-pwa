import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/userStore'
import { ceGuard } from './guards/ce.guard'

const isAuth = async (to, from, next) => {
  const { getSession } = useAuth()
  const userStore = useUserStore()

  const session = await getSession()

  if (!session) {
    return next({ name: 'login' })
  }

  let userProfile = userStore.profile

  if (!userProfile) {
    userProfile = await userStore.getProfile()
  }

  if (!userProfile && to.name !== 'complete-profile') {
    return next({ name: 'complete-profile' })
  }

  next()
}

const isLoginAuth = async (to, from, next) => {
  const { getSession } = useAuth()
  const session = await getSession()
  if (session) {
    next({ name: 'resume' })
  } else {
    next()
  }
}

const isCreateProfile = async (to, from, next) => {
  const { getSession } = useAuth()
  const userStore = useUserStore()
  const session = await getSession()
  if (!session) {
    next({ name: 'login' })
    return
  }
  userStore.setUser(session.user)
  let userProfile = userStore.profile
  if (!userProfile) {
    try {
      userProfile = await userStore.getProfile()
    } catch (error) {
      userProfile = null
    }
  }
  // Si ya tiene perfil, redirige a /resume
  if (userProfile) {
    next({ name: 'resume' })
  }
  next()
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LandingView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/LoginView.vue'),
      beforeEnter: isLoginAuth,
    },
    {
      path: '/register',
      name: 'register',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/RegisterView.vue'),
      beforeEnter: isLoginAuth,
    },
    {
      path: '/complete-profile',
      name: 'complete-profile',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/CompleteProfileView.vue'),
      beforeEnter: isCreateProfile,
    },
    {
      path: '/resume',
      name: 'resume',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/HomeView.vue'),
      beforeEnter: isAuth,
    },
    {
      path: '/topup-request',
      name: 'topup-request',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/TopUpView.vue'),
      beforeEnter: isAuth,
    },
    {
      path: '/scan-qr',
      name: 'scan-qr',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/ScanQRView.vue'),
      beforeEnter: isAuth,
    },
    {
      path: '/transactions',
      name: 'transactions',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/TransactionsView.vue'),
      beforeEnter: isAuth,
    },
    {
      path: '/profile',
      name: 'profile',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/ProfileView.vue'),
      beforeEnter: isAuth,
    },
    {
      path: '/ce',
      component: () => import('../layouts/admin_dashboard_base.vue'),
      beforeEnter: ceGuard,
      children: [
        {
          path: '',
          name: 'ce-dashboard',
          component: () => import('../views/admin/ResumeView.vue'),
        },
        {
          path: 'topups-requests',
          name: 'ce-topups',
          component: () => import('../views/admin/TopupsRequestsView.vue'),
        },
        {
          path: 'statistics',
          name: 'ce-statistics',
          component: () => import('../views/admin/StatisticView.vue'),
        },
        {
          path: 'payment-info',
          name: 'ce-payment-info',
          component: () => import('../views/admin/PaymentInfoView.vue'),
        },
        {
          path: 'qr',
          children: [
            {
              path: 'generate',
              name: 'ce-qr-generate',
              component: () => import('../views/admin/GenerateQRView.vue'),
            },
            {
              path: 'list',
              name: 'ce-qr-list',
              component: () => import('../views/admin/ListQRView.vue'),
            },
          ],
        },
      ],
    },
  ],
})

export default router
