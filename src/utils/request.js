// 对请求模块进行封装
import axios from 'axios'
import { Toast } from 'vant'
import store from '@/store'

// 创建 axios 实例，将来对创建出来的实例，进行自定义配置
// 好处:不会污染原始的 axios 实例
const instance = axios.create({
  baseURL: 'http://smart-shop.itheima.net/index.php?s=/api',
  timeout: 3000
  // headers: { 'X-Custom-Header': 'foobar' }
})

// 自定义配置 请求、响应、拦截器
// 添加请求拦截器
instance.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  // 使用 Toast.loading 方法展示加载提示
  Toast.loading({
    message: '加载中...',
    forbidClick: true, // 禁用背景点击(节流处理，防止多次无效点击)
    loadingType: 'spinner', // 自定义loading图标
    duration: 0 // 默认是两秒后消失设值为0后就不会自动消失了
  })

  // 只要有token，就在请求时携带，便于请求需要授权的接口
  const token = store.getters.token
  if (token) {
    config.headers['Access-Token'] = token
    config.headers.platform = 'H5'
  }

  return config
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error)
})

// 添加响应拦截器
instance.interceptors.response.use(function (response) {
  // 2xx 范围的状态码都会触发该函数。
  // 对请求结束后的响应数据做点什么
  // console.log(response)
  const res = response.data // 默认axios的返回值会多包装一层data，需要响应拦截器中处理一下
  // 返回结果不是200状态码都会触发该函数。
  if (res.status !== 200) {
    // 给错误提示, Toast 默认是单例模式，后面的 Toast调用了，会将前一个 Toast 效果覆盖
    // 同时只能存在一个 Toast
    Toast(res.message)
    // 抛出一个错误的promise
    return Promise.reject(res.message)
  } else {
    // 正确的情况下直接往下走，顺便掉清除loading效果
    Toast.clear()
  }
  return res
}, function (error) {
  // 超出 2xx 范围的状态码都会触发该函数。
  // 对响应错误做点什么
  return Promise.reject(error)
})

// 导出配置好的实例
export default instance
