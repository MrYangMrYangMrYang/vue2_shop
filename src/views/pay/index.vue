<template>
  <div class="pay">
    <van-nav-bar fixed title="订单结算台" left-arrow @click-left="$router.go(-1)" />

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

      <div class="info" v-else>
        请选择配送地址
      </div>

      <div class="right-icon">
        <van-icon name="arrow" />
      </div>
    </div>

    <!-- 订单明细 -->
    <div class="pay-list" v-if="order.goodsList">
      <div class="list">
        <div class="goods-item" v-for="item in order.goodsList" :key="item.goods_id">
            <div class="left">
              <img :src="item.goods_image" alt="" />
            </div>
            <div class="right">
              <p class="tit text-ellipsis-2">
                {{ item.goods_name }}
              </p>
              <p class="info">
                <span class="count">x{{ item.total_num }}</span>
                <span class="price">¥{{ item.total_pay_price }}</span>
              </p>
            </div>
        </div>
      </div>

      <div class="flow-num-box">
        <span>共 {{ order.orderTotalNum }} 件商品，合计：</span>
        <span class="money">￥{{ order.orderTotalPrice }}</span>
      </div>

      <div class="pay-detail">
        <div class="pay-cell">
          <span>订单总金额：</span>
          <span class="red">￥{{ order.orderTotalPrice }}</span>
        </div>

        <div class="pay-cell">
          <span>优惠券：</span>
          <span>无优惠券可用</span>
        </div>

        <div class="pay-cell">
          <span>配送费用：</span>
          <span v-if="!selectedAddress">请先选择配送地址</span>
          <span v-else class="red">+￥0.00</span>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="pay-way">
        <span class="tit">支付方式</span>
        <div class="pay-cell" @click="paymentWay = 'balance'">
          <div class="left">
            <van-icon name="balance-o" />
            <span>余额支付（可用 ¥ {{ personal.balance }} 元）</span>
          </div>
          <div class="right">
            <van-icon :name="paymentWay === 'balance' ? 'success' : 'circle'" :class="{ active: paymentWay === 'balance' }" />
          </div>
        </div>
        <div class="pay-cell" @click="paymentWay = 'wechat'">
          <div class="left">
            <van-icon name="wechat" color="#07c160" />
            <span>微信支付</span>
          </div>
          <div class="right">
            <van-icon :name="paymentWay === 'wechat' ? 'success' : 'circle'" :class="{ active: paymentWay === 'wechat' }" />
          </div>
        </div>
        <div class="pay-cell" @click="paymentWay = 'alipay'">
          <div class="left">
            <van-icon name="alipay" color="#1989fa" />
            <span>支付宝支付</span>
          </div>
          <div class="right">
            <van-icon :name="paymentWay === 'alipay' ? 'success' : 'circle'" :class="{ active: paymentWay === 'alipay' }" />
          </div>
        </div>
      </div>

      <!-- 优惠券/积分 -->
      <div class="discount-section">
        <van-cell title="优惠券" is-link :value="couponText" @click="showCoupon = true" />
        <van-cell title="积分抵扣">
          <template #right-icon>
            <div class="points-box">
              <span class="points-text">可用 {{ personal.points || 0 }} 积分</span>
              <van-switch v-model="usePoints" size="20px" active-color="#ee0a24" />
            </div>
          </template>
        </van-cell>
      </div>

      <!-- 优惠券弹窗 -->
      <van-popup v-model="showCoupon" position="bottom" round :style="{ height: '40%' }">
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

      <!-- 买家留言 -->
      <div class="buytips">
        <textarea v-model="remark" placeholder="选填：买家留言（50字内）" maxlength="50" cols="30" rows="10"></textarea>
      </div>
    </div>

    <!-- 底部提交 -->
    <div class="footer-fixed">
      <div class="left">实付款：<span>￥{{ order.orderTotalPrice }}</span></div>
      <div class="tipsbtn" :class="{ disabled: submitting }" @click="submitOrder">
        {{ submitting ? '支付中...' : '提交订单' }}
      </div>
    </div>
  </div>
</template>

