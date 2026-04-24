<template>
  <div class="pay">
    <van-nav-bar fixed title="订单结算台" left-arrow @click-left="$router.go(-1)" placeholder />

    <!-- 地址相关 -->
    <div class="address" @click="$router.push('/address?from=checkout')">
      <div class="left-icon">
        <van-icon name="logistics" />
      </div>

      <div class="info" v-if="selectedAddress.address_id">
        <div class="info-content">
          <span class="name">{{ selectedAddress.name }}</span>
          <span class="mobile">{{ selectedAddress.phone }}</span>
        </div>
        <div class="info-address">
          {{ longAddress }}
        </div>
      </div>

      <div class="info-empty" v-else>
        请选择配送地址
      </div>

      <div class="right-icon">
        <van-icon name="arrow" />
      </div>
    </div>

    <!-- 订单明细 -->
    <div class="pay-container" v-if="order.goodsList">
      <div class="pay-list card">
        <div class="list">
          <div class="goods-item" v-for="item in order.goodsList" :key="item.goods_id">
              <div class="left">
                <img :src="item.goods_image" alt="" />
              </div>
              <div class="right">
                <p class="tit text-ellipsis-2">{{ item.goods_name }}</p>
                <div class="bottom">
                  <span class="price">¥{{ item.total_pay_price }}</span>
                  <span class="count">x{{ item.total_num }}</span>
                </div>
              </div>
          </div>
        </div>

        <div class="total-summary">
          <span>共 {{ order.orderTotalNum }} 件商品，合计：</span>
          <span class="money">￥{{ order.orderTotalPrice }}</span>
        </div>
      </div>

      <!-- 优惠券/积分 -->
      <div class="discount-section card">
        <van-cell title="优惠券" is-link :value="couponText" @click="showCoupon = true" />
        <van-cell title="积分抵扣" center>
          <template #right-icon>
            <div class="points-box">
              <span class="points-text">可用 {{ personal.points || 0 }} 积分</span>
              <van-switch v-model="usePoints" size="20px" active-color="#ee0a24" />
            </div>
          </template>
        </van-cell>
      </div>

      <!-- 买家留言 -->
      <div class="buytips card">
        <div class="card-title">买家留言</div>
        <van-field
          v-model="remark"
          rows="2"
          autosize
          type="textarea"
          maxlength="50"
          placeholder="选填：买家留言（50字内）"
          show-word-limit
        />
      </div>

      <!-- 费用明细 -->
      <div class="pay-detail card">
        <div class="card-title">费用明细</div>
        <div class="detail-cell">
          <span>商品金额</span>
          <span class="val">￥{{ order.orderTotalPrice }}</span>
        </div>
        <div class="detail-cell">
          <span>优惠券</span>
          <span class="val" :class="{ red: selectedCouponId > 0 }">{{ couponText === '未选择' ? '-￥0.00' : couponText }}</span>
        </div>
        <div class="detail-cell">
          <span>配送费用</span>
          <span class="val">+￥0.00</span>
        </div>
      </div>
    </div>

    <!-- 优惠券弹窗 -->
    <van-popup v-model="showCoupon" position="bottom" round>
      <div class="coupon-popup">
        <div class="title">选择优惠券</div>
        <div class="content">
          <div class="coupon-item" v-for="item in coupons" :key="item.id" @click="selectCoupon(item)">
            <div class="left">
              <div class="price">¥<span>{{ item.value }}</span></div>
            </div>
            <div class="right">
              <div class="name">{{ item.name }}</div>
              <div class="time">有效期至 {{ item.endTime }}</div>
            </div>
            <van-icon name="success" v-if="selectedCouponId === item.id" color="#ee0a24" />
          </div>
          <div v-if="coupons.length === 0" class="empty">暂无可用优惠券</div>
        </div>
        <div class="footer">
          <van-button block round type="danger" @click="showCoupon = false">确定</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 底部提交 -->
    <van-submit-bar
      :price="order.orderTotalPrice * 100"
      :button-text="submitting ? '提交中...' : '提交订单'"
      :loading="submitting"
      @submit="submitOrder"
    />
  </div>
</template>

