/**
 * 订单状态常量定义
 */

// 订单支付状态
export const PAY_STATUS_PENDING = 10 // 待支付
export const PAY_STATUS_SUCCESS = 20 // 已支付

// 订单状态
export const ORDER_STATUS_NORMAL = 10 // 进行中
export const ORDER_STATUS_CANCEL = 20 // 已取消
export const ORDER_STATUS_FINISH = 30 // 已完成

// 配送状态
export const DELIVERY_STATUS_PENDING = 10 // 待发货
export const DELIVERY_STATUS_SHIPPED = 20 // 已发货
export const DELIVERY_STATUS_RECEIVED = 30 // 已收货

// 售后状态
export const REFUND_STATUS_NONE = 0 // 无售后
export const REFUND_STATUS_APPLY = 10 // 售后中
export const REFUND_STATUS_FINISH = 20 // 售后完成

// 订单状态文本映射
export const ORDER_STATUS_TEXT = {
  [ORDER_STATUS_NORMAL]: '进行中',
  [ORDER_STATUS_CANCEL]: '已取消',
  [ORDER_STATUS_FINISH]: '已完成'
}
