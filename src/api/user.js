import request from '@/utils/request'

// 获取个人信息
export const getUserInfoDetail = () => {
  return request.get('/user/info')
}

// 修改个人信息
export const updateUserInfo = (data) => {
  return request.post('/user/info', data)
}
