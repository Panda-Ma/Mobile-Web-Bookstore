import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/style/icon.css'
import './assets/font/daysOne.css'
import './assets/style/global.scss'

createApp(App).use(store).use(router).mount('#app')
