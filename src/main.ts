import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import authService from './services/auth.service'
import { createPinia } from 'pinia'


const app = createApp(App)

app.use(router)
app.use(createPinia())
authService.setupAxiosInterceptors()
app.mount('#app')
