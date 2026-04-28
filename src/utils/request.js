/**
 * Request Utility - 基于 Axios 封装的网络请求模块
 * 核心功能：
 * 1. 设置接口基础路径 (BaseURL) 和 超时时间
 * 2. 请求拦截器：自动展示加载提示、全局携带 Token
 * 3. 响应拦截器：统一处理业务状态码、清除加载提示、全局错误提示、401 自动跳转处理
 */
import axios from 'axios'
import { Toast } from 'vant'
import store from '@/store'

// 创建 axios 实例
const instance = axios.create({
  baseURL: 'http://smart-shop.itheima.net/index.php?s=/api',
  timeout: 3000
})

/**
 * 请求拦截器
 */
instance.interceptors.request.use(function (config) {
  // 1. 全局展示加载中状态
  Toast.loading({
    message: '加载中...',
    forbidClick: true, // 防止多次点击
    loadingType: 'spinner',
    duration: 0 // 持续展示，直到手动关闭
  })

  // 2. 自动携带 Token
  const token = store.getters.token
  if (token) {
    config.headers['Access-Token'] = token
    config.headers.platform = 'H5'
  }

  return config
}, function (error) {
  return Promise.reject(error)
})

/**
 * 响应拦截器
 */
instance.interceptors.response.use(function (response) {
  // 1. 解构业务数据
  const res = response.data

  // 2. 统一处理非 200 的业务逻辑错误
  if (res.status !== 200) {
    Toast(res.message || '业务逻辑错误')
    return Promise.reject(res.message)
  } else {
    // 3. 正确返回，清除加载状态
    Toast.clear()
  }
  return res
}, function (error) {
  // 4. 处理 HTTP 状态码错误
  Toast.clear()
  if (!error.response) {
    Toast('网络异常，请检查网络连接')
    return Promise.reject(error)
  }

  const { status } = error.response
  switch (status) {
    case 401:
      Toast('登录已过期，请重新登录')
      // 触发登出操作：清除本地缓存并重置状态
      store.commit('user/setUserInfo', {})
      break
    case 500:
      Toast('服务器内部错误')
      break
    default:
      Toast(error.message || '系统繁忙，请稍后再试')
  }

  return Promise.reject(error)
})

export default instance
