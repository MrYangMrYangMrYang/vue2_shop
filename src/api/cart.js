/**
 * Cart API - 购物车相关接口模块
 */
import request from '@/utils/request'

/**
 * 加入购物车
 * @param {number} goodsId 商品ID
 * @param {number} goodsNum 商品数量
 * @param {number} goodsSkuId 商品规格ID
 * @returns {Promise}
 */
export const addCart = (goodsId, goodsNum, goodsSkuId) => {
  return request.post('/cart/add', {
    goodsId,
    goodsNum,
    goodsSkuId
  })
}

/**
 * 获取购物车列表
 * @returns {Promise} 包含购物车商品列表数据
 */
export const getCartList = () => {
  return request.get('/cart/list')
}

/**
 * 更新购物车商品数量
 * @param {number} goodsId 商品ID
 * @param {number} goodsNum 更新后的商品数量
 * @param {number} goodsSkuId 商品规格ID
 * @returns {Promise}
 */
export const changeCount = (goodsId, goodsNum, goodsSkuId) => {
  return request.post('/cart/update', {
    goodsId,
    goodsNum,
    goodsSkuId
  })
}

/**
 * 删除购物车选中的商品
 * @param {Array} cartIds 购物车项 ID 数组
 * @returns {Promise}
 */
export const delSelect = (cartIds) => {
  return request.post('/cart/clear', {
    cartIds
  })
}
