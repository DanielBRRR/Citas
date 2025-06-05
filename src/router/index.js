import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../components/PAGE/Register.vue'
import LoginView from '../components/PAGE/Login.vue'
import Citas from '../components/PAGE/Citas.vue'
import crearcitas from '../components/PAGE/crearcitas.vue'
import verperfil from '../components/PAGE/Perfil.vue'
import listado from '../components/PAGE/listado.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/citas',
      name: 'citas',
      component: Citas,
    },
    {
      path: '/crearcitas',
      name: 'crearcitas',
      component: crearcitas,
    },
    {
      path: '/verperfil',
      name: 'verperfil',
      component: verperfil,
    },
    {
      path: '/listado',
      name: 'Listado',
      component: listado,
    }
  ],
})

export default router
