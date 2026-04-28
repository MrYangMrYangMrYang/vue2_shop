/**
 * User API - 用户个人中心相关接口模块
 */
import request from '@/utils/request'

/**
 * 获取当前登录用户的个人信息详情
 * @returns {Promise} 包含头像、昵称、余额、积分等数据
 */
export const getUserInfoDetail = () => {
  return request.get('/user/info')
}

/**
 * 修改个人信息
 * @param {Object} data 需要修改的用户信息字段
 * @returns {Promise}
 */
export const updateUserInfo = (data) => {
  return request.post('/user/info', data)
}