<script>
import { getAddressList } from '@/api/address'
import { checkOrder, submitOrder } from '@/api/order'
import { Dialog } from 'vant'
import { areaList } from '@/utils/area'
export default {
  name: 'PayPage',
  data () {
    return {
      addressList: [],
      order: {},
      personal: {},
      remark: '', // 备注留言
      submitting: false, // 提交状态
      showCoupon: false, // 是否显示优惠券弹窗
      usePoints: false, // 是否使用积分
      selectedCouponId: 0, // 选中的优惠券ID
      coupons: [ // 模拟优惠券数据
        { id: 1, name: '全场通用满减券', value: 5, endTime: '2026-12-31' },
        { id: 2, name: '新用户专享券', value: 10, endTime: '2026-12-31' }
      ]
    }
  },
  computed: {
    couponText () {
      if (this.selectedCouponId === 0) return '未选择'
      const coupon = this.coupons.find(item => item.id === this.selectedCouponId)
      return coupon ? `-¥${coupon.value}` : '未选择'
    },
    selectedAddress () {
      // 优先从 addressList 中寻找被选中的地址
      const selectedId = sessionStorage.getItem('selected_address_id')
      if (selectedId && this.addressList.length > 0) {
        const found = this.addressList.find(item => String(item.address_id) === String(selectedId))
        if (found) return found
      }
      // 否则返回第一个（通常是后端返回的默认地址）
      return this.addressList[0] || {}
    },
    longAddress () {
      const addr = this.selectedAddress
      if (!addr.address_id) return ''

      // 极致兼容显示逻辑：优先根据 ID 从本地 areaList 映射地名
      let p = ''
      let c = ''
      let r = ''

      if (addr.province_id && areaList.province_list[addr.province_id]) {
        p = areaList.province_list[addr.province_id]
      }
      if (addr.city_id && areaList.city_list[addr.city_id]) {
        c = areaList.city_list[addr.city_id]
      }
      if (addr.region_id && areaList.county_list[addr.region_id]) {
        r = areaList.county_list[addr.region_id]
      }

      // 如果 ID 映射失败，则回退到 region 对象
      if (!p || !c || !r) {
        const region = addr.region || {}
        p = p || (typeof region.province === 'string' ? region.province : '')
        c = c || (typeof region.city === 'string' ? region.city : '')
        r = r || (typeof region.region === 'string' ? region.region : '')
      }

      const fullRegion = (p + c + r) || '其他'
      return (fullRegion === '其他' || fullRegion === '其他其他其他' ? '其他其他其他' : fullRegion) + addr.detail
    },
    mode () {
      return this.$route.query.mode
    },
    cartIds () {
      return this.$route.query.cartIds
    },
    goodsId () {
      return this.$route.query.goodsId
    },
    goodsSkuId () {
      return this.$route.query.goodsSkuId
    },
    goodsNum () {
      return this.$route.query.goodsNum
    },
    orderId () {
      return this.$route.query.orderId
    }
  },
  created () {
    this.getAddressList()
    this.getOrderList()
  },
  // 路由离开前，如果是前往非地址页面，则清理选中状态
  beforeRouteLeave (to, from, next) {
    if (to.path !== '/address') {
      sessionStorage.removeItem('selected_address_id')
    }
    next()
  },
  methods: {
    async submitOrder () {
      if (this.submitting) return
      if (!this.selectedAddress.address_id) {
        this.$toast('请选择收货地址')
        return
      }

      this.submitting = true
      const loading = this.$toast.loading({
        message: '订单提交中...',
        forbidClick: true,
        duration: 0
      })

      try {
        const params = {
          remark: this.remark,
          couponId: this.selectedCouponId,
          isUsePoints: this.usePoints ? 1 : 0
        }

        let res
        if (this.mode === 'cart') {
          res = await submitOrder(this.mode, {
            cartIds: this.cartIds,
            ...params
          })
        } else if (this.mode === 'buyNow') {
          const buyNowParams = this.orderId
            ? { orderId: this.orderId }
            : {
                goodsId: this.goodsId,
                goodsSkuId: this.goodsSkuId,
                goodsNum: this.goodsNum
              }
          res = await submitOrder(this.mode, {
            ...buyNowParams,
            ...params
          })
        }

        if (res.status === 200) {
          // 1. 如果是从购物车结算的，需要更新 Vuex 中的购物车数据
          if (this.mode === 'cart') {
            await this.$store.dispatch('cart/getCartAction')
          }

          // 2. 模拟支付过程
          // 之前的 loading 可能被响应拦截器 Toast.clear() 掉了，这里重新开启一个
          const payLoading = this.$toast.loading({
            message: '支付处理中...',
            forbidClick: true,
            duration: 0
          })

          await new Promise(resolve => setTimeout(resolve, 1500))
          payLoading.clear()

          // 使用 Dialog.alert 替代 Toast，确保用户必须点击确认才能跳转，提示绝对不会被错过
          await Dialog.alert({
            title: '支付成功',
            message: '您的订单已支付成功，我们将尽快为您发货',
            confirmButtonText: '去看看订单'
          })

          // 3. 跳转到订单列表的“待发货”选项卡
          this.$router.replace('/order?dataType=delivery')
        } else {
          this.$toast.fail(res.message || '下单失败')
        }
      } catch (error) {
        console.error('提交订单失败:', error)
        this.$toast.fail(error.response?.data?.message || '服务器繁忙，请稍后再试')
      } finally {
        this.submitting = false
        loading.clear()
      }
    },
    selectCoupon (item) {
      if (this.selectedCouponId === item.id) {
        this.selectedCouponId = 0
      } else {
        this.selectedCouponId = item.id
      }
    },
    async getAddressList () {
      const { data: { list } } = await getAddressList()
      this.addressList = list
    },
    async getOrderList () {
      // 购物车结算
      if (this.mode === 'cart') {
        const { data: { order, personal } } = await checkOrder(this.mode, {
          cartIds: this.cartIds
        })
        this.order = order
        this.personal = personal
      }
      // 立刻购买结算 (包含从待支付订单跳转过来的情况)
      if (this.mode === 'buyNow') {
        const params = this.orderId
          ? { orderId: this.orderId }
          : {
              goodsId: this.goodsId,
              goodsSkuId: this.goodsSkuId,
              goodsNum: this.goodsNum
            }
        const { data: { order, personal } } = await checkOrder(this.mode, params)
        this.order = order
        this.personal = personal
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "@/styles/variables.less";

.pay {
  min-height: 100vh;
  background-color: @gray-color;
  padding-bottom: 80px;
}

.address {
  display: flex;
  align-items: center;
  padding: @spacing-lg;
  background: #ffffff url(@/assets/border-line.png) bottom repeat-x;
  background-size: 40px auto;
  margin-bottom: @spacing-md;
  .left-icon {
    font-size: 24px;
    color: @primary-color;
    margin-right: @spacing-md;
  }
  .info {
    flex: 1;
    .info-content {
      margin-bottom: @spacing-xs;
      .name {
        font-size: 16px;
        font-weight: bold;
        margin-right: @spacing-sm;
      }
      .mobile {
        font-size: 14px;
        color: @text-light-color;
      }
    }
    .info-address {
      font-size: 13px;
      color: @text-color;
      line-height: 1.4;
    }
  }
  .info-empty {
    flex: 1;
    font-size: 15px;
    color: @text-light-color;
  }
  .right-icon {
    font-size: 16px;
    color: @text-light-color;
  }
}

.pay-container {
  padding: 0 @spacing-sm;
}

.card {
  background: #ffffff;
  border-radius: @border-radius;
  margin-bottom: @spacing-md;
  padding: @spacing-md;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  .card-title {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: @spacing-md;
    color: @text-color;
  }
}

.goods-item {
  display: flex;
  margin-bottom: @spacing-md;
  .left {
    width: 80px;
    height: 80px;
    border-radius: 4px;
    overflow: hidden;
    background: @gray-color;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .right {
    flex: 1;
    margin-left: @spacing-md;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .tit {
      font-size: 14px;
      line-height: 1.4;
      color: @text-color;
    }
    .bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .price {
        font-size: 16px;
        font-weight: bold;
        color: @price-color;
      }
      .count {
        font-size: 12px;
        color: @text-light-color;
      }
    }
  }
}

.total-summary {
  text-align: right;
  padding-top: @spacing-md;
  border-top: 1px solid #f7f8fa;
  font-size: 13px;
  .money {
    font-size: 16px;
    font-weight: bold;
    color: @price-color;
  }
}

.detail-cell {
  display: flex;
  justify-content: space-between;
  margin-bottom: @spacing-sm;
  font-size: 13px;
  color: @text-color;
  &:last-child {
    margin-bottom: 0;
  }
  .val {
    &.red {
      color: @price-color;
    }
  }
}

.coupon-popup {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  .title {
    padding: @spacing-lg;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
  }
  .content {
    max-height: 60vh;
    overflow-y: auto;
    padding: 0 @spacing-lg;
    .coupon-item {
      display: flex;
      align-items: center;
      background: #fff5f5;
      border: 1px solid #ffebeb;
      border-radius: 8px;
      margin-bottom: @spacing-md;
      padding: @spacing-md;
      transition: all 0.3s;
      &:active {
        opacity: 0.8;
      }
      .left {
        width: 70px;
        color: @price-color;
        .price {
          font-size: 14px;
          span {
            font-size: 24px;
            font-weight: bold;
          }
        }
      }
      .right {
        flex: 1;
        margin-left: @spacing-md;
        .name {
          font-size: 15px;
          font-weight: bold;
          color: #323233;
        }
        .time {
          font-size: 12px;
          color: @text-light-color;
          margin-top: 6px;
        }
      }
    }
  }
  .footer {
    padding: @spacing-lg;
  }
}

/deep/ .van-submit-bar {
  border-top: 1px solid #f7f8fa;
}
</style>
