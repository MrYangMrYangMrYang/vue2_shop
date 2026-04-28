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
/**
 * AddressEditPage - 地址编辑/新增页面组件
 * 核心功能：
 * 1. 支持新增收货地址与编辑已有地址 (通过路由参数 addressId 区分)
 * 2. 集成 Vant AddressEdit 组件，处理复杂的省市区选择逻辑
 * 3. 极致兼容性处理：回显时手动补全不在本地 areaList 中的行政区划数据
 * 4. 采用行政区划代码推导算法，计算省、市 ID
 * 5. 处理后端特定的数据结构要求 (如 region 字段需为包含 label/value 的对象数组)
 * 6. 支持设为默认地址逻辑 (包含新增后自动设为默认的异步链路)
 */
import { addAddress, editAddress, removeAddress, getAddressDetail, setDefaultAddress } from '@/api/address'
import { getUserInfoDetail } from '@/api/user'
import { Toast } from 'vant'
import { areaList } from '@/utils/area'

export default {
  name: 'AddressEditPage',
  data () {
    return {
      addressId: this.$route.query.addressId, // 路由参数：待编辑的地址 ID
      areaList, // 本地行政区划数据源
      addressInfo: {}, // 绑定给 AddressEdit 组件的初始回显数据
      searchResult: [], // 搜索结果列表 (当前未使用)
      userInfo: {} // 当前登录用户信息
    }
  },
  async created () {
    // 如果存在 ID，说明是编辑模式，获取详情
    if (this.addressId) {
      this.getDetail()
    }
  },
  methods: {
    /**
     * 获取并预处理地址详情数据用于回显
     */
    async getDetail () {
      try {
        // 获取用户信息用于比对默认地址状态 (保底逻辑)
        const userRes = await getUserInfoDetail().catch(() => ({ data: { userInfo: {} } }))
        const userInfo = userRes.data.userInfo || {}

        const { data: { detail } } = await getAddressDetail(this.addressId)

        // 核心兼容逻辑：如果后端返回的 ID 在本地 areaList 中找不到，则动态注入
        // 确保 van-address-edit 组件能根据 ID 正确回显文字
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

        // 判断当前地址是否为默认地址 (支持多种后端字段格式)
        const isDefault = String(detail.is_default) === '1' ||
                         detail.is_default === true ||
                         String(detail.isDefault) === '1' ||
                         detail.isDefault === true ||
                         String(detail.default) === '1' ||
                         detail.default === true ||
                         (userInfo.address_id && String(detail.address_id) === String(userInfo.address_id))

        // 构造符合 van-address-edit 规范的数据对象
        this.addressInfo = {
          id: detail.address_id,
          name: detail.name,
          tel: detail.phone,
          province: detail.region.province,
          city: detail.region.city,
          county: detail.region.region,
          addressDetail: detail.detail,
          isDefault,
          areaCode: rId + '' // 组件核心依赖：根据行政区划代码自动匹配省市区
        }
      } catch (error) {
        console.error('获取详情失败', error)
      }
    },
    /**
     * 保存地址 (包含新增和编辑)
     * @param {Object} content 组件输出的表单内容
     */
    async onSave (content) {
      // 行政区划代码推导：根据县级代码推导省级和市级代码
      const regionId = content.areaCode
      const provinceId = regionId.slice(0, 2) + '0000'
      const cityId = regionId.slice(0, 4) + '00'

      // 构造符合后端复杂要求的 region 数组结构
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
        if (this.addressId) {
          // 编辑模式
          await editAddress(this.addressId, params)
          if (content.isDefault) {
            await setDefaultAddress(this.addressId)
          }
          Toast.success('修改成功')
        } else {
          // 新增模式
          const res = await addAddress(params)
          // 获取新生成的地址 ID
          const newAddressId = res.data.address_id || res.data.addressId || (res.data.detail && res.data.detail.address_id)
          // 如果勾选了默认，需要额外调用设置默认接口
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
    /**
     * 删除地址
     */
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
