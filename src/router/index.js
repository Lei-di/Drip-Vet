import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { user } from 'src/composables/UseAuthUser'

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Guard de rota para proteger rotas que requerem autenticação
  Router.beforeEach((to, from, next) => {
    // Verifica se a rota requer autenticação
    if (to.matched.some(record => record.meta.requiresAuth)) {
      // Verifica se o usuário está autenticado
      if (!user.value) {
        // Redireciona para login se não estiver autenticado
        next({ name: 'login' })
      } else {
        next()
      }
    } else {
      // Se a rota não requer autenticação, permite acesso
      next()
    }
  })

  return Router
})
