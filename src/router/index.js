import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

import Layout from '@/views/layout'
import Home from '@/views/layout/home'
import Category from '@/views/layout/category'
import Cart from '@/views/layout/cart'
import User from '@/views/layout/user'

// 不常用的组件异步加载
const Login = () => import('@/views/login')
const Order = () => import('@/views/order')
const Pay = () => import('@/views/pay')
const Prodetail = () => import('@/views/prodetail')
const Search = () => import('@/views/search/index')
const SearchList = () => import('@/views/search/list')

Vue.use(VueRouter)

const router = new VueRouter({
  // 路由模式
  mode: 'history', //  'history'模式
  // 路由规则
  routes: [
    { path: '/login', component: Login },
    // 首页嵌套二级路由
    {
      path: '/',
      component: Layout,
      redirect: '/home',
      children: [
        { path: '/home', component: Home },
        { path: '/category', component: Category },
        { path: '/cart', component: Cart },
        { path: '/user', component: User }
      ]
    },
    { path: '/order', component: Order },
    { path: '/pay', component: Pay },
    // 动态路由传参，确认将来是哪个商品，路由参数中携带id
    { path: '/prodetail/:id', component: Prodetail },
    { path: '/search', component: Search },
    { path: '/searchlist', component: SearchList }
  ]
})

// 配置全局前置导航守卫
// 所有的路由在真正被访问到之前(在组件页面渲染之前)，都会先经过全局前置守卫
// 只有全局前置守卫放行了，才会到达对应的界面

// to: 到哪里去，到哪去的完整路由信息对象(路径，参数)
// from: 从哪里来，从哪来的完整路由信息对象(路径，参数)
// next(): 是否放行
// (1)next()      直接放行，方形到to要去的路径
// (2)next(路径)  进行拦截，拦截到next里面配置的路径

// 首先定义一个数组，专门用户存放所有需要权限访问的页面路径
const authUrls = ['/pay', '/order']

router.beforeEach((to, from, next) => {
  // console.log(to, from, next)
  // 看 to.path 是否在 authUrls 中出现过
  if (!authUrls.includes(to.path)) {
    // 非权限页面直接放行
    next()
    return
  }

  // 是权限页面则需要判断是否有登录token
  const token = store.getters.token
  // console.log(token)
  if (token) {
    next()
  } else {
    next('/login')
  }
})

export default router
