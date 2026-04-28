/**
 * Storage Utility - 本地存储封装模块
 * 核心功能：
 * 1. 统一管理本地存储的键名 (Keys)
 * 2. 提供个人信息 (Token/UserInfo) 的持久化方法
 * 3. 提供搜索历史记录的持久化方法
 */

// 约定统一的通用键名
const INFO_KEY = 'yg_shopping_info'
const HISTORY_KEY = 'yg_history_key'

/**
 * 获取个人信息 (Token & UserInfo)
 * @returns {Object} 包含 token 和 userInfo 的对象
 */
export const getInfo = () => {
  const defaultObj = { token: '', userInfo: '' }
  const result = localStorage.getItem(INFO_KEY)
  return result ? JSON.parse(result) : defaultObj
}

/**
 * 设置并持久化个人信息
 * @param {Object} obj 用户信息对象
 */
export const setInfo = (obj) => {
  localStorage.setItem(INFO_KEY, JSON.stringify(obj))
}

/**
 * 移除本地存储的个人信息 (用于退出登录)
 */
export const removeInfo = () => {
  localStorage.removeItem(INFO_KEY)
}

/**
 * 获取本地存储的搜索历史记录
 * @returns {Array} 历史记录数组
 */
export const getHistoryList = () => {
  const result = localStorage.getItem(HISTORY_KEY)
  return result ? JSON.parse(result) : []
}

/**
 * 设置并持久化搜索历史记录
 * @param {Array} arr 历史记录数组
 */
export const setHistoryList = (arr) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(arr))
}
