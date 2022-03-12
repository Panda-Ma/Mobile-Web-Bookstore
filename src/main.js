import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from "@/lang";
//因为不能使用blob类型，所以不使用mock
// import './mock'
//css只能在js中引入
import './assets/styles/icon.css'
import './assets/styles/global.scss'

createApp(App).use(store).use(router).use(i18n).mount('#app')
