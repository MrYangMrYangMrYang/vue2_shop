/**
 * Order API - 订单相关接口模块
 */
import request from '@/utils/request'

/**
 * 订单结算确认 (获取结算页详情)
 * @param {string} mode 结算模式: 'cart' (购物车) 或 'buyNow' (立即购买)
 * @param {Object} obj 包含 cartIds 或 goodsId/goodsNum/goodsSkuId
 * @returns {Promise} 包含商品信息、地址、优惠券等结算数据
 */
export const checkOrder = (mode, obj) => {
  return request.get('/checkout/order', {
    params: {
      mode, // cart buyNow
      delivery: 10, // 10 快递配送 20 门店自提
      couponId: 0, // 优惠券ID 传0 不使用优惠券
      isUsePoints: 0, // 积分 传0 不使用积分
      ...obj // 动态展开传递的参数
    }
  })
}

/**
 * 提交订单
 * @param {string} mode 结算模式: 'cart' 或 'buyNow'
 * @param {Object} obj 包含结算所需参数 (cartIds/remark 等)
 * @returns {Promise} 包含订单 ID 和支付信息
 */
export const submitOrder = (mode, obj) => {
  return request.post('/checkout/submit', {
    mode,
    delivery: 10, // 10 快递配送
    couponId: 0,
    isUsePoints: 0,
    payType: 10, // 余额支付
    ...obj
  })
}

/**
 * 获取我的订单列表
 * @param {string} dataType 订单类型: all, payment, delivery, received, comment
 * @param {number} page 当前页码
 * @returns {Promise} 包含订单列表分页数据
 */
export const getMyOrderList = (dataType, page) => {
  return request.get('/order/list', {
    params: {
      dataType,
      page
    }
  })
}

/**
 * 取消订单
 * @param {number} orderId 订单 ID
 * @returns {Promise}
 */
export const cancelOrder = (orderId) => {
  return request.post('/order/cancel', { orderId })
}
