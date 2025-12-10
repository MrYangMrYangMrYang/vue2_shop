// 封装一个存储模块

// 先约定统一的通用键名
const INFO_KEY = 'yg_shopping_info'
const HISTORY_KEY = 'yg_history_key'

// 获取个人信息
export const getInfo = () => {
  // 定义一个取不到值时的默认值
  const defaultObj = { token: '', userInfo: '' }
  const result = localStorage.getItem(INFO_KEY)
  return result ? JSON.parse(result) : defaultObj
}
// 设置个人信息
export const setInfo = (obj) => {
  localStorage.setItem(INFO_KEY, JSON.stringify(obj))
}
// 移除个人信息
export const removeInfo = () => {
  localStorage.removeItem(INFO_KEY)
}

// 获取商品搜索历史
export const getHistoryList = () => {
  const result = localStorage.getItem(HISTORY_KEY)
  return result ? JSON.parse(result) : []
}
// 设置商品搜索历史
export const setHistoryList = (arr) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(arr))
}
