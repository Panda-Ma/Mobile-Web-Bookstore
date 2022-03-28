import { createRouter, createWebHashHistory } from 'vue-router'
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
    redirect: '/store/shelf',
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
      },
      {
        path:'category',
        component:()=>import('@/views/bookstore/StoreCategory')
      },
      {
        path:'speaking',
        component:()=>import('@/views/bookstore/StoreSpeaking')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
