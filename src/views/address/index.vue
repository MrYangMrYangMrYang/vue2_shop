<template>
  <div class="address-list">
    <van-nav-bar title="收货地址" left-arrow @click-left="$router.go(-1)" />
    <van-address-list
      v-if="list.length > 0"
      v-model="chosenAddressId"
      :list="list"
      default-tag-text="默认"
      @add="onAdd"
      @edit="onEdit"
      @select="onSelect"
    />
    <van-empty v-else description="暂无收货地址">
      <van-button round type="danger" class="bottom-button" @click="onAdd">
        添加新地址
      </van-button>
    </van-empty>
  </div>
</template>

<script>
/**
 * AddressPage - 收货地址列表组件
 * 核心功能：
 * 1. 展示用户已保存的收货地址列表
 * 2. 处理地址的增删改查逻辑跳转
 * 3. 极致兼容性处理：适配不同格式的后端地址数据 (ID 映射、Region 对象解析)
 * 4. 默认地址逻辑：自动置顶显示，并根据用户信息同步默认状态
 * 5. 流程联动：支持从结算页跳转选择地址并自动返回
 */
import { getAddressList } from '@/api/address'
import { getUserInfoDetail } from '@/api/user'
import { mapMutations, mapState } from 'vuex'
import areaMixin from '@/mixins/areaMixin'

export default {
  name: 'AddressPage',
  mixins: [areaMixin],
  data () {
    return {
      chosenAddressId: '', // 当前选中的地址 ID
      list: [], // 格式化后的地址列表
      userInfo: {} // 用户详细信息 (包含默认地址 ID)
    }
  },
  computed: {
    ...mapState('address', ['selectedId'])
  },
  async created () {
    // 初始选中状态优先从 Vuex 获取全局共享的选中 ID
    this.chosenAddressId = this.selectedId
    // 并行获取地址列表和用户信息
    this.getList()
    this.getUserInfo()
  },
  methods: {
    ...mapMutations('address', ['setSelectedId']),
    /**
     * 获取用户信息，用于同步最新的默认地址状态
     */
    async getUserInfo () {
      try {
        const { data: { userInfo } } = await getUserInfoDetail()
        this.userInfo = userInfo
        this.refreshDefaultStatus()
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },
    /**
     * 刷新列表中的默认地址标记，并处理自动选中逻辑
     */
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

      // 如果当前没有选中的 ID，则自动选中默认地址
      if (!this.chosenAddressId) {
        const defaultAddr = this.list.find(item => item.isDefault)
        if (defaultAddr) {
          this.chosenAddressId = defaultAddr.id
          this.setSelectedId(defaultAddr.id)
        }
      }
    },
    /**
     * 获取并格式化地址列表数据
     */
    async getList () {
      const { data } = await getAddressList()
      const list = data.list || []

      const defaultIdFromUser = data.default_id || (data.userInfo && data.userInfo.address_id) || this.userInfo.address_id

      this.list = list.map((item, index) => {
        const fullAddress = this.buildFullAddress(item)

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
          address: fullAddress,
          isDefault
        }
      }).sort((a, b) => {
        // 默认地址置顶排序
        if (a.isDefault && !b.isDefault) return -1
        if (!a.isDefault && b.isDefault) return 1
        return 0
      })

      // 默认选中第一个默认地址
      const defaultAddr = this.list.find(item => item.isDefault)
      if (defaultAddr) {
        this.chosenAddressId = defaultAddr.id
        this.setSelectedId(defaultAddr.id)
      }
    },
    /**
     * 新增地址跳转
     */
    onAdd () {
      this.$router.push('/address-edit')
    },
    /**
     * 编辑地址跳转
     */
    onEdit (item) {
      this.$router.push({
        path: '/address-edit',
        query: {
          addressId: item.id
        }
      })
    },
    /**
     * 选择地址事件 (包含结算流程自动返回逻辑)
     */
    onSelect (item) {
      const addressId = item.address_id || item.id
      this.setSelectedId(addressId)
      if (this.$route.query.from === 'checkout') {
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
    background: transparent;
    &::after {
      display: none;
    }
  }
  ::v-deep .van-hairline--top-bottom::after {
    border-width: 0;
  }
  .bottom-button {
    width: 160px;
    height: 40px;
    margin-top: 20px;
  }
}
</style>
