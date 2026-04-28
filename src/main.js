/**
 * Entry File - Vue 项目入口文件
 * 核心逻辑：
 * 1. 挂载 Vue 根实例到 #app 节点
 * 2. 注入全局插件：VueRouter (路由), Vuex (状态管理)
 * 3. 引入全局样式、UI 组件库 (Vant) 的按需导入配置
 */
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/utils/vant-ui' // 引入 Vant 按需注册逻辑
import '@/styles/common.less' // 引入全局基础样式

// // 全局导入vant
// import Vant from 'vant'
// import 'vant/lib/index.css'
// // 插件安装初始化:内部会将所有的vant所有组件进行导入注册
// Vue.use(Vant)

// 生产环境提示配置
// 作用：关闭开发环境下的性能追踪、警告提示等，使控制台输出更纯净
Vue.config.productionTip = false

/**
 * 实例化 Vue 对象
 */
new Vue({
  router, // 注入路由
  store, // 注入 Vuex
  render: h => h(App) // 渲染根组件
}).$mount('#app')
