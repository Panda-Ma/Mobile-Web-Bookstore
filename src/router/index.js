import { createRouter, createWebHistory } from 'vue-router'
const ebook=()=>import ('../views/ebook')

const routes = [
  {
    path: '/',
   redirect:'/ebook'
  },
  {
    path:'/ebook',
    component:  ebook,
    children:[
      {
        path:':fileName',
        component:()=>import('../components/ebook/EBookReader')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
