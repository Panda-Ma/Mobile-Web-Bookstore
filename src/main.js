import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from "@/lang";
import './mock'
//css只能在js中引入
import './assets/styles/icon.css'
import './assets/styles/global.scss'

createApp(App).use(store).use(router).use(i18n).mount('#app')
