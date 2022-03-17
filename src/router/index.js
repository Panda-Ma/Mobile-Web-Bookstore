import { createRouter, createWebHistory } from 'vue-router'
const ebook=()=>import ('../views/ebook')

const routes = [
  {
    path: '/',
   redirect:'/store'
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
    path:'/store',
    component:()=>import('@/views/bookstore'),
    redirect: '/store/home/shelf',
    children:[
      {
        path:'home',
        component:()=>import('@/views/bookstore/StoreHome')
      },
      {
        path:'list',
        component:()=>import('@/views/bookstore/StoreList')
      },
      {
        path: 'detail',
        component:()=>import('@/views/bookstore/StoreDetail')
      },
      {
        path:'shelf',
        component:()=>import('@/views/bookstore/StoreShelf')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
