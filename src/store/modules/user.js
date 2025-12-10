// 导入存储模块
import { getInfo, setInfo } from '@/utils/storage'

export default {
  namespaced: true,
  state () {
    return {
      // 从本地获取个人权证相关信息，拿不到也有默认值
      userInfo: getInfo()
    }
  },
  mutations: {
    // 所有mutations的第一个参数，都是state
    setUserInfo (state, obj) {
      state.userInfo = obj
      // 将获取到的信息存储到本地
      setInfo(obj)
    }
  },
  actions: {
    logout (context) {
      // 个人信息要重置
      context.commit('setUserInfo', {})

      // 购物车信息要重置 (可以通过设置root属性来进行跨模块调用 mutation)
      context.commit('cart/setCartList', [], { root: true })
    }
  },
  getters: {}
}
