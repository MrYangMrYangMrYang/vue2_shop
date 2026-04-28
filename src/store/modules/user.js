/**
 * User Module - Vuex 用户状态管理模块
 * 核心功能：
 * 1. 存储用户登录凭证 (Token) 和 个人信息
 * 2. 统计各状态订单数量 (用于个人中心徽标显示)
 * 3. 处理退出登录逻辑 (清空状态与本地缓存)
 */
import { getInfo, setInfo } from '@/utils/storage'
import { getUserInfoDetail } from '@/api/user'
import { getMyOrderList } from '@/api/order'

export default {
  namespaced: true, // 开启命名空间
  state() {
    return {
      // 从本地获取个人权证相关信息，拿不到也有默认值
      userInfo: getInfo(),
      // 订单数量统计
      orderCounts: {
        payment: 0,
        delivery: 0,
        received: 0,
        comment: 0
      }
    }
  },
  mutations: {
    /**
     * 设置用户信息并持久化
     */
    setUserInfo (state, obj) {
      // 兼容处理：如果 obj 包含嵌套的 userInfo (如登录接口返回)，则进行扁平化处理
      if (obj && obj.userInfo && typeof obj.userInfo === 'object') {
        const { userInfo, ...rest } = obj
        state.userInfo = { ...state.userInfo, ...rest, ...userInfo }
      } else {
        state.userInfo = { ...state.userInfo, ...obj }
      }

      // 移除默认值中的空字符串 userInfo 干扰项
      if (state.userInfo.userInfo === '') {
        const newUserInfo = { ...state.userInfo }
        delete newUserInfo.userInfo
        state.userInfo = newUserInfo
      }

      // 将获取到的信息存储到本地
      setInfo(state.userInfo)
    },
    /**
     * 设置订单统计数量
     */
    setOrderCounts(state, counts) {
      state.orderCounts = counts
    }
  },
  actions: {
    /**
     * 退出登录
     */
    logout(context) {
      // 个人信息重置
      context.commit('setUserInfo', {})
      context.commit('setOrderCounts', {
        payment: 0,
        delivery: 0,
        received: 0,
        comment: 0
      })

      // 购物车信息重置 (跨模块调用)
      context.commit('cart/setCartList', [], { root: true })
    },
    /**
     * 获取用户信息及订单统计
     */
    async getUserInfoAction(context) {
      try {
        const { data: { userInfo } } = await getUserInfoDetail()
        context.commit('setUserInfo', userInfo)

        // 并发获取各状态订单数量
        const types = ['payment', 'delivery', 'received', 'comment']
        const counts = {}

        // 并发请求 4 个分类
        const results = await Promise.all(types.map(type => getMyOrderList(type, 1)))

        types.forEach((type, index) => {
          // 提取 total 字段
          counts[type] = results[index].data.list.total || 0
        })

        context.commit('setOrderCounts', counts)
      } catch (error) {
        console.error('获取用户信息或订单统计失败:', error)
      }
    }
  },
  getters: {}
}
