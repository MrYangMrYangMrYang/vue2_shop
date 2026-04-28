/**
 * Cart Module - Vuex 购物车状态管理模块
 * 核心功能：
 * 1. 存储并维护购物车列表数据 (cartList)
 * 2. 处理复选框的单选、全选逻辑
 * 3. 封装购物车数据的增删改查 Action (与后台同步)
 * 4. 提供各种计算属性 (Getters)：总数、总价、选中状态等
 */
import { changeCount, delSelect, getCartList } from '@/api/cart'

export default {
  namespaced: true,
  state () {
    return {
      cartList: [] // 购物车商品列表
    }
  },
  mutations: {
    /**
     * 设置购物车列表
     */
    setCartList (state, newList) {
      state.cartList = newList
    },
    /**
     * 切换单个商品的选中状态
     */
    toggleCheck (state, goodsId) {
      const goods = state.cartList.find(item => item.goods_id === goodsId)
      goods.isChecked = !goods.isChecked
    },
    /**
     * 切换所有商品的选中状态 (全选/全不选)
     */
    toggleAllCheck (state, flag) {
      state.cartList.forEach(item => {
        item.isChecked = flag
      })
    },
    /**
     * 本地修改商品数量
     */
    changeCount (state, { goodsId, goodsNum }) {
      const goods = state.cartList.find(item => item.goods_id === goodsId)
      goods.goods_num = goodsNum
    }
  },
  actions: {
    /**
     * 异步获取购物车数据
     */
    async getCartAction (context) {
      const { data } = await getCartList()
      // 后台返回的数据中，不包含复选框的选中状态，手动给每一项添加 isChecked 状态
      data.list.forEach(item => {
        item.isChecked = true
      })
      context.commit('setCartList', data.list)
    },
    /**
     * 异步修改购物车商品数量
     */
    async changeCountAction (context, obj) {
      const { goodsNum, goodsId, goodsSkuId } = obj
      // 1. 先同步修改本地状态 (提升响应速度)
      context.commit('changeCount', { goodsId, goodsNum })
      // 2. 再同步请求后台接口
      await changeCount(goodsId, goodsNum, goodsSkuId)
    },
    /**
     * 异步删除购物车中选中的商品
     */
    async delSelectAction (context) {
      const selCartList = context.getters.selCartList
      const cartIds = selCartList.map(item => item.id)
      // 1. 请求后台接口删除
      await delSelect(cartIds)
      // 2. 重新拉取最新的购物车数据，触发页面重新渲染
      context.dispatch('getCartAction')
    }
  },
  getters: {
    /**
     * 购物车中所有商品的累加总数
     */
    cartTotal (state) {
      return state.cartList.reduce((sum, item) => sum + item.goods_num, 0)
    },
    /**
     * 过滤出所有已勾选的商品项
     */
    selCartList (state) {
      return state.cartList.filter(item => item.isChecked)
    },
    /**
     * 已勾选商品的累加总数
     */
    selCount (state, getters) {
      return getters.selCartList.reduce((sum, item) => sum + item.goods_num, 0)
    },
    /**
     * 已勾选商品的累计总价
     */
    selPrice (state, getters) {
      return getters.selCartList.reduce((sum, item) => {
        return sum + item.goods_num * item.goods.goods_price_min
      }, 0).toFixed(2)
    },
    /**
     * 是否处于全选状态
     */
    isAllChecked (state) {
      return state.cartList.length > 0 && state.cartList.every(item => item.isChecked)
    }
  }
}
