/**
 * Order Module - Vuex 订单状态管理模块
 * 核心功能：
 * 1. 存储当前查看的订单详情数据 (currentOrder)
 * 2. 提供订单数据的设置和清除方法
 */
export default {
  namespaced: true,
  state () {
    return {
      currentOrder: {} // 当前查看的订单详情
    }
  },
  mutations: {
    /**
     * 设置当前订单详情
     * @param {Object} state
     * @param {Object} orderData 订单完整数据对象
     */
    setCurrentOrder (state, orderData) {
      state.currentOrder = orderData || {}
    },
    /**
     * 清除当前订单详情（离开页面时调用）
     * @param {Object} state
     */
    clearCurrentOrder (state) {
      state.currentOrder = {}
    }
  },
  getters: {
    /**
     * 获取当前订单详情
     * @param {Object} state
     * @returns {Object} 当前订单数据
     */
    currentOrder (state) {
      return state.currentOrder
    }
  }
}
