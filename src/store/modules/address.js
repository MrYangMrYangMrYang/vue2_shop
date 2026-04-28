/**
 * Address Module - Vuex 收货地址管理模块
 * 核心功能：
 * 1. 维护用户的收货地址列表
 * 2. 管理当前选中的收货地址 ID，并实现持久化存储
 * 3. 提供基于选中 ID 获取完整地址对象的 Getter
 */
import { getAddressList } from '@/api/address'

export default {
  namespaced: true,
  state() {
    return {
      // 收货地址列表
      addressList: [],
      // 当前选中的地址 ID (持久化存储在 localStorage)
      selectedId: localStorage.getItem('selected_address_id') || ''
    }
  },
  mutations: {
    /**
     * 更新地址列表
     */
    setAddressList(state, list) {
      state.addressList = list
    },
    /**
     * 设置并持久化当前选中的地址 ID
     */
    setSelectedId(state, id) {
      state.selectedId = id
      localStorage.setItem('selected_address_id', id)
    }
  },
  actions: {
    /**
     * 异步获取地址列表并初始化选中项
     */
    async getAddressAction(context) {
      const { data: { list } } = await getAddressList()
      context.commit('setAddressList', list)
      // 策略：如果没有选中的 ID，或者选中的 ID 不在列表中，默认选中第一个
      if (!context.state.selectedId && list.length > 0) {
        context.commit('setSelectedId', list[0].address_id)
      }
    }
  },
  getters: {
    /**
     * 获取当前选中的地址完整对象
     * 逻辑：根据 selectedId 匹配；若匹配不到则兜底返回第一个或空对象
     */
    selectedAddress(state) {
      if (state.selectedId && state.addressList.length > 0) {
        const found = state.addressList.find(item => String(item.address_id) === String(state.selectedId))
        if (found) return found
      }
      return state.addressList[0] || {}
    }
  }
}