<script>
import { getAddressList } from '@/api/address'
import { checkOrder, submitOrder } from '@/api/order'
export default {
  name: 'PayPage',
  data () {
    return {
      addressList: [],
      order: {},
      personal: {},
      remark: '', // 备注留言
      paymentWay: 'balance', // 默认余额支付
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
      return this.addressList[0] || {}
    },
    longAddress () {
      if (!this.selectedAddress.address_id) return ''
      const region = this.selectedAddress.region
      return region.province + region.city + region.region + this.selectedAddress.detail
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
    }
  },
  created () {
    this.getAddressList()
    this.getOrderList()
  },
  methods: {
    async submitOrder () {
      if (this.submitting) return
      if (!this.selectedAddress.address_id) {
        this.$toast('请选择收货地址')
        return
      }

      this.submitting = true
      try {
        const params = {
          remark: this.remark,
          couponId: this.selectedCouponId,
          isUsePoints: this.usePoints ? 1 : 0
        }

        if (this.mode === 'cart') {
          await submitOrder(this.mode, {
            cartIds: this.cartIds,
            ...params
          })
        }
        if (this.mode === 'buyNow') {
          await submitOrder(this.mode, {
            goodsId: this.goodsId,
            goodsSkuId: this.goodsSkuId,
            goodsNum: this.goodsNum,
            ...params
          })
        }

        // 模拟支付过程
        this.$toast.loading({
          message: '支付中...',
          forbidClick: true,
          duration: 1500
        })

        setTimeout(() => {
          this.$toast.success('支付成功')
          this.$router.replace('/order')
        }, 1500)
      } catch (error) {
        this.submitting = false
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
      // 立刻购买结算
      if (this.mode === 'buyNow') {
        const { data: { order, personal } } = await checkOrder(this.mode, {
          goodsId: this.goodsId,
          goodsSkuId: this.goodsSkuId,
          goodsNum: this.goodsNum
        })
        this.order = order
        this.personal = personal
      }
    }
  }
}
</script>

<style lang="less" scoped>
.pay {
  padding-top: 46px;
  padding-bottom: 46px;
  ::v-deep {
    .van-nav-bar__arrow {
      color: #333;
    }
  }
}
.address {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  font-size: 14px;
  color: #666;
  position: relative;
  background: url(@/assets/border-line.png) bottom repeat-x;
  background-size: 60px auto;
  .left-icon {
    margin-right: 20px;
  }
  .right-icon {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-7px);
  }
}
.goods-item {
  height: 100px;
  margin-bottom: 6px;
  padding: 10px;
  background-color: #fff;
  display: flex;
  .left {
    width: 100px;
    img {
      display: block;
      width: 80px;
      margin: 10px auto;
    }
  }
  .right {
    flex: 1;
    font-size: 14px;
    line-height: 1.3;
    padding: 10px;
    padding-right: 0px;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    color: #333;
    .info {
      margin-top: 5px;
      display: flex;
      justify-content: space-between;
      .price {
        color: #fa2209;
      }
    }
  }
}

.flow-num-box {
  display: flex;
  justify-content: flex-end;
  padding: 10px 10px;
  font-size: 14px;
  border-bottom: 1px solid #efefef;
  .money {
    color: #fa2209;
  }
}

.pay-cell {
  font-size: 14px;
  padding: 10px 12px;
  color: #333;
  display: flex;
  justify-content: space-between;
  .red {
    color: #fa2209;
  }
}
.pay-detail {
  border-bottom: 1px solid #efefef;
}

.pay-way {
  font-size: 14px;
  padding: 10px 12px;
  border-bottom: 1px solid #efefef;
  color: #333;
  .tit {
    line-height: 30px;
    font-weight: bold;
  }
  .pay-cell {
    padding: 10px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .left {
      display: flex;
      align-items: center;
      .van-icon {
        font-size: 20px;
        margin-right: 8px;
      }
    }
    .right {
      .van-icon {
        font-size: 18px;
        color: #ccc;
        &.active {
          color: #fa2209;
        }
      }
    }
  }
}

.discount-section {
  margin-top: 10px;
  background: #fff;
  .van-cell {
    padding: 12px;
  }
  .points-box {
    display: flex;
    align-items: center;
    .points-text {
      font-size: 12px;
      color: #999;
      margin-right: 8px;
    }
  }
}

.coupon-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  .title {
    padding: 16px;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
  }
  .content {
    flex: 1;
    overflow-y: auto;
    padding: 0 16px;
    .coupon-item {
      display: flex;
      align-items: center;
      background: #fef0f0;
      border: 1px solid #ffdbdb;
      border-radius: 8px;
      margin-bottom: 12px;
      padding: 12px;
      position: relative;
      .left {
        width: 80px;
        color: #ee0a24;
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
        margin-left: 12px;
        .name {
          font-size: 14px;
          font-weight: bold;
          color: #333;
        }
        .time {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }
      }
      .van-icon-success {
        font-size: 20px;
      }
    }
    .empty {
      text-align: center;
      padding: 40px 0;
      color: #999;
    }
  }
  .footer {
    padding: 16px;
  }
}

.buytips {
  display: block;
  textarea {
    display: block;
    width: 100%;
    border: none;
    font-size: 14px;
    padding: 12px;
    height: 100px;
  }
}

.footer-fixed {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #efefef;
  background-color: #fff;
  padding: 0 12px;
  .left {
    font-size: 14px;
    span {
      color: #fa2209;
      font-size: 18px;
      font-weight: bold;
    }
  }
  .tipsbtn {
    width: 120px;
    height: 36px;
    line-height: 36px;
    text-align: center;
    background-color: #fa2209;
    color: #fff;
    border-radius: 18px;
    font-size: 14px;
    &.disabled {
      background-color: #ccc;
    }
  }
}
</style>
