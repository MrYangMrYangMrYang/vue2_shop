/**
 * Product Detail API - 商品详情相关接口模块
 */
import request from '@/utils/request'

/**
 * 获取商品详情信息
 * @param {number} goodsId 商品ID
 * @returns {Promise} 包含商品基础信息、SKU、轮播图等
 */
export const getProDetail = (goodsId) => {
  return request.get('/goods/detail', {
    params: {
      goodsId
    }
  })
}

/**
 * 获取商品评价列表
 * @param {number} goodsId 商品ID
 * @param {number} limit 获取评价的数量
 * @returns {Promise} 包含评价列表数据
 */
export const getProComments = (goodsId, limit) => {
  return request.get('/comment/listRows', {
    params: {
      goodsId,
      limit
    }
  })
}
