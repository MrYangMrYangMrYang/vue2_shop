/**
 * Home API - 首页相关接口模块
 */
import request from '@/utils/request'

/**
 * 获取首页配置及模块数据
 * @returns {Promise} 包含首页轮播图、公告、模块列表等数据
 */
export const getHomeData = () => {
  return request.get('/page/detail', {
    params: {
      pageId: 0
    }
  })
}
