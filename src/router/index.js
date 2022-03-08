import { createRouter, createWebHistory } from 'vue-router'
const ebook=()=>import ('../views/ebook')

const routes = [
  {
    path: '/',
   redirect:'/bookstore'
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
  },
  {
    path:'/bookstore',
    component:()=>import('@/views/bookstore'),
    redirect: '/bookstore/home',
    children:[
      {
        path:'home',
        component:()=>import('@/views/bookstore/StoreHome')

      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
