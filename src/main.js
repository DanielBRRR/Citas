import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Import de Splide.js para Vue
import { Splide } from '@splidejs/vue-splide'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Splide)


app.mount('#app')
