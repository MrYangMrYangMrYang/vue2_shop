import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/utils/vant-ui'
import '@/styles/common.less'

// // 全局导入vant
// import Vant from 'vant'
// import 'vant/lib/index.css'
// // 插件安装初始化:内部会将所有的vant所有组件进行导入注册
// Vue.use(Vant)

// 关闭生产环境下的控制台提示信息，Vue3移除了这个配置选项，类似的提示行为由构建工具处理
// 简单来说：这行代码就是让 Vue 在浏览器控制台里保持安静，不要输出环境提示信息，让控制台输出更加干净简洁
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
