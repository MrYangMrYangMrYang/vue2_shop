<template>
  <div class="address-list">
    <van-nav-bar title="收货地址" left-arrow @click-left="$router.go(-1)" />
    <van-address-list
      v-model="chosenAddressId"
      :list="list"
      default-tag-text="默认"
      @add="onAdd"
      @edit="onEdit"
      @select="onSelect"
    />
  </div>
</template>

<script>
import { getAddressList } from '@/api/address'
import { getUserInfoDetail } from '@/api/user'
import { areaList } from '@/utils/area'

export default {
  name: 'AddressPage',
  data () {
    return {
      chosenAddressId: '',
      list: [],
      userInfo: {}
    }
  },
  async created () {
    // 同时获取地址列表和用户信息，确保能拿到默认地址 ID
    this.getList()
    this.getUserInfo()
  },
  methods: {
    async getUserInfo () {
      try {
        const { data: { userInfo } } = await getUserInfoDetail()
        this.userInfo = userInfo
        // 获取完用户信息后，重新计算列表中的默认状态
        this.refreshDefaultStatus()
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },
    refreshDefaultStatus () {
      const defaultIdFromUser = this.userInfo.address_id
      if (!defaultIdFromUser) return

      this.list = this.list.map(item => {
        const isDefault = item.isDefault || String(item.id) === String(defaultIdFromUser)
        return { ...item, isDefault }
      }).sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1
        if (!a.isDefault && b.isDefault) return 1
        return 0
      })

      const defaultAddr = this.list.find(item => item.isDefault)
      if (defaultAddr) {
        this.chosenAddressId = defaultAddr.id
      }
    },
    async getList () {
      const { data } = await getAddressList()
      const list = data.list || []

      // 这里的 default_id 可能在 data 下，也可能在 userInfo 下
      const defaultIdFromUser = data.default_id || (data.userInfo && data.userInfo.address_id) || this.userInfo.address_id

      this.list = list.map((item, index) => {
        // 极致兼容显示逻辑：
        let p = ''; let c = ''; let r = ''

        // 策略1：优先根据 ID 从本地 areaList 映射地名（解决后端返回“其他”的问题）
        if (item.province_id && areaList.province_list[item.province_id]) {
          p = areaList.province_list[item.province_id]
        }
        if (item.city_id && areaList.city_list[item.city_id]) {
          c = areaList.city_list[item.city_id]
        }
        if (item.region_id && areaList.county_list[item.region_id]) {
          r = areaList.county_list[item.region_id]
        }

        // 策略2：如果 ID 映射失败（不在简易列表里），则回退到 region 对象解析
        if (!p || !c || !r) {
          if (typeof item.region === 'string' && item.region.includes(',')) {
            const arr = item.region.split(',')
            p = p || arr[0] || ''
            c = c || arr[1] || ''
            r = r || arr[2] || ''
          } else if (item.region && (Array.isArray(item.region) || typeof item.region === 'object')) {
            const getVal = (obj) => {
              if (!obj) return ''
              if (typeof obj === 'string') return obj
              return obj.label || obj.value || ''
            }

            if (Array.isArray(item.region)) {
              p = p || getVal(item.region[0]) || ''
              c = c || getVal(item.region[1]) || ''
              r = r || getVal(item.region[2]) || ''
            } else {
              p = p || getVal(item.region.province) || item.province || ''
              c = c || getVal(item.region.city) || item.city || ''
              r = r || getVal(item.region.region) || getVal(item.region.county) || item.county || ''
            }
          }
        }

        // 最后保底
        const fullRegion = (p + c + r) || '其他'

        // 极致兼容性判断默认地址
        // 1. item.is_default 为 1 或 '1' 或 true
        // 2. address_id 匹配外部返回的 default_id
        // 3. address_id 匹配用户对象中的 address_id
        // 4. 兼容其他可能的字段名如 isDefault, default
        const isDefault = String(item.is_default) === '1' ||
                         item.is_default === true ||
                         String(item.isDefault) === '1' ||
                         item.isDefault === true ||
                         String(item.default) === '1' ||
                         item.default === true ||
                         (defaultIdFromUser && String(item.address_id) === String(defaultIdFromUser)) ||
                         (item.user && String(item.address_id) === String(item.user.address_id))

        return {
          id: item.address_id || item.id || index,
          name: item.name,
          tel: item.phone,
          address: (fullRegion === '其他' || fullRegion === '其他其他其他' ? '其他其他其他' : fullRegion) + item.detail,
          isDefault
        }
      }).sort((a, b) => {
        // 默认地址置顶
        if (a.isDefault && !b.isDefault) return -1
        if (!a.isDefault && b.isDefault) return 1
        return 0
      })

      const defaultAddr = this.list.find(item => item.isDefault)
      if (defaultAddr) {
        this.chosenAddressId = defaultAddr.id
      }
    },
    onAdd () {
      this.$router.push('/address-edit')
    },
    onEdit (item) {
      this.$router.push({
        path: '/address-edit',
        query: {
          addressId: item.id
        }
      })
    },
    onSelect (item) {
      // 如果是从结算页跳过来的，可以选择地址并返回
      if (this.$route.query.from === 'checkout') {
        // 将选中的地址 ID 存储在 session 中，方便结算页读取
        // 兼容处理：Vant AddressList 可能会将 ID 放在 item.id 或 item.address_id
        const addressId = item.address_id || item.id
        sessionStorage.setItem('selected_address_id', addressId)
        this.$router.back()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.address-list {
  background: #f7f8fa;
  min-height: 100vh;
  ::v-deep .van-address-list__bottom {
    bottom: 20px;
  }
}
</style>
