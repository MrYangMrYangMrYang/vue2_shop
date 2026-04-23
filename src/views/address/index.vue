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
export default {
  name: 'AddressPage',
  data () {
    return {
      chosenAddressId: '',
      list: []
    }
  },
  async created () {
    this.getList()
  },
  methods: {
    async getList () {
      const { data: { list } } = await getAddressList()
      this.list = list.map(item => ({
        id: item.address_id,
        name: item.name,
        tel: item.phone,
        address: item.region.province + item.region.city + item.region.region + item.detail,
        isDefault: !!item.is_default
      }))
      const defaultAddr = this.list.find(item => item.isDefault)
      if (defaultAddr) {
        this.chosenAddressId = defaultAddr.id
      }
    },
    onAdd () {
      this.$toast('新增地址功能开发中')
    },
    onEdit (item) {
      this.$toast('编辑地址功能开发中')
    },
    onSelect (item) {
      // 如果是从结算页跳过来的，可以选择地址并返回
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
  }
}
</style>
