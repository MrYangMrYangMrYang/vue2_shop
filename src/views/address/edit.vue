<template>
  <div class="address-edit">
    <van-nav-bar
      :title="addressId ? '编辑地址' : '新增地址'"
      left-arrow
      @click-left="$router.go(-1)"
    />
    <van-address-edit
      :area-list="areaList"
      :address-info="addressInfo"
      :show-delete="!!addressId"
      show-set-default
      show-search-result
      :search-result="searchResult"
      :area-columns-placeholder="['请选择', '请选择', '请选择']"
      @save="onSave"
      @delete="onDelete"
    />
  </div>
</template>

<script>
import { addAddress, editAddress, removeAddress, getAddressDetail, setDefaultAddress } from '@/api/address'
import { getUserInfoDetail } from '@/api/user'
import { Toast } from 'vant'
import { areaList } from '@/utils/area'

export default {
  name: 'AddressEditPage',
  data () {
    return {
      addressId: this.$route.query.addressId,
      areaList,
      addressInfo: {},
      searchResult: [],
      userInfo: {}
    }
  },
  async created () {
    if (this.addressId) {
      this.getDetail()
    }
  },
  methods: {
    async getDetail () {
      try {
        // 尝试获取用户信息以对比默认地址 ID
        const userRes = await getUserInfoDetail().catch(() => ({ data: { userInfo: {} } }))
        const userInfo = userRes.data.userInfo || {}

        const { data: { detail } } = await getAddressDetail(this.addressId)
        // 1. 先注入地区列表，确保组件能匹配到 ID
        const { province_id: pId, city_id: cId, region_id: rId } = detail
        if (!this.areaList.province_list[pId]) {
          this.$set(this.areaList.province_list, pId, detail.region.province)
        }
        if (!this.areaList.city_list[cId]) {
          this.$set(this.areaList.city_list, cId, detail.region.city)
        }
        if (!this.areaList.county_list[rId]) {
          this.$set(this.areaList.county_list, rId, detail.region.region)
        }

        // 极致兼容性判断默认地址开关状态
        const isDefault = String(detail.is_default) === '1' ||
                         detail.is_default === true ||
                         String(detail.isDefault) === '1' ||
                         detail.isDefault === true ||
                         String(detail.default) === '1' ||
                         detail.default === true ||
                         (userInfo.address_id && String(detail.address_id) === String(userInfo.address_id))

        // 2. 再设置 addressInfo，触发组件回显
        this.addressInfo = {
          id: detail.address_id,
          name: detail.name,
          tel: detail.phone,
          province: detail.region.province,
          city: detail.region.city,
          county: detail.region.region,
          addressDetail: detail.detail,
          isDefault,
          areaCode: rId + ''
        }
      } catch (error) {
        console.error('获取详情失败', error)
      }
    },
    async onSave (content) {
      // 采用行政区划代码推导算法
      const regionId = content.areaCode
      const provinceId = regionId.slice(0, 2) + '0000'
      const cityId = regionId.slice(0, 4) + '00'

      // 深度解析报错信息 Undefined offset: 0：
      // 这意味着后端期望 region 是一个普通的索引数组（如 [item0, item1, item2]），
      // 而不是关联数组（对象形式）。
      // 结合之前的 value 报错，说明数组里的每个元素必须是包含 value 键的对象。
      const params = {
        name: content.name,
        phone: content.tel,
        province_id: parseInt(provinceId),
        city_id: parseInt(cityId),
        region_id: parseInt(regionId),
        region: [
          { value: parseInt(provinceId), label: content.province },
          { value: parseInt(cityId), label: content.city },
          { value: parseInt(regionId), label: content.county }
        ],
        detail: content.addressDetail,
        is_default: content.isDefault ? 1 : 0
      }

      try {
        Toast.loading({ message: '正在保存...', forbidClick: true })
        let res
        if (this.addressId) {
          res = await editAddress(this.addressId, params)
          // 如果勾选了设为默认
          if (content.isDefault) {
            await setDefaultAddress(this.addressId)
          }
          Toast.success('修改成功')
        } else {
          res = await addAddress(params)
          // 新增成功后，尝试从多个字段获取新地址 ID
          const newAddressId = res.data.address_id || res.data.addressId || (res.data.detail && res.data.detail.address_id)
          if (content.isDefault && newAddressId) {
            await setDefaultAddress(newAddressId)
          }
          Toast.success('新增成功')
        }
        setTimeout(() => {
          this.$router.back()
        }, 1000)
      } catch (error) {
        console.error('保存失败', error)
      }
    },
    async onDelete () {
      try {
        await this.$dialog.confirm({
          title: '提示',
          message: '确定要删除该地址吗？'
        })
        await removeAddress(this.addressId)
        Toast.success('删除成功')
        setTimeout(() => {
          this.$router.back()
        }, 1000)
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败', error)
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.address-edit {
  background: #f7f8fa;
  min-height: 100vh;

  // 修改设为默认地址开关的主题色
  ::v-deep .van-switch--on {
    background-color: #ee0a24;
  }
}
</style>
