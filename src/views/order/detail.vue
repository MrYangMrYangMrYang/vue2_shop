<template>
  <div class="order-detail">
    <van-nav-bar
      title="订单详情"
      left-arrow
      fixed
      placeholder
      @click-left="$router.back()"
    />

    <div class="detail-content" v-if="orderInfo.order_id">
      <!-- 订单状态卡片 -->
      <div class="status-card">
        <div class="status-icon">
          <van-icon name="clock-o" v-if="orderInfo.delivery_status === 10" />
          <van-icon name="logistics" v-else-if="orderInfo.delivery_status === 20" />
          <van-icon name="checked" v-else />
        </div>
        <div class="status-info">
          <h2>{{ statusText }}</h2>
          <p>{{ statusDesc }}</p>
        </div>
      </div>

      <!-- 收货地址 -->
      <div class="address-card">
        <div class="address-icon">
          <van-icon name="location-o" size="20" color="#666" />
        </div>
        <div class="address-info">
          <p class="name-phone">
            <span class="name">{{ orderInfo.consignee || '张三' }}</span>
            <span class="phone">{{ orderInfo.phone || '138****8888' }}</span>
          </p>
          <p class="address-text">{{ orderInfo.address || '北京市朝阳区某某街道某某小区' }}</p>
        </div>
      </div>

      <!-- 商品信息 -->
      <div class="goods-section">
        <div class="section-title">商品信息</div>
        <div class="goods-list">
          <div class="goods-item" v-for="(goods, index) in orderInfo.goods" :key="index">
            <div class="goods-img">
              <img :src="goods.goods_image" alt="">
            </div>
            <div class="goods-content">
              <div class="name text-ellipsis-2">{{ goods.goods_name }}</div>
              <div class="attr" v-if="goods.goods_sku">{{ goods.goods_sku.goods_attr }}</div>
              <div class="price-count">
                <span class="price">¥{{ goods.total_pay_price }}</span>
                <span class="count">x{{ goods.total_num }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单信息 -->
      <div class="info-section">
        <div class="section-title">订单信息</div>
        <div class="info-list">
          <div class="info-item">
            <span class="label">订单编号</span>
            <span class="value">{{ orderInfo.order_id }}</span>
            <van-button type="primary" plain size="mini" @click="copyOrderId">复制</van-button>
          </div>
          <div class="info-item">
            <span class="label">下单时间</span>
            <span class="value">{{ orderInfo.create_time }}</span>
          </div>
          <div class="info-item" v-if="orderInfo.pay_time">
            <span class="label">支付时间</span>
            <span class="value">{{ orderInfo.pay_time }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付方式</span>
            <span class="value">{{ payMethodText }}</span>
          </div>
          <div class="info-item">
            <span class="label">商品总额</span>
            <span class="value">¥{{ orderInfo.total_price }}</span>
          </div>
          <div class="info-item" v-if="orderInfo.freight_price > 0">
            <span class="label">运费</span>
            <span class="value">¥{{ orderInfo.freight_price }}</span>
          </div>
          <div class="info-item total">
            <span class="label">实付款</span>
            <span class="value price">¥{{ orderInfo.total_pay_price || orderInfo.total_price }}</span>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="bottom-actions">
        <van-button
          v-if="orderInfo.delivery_status === 10"
          type="danger"
          round
          block
          @click="$router.push(`/after-sales?orderId=${orderInfo.order_id}&type=1`)"
        >
          申请退款
        </van-button>
        <van-button
          v-else-if="orderInfo.delivery_status === 20"
          type="warning"
          round
          block
          @click="$router.push(`/pay?mode=buyNow&orderId=${orderInfo.order_id}`)"
        >
          查看物流
        </van-button>
        <van-button
          v-else-if="orderInfo.order_status === 30"
          type="primary"
          round
          block
          @click="onComment"
        >
          评价订单
        </van-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <van-skeleton title avatar :row="5" :loading="loading" v-else />
  </div>
</template>

<script>
/**
 * OrderDetailPage - 订单详情页面组件
 * 核心功能：
 * 1. 展示完整的订单详细信息（状态、地址、商品、金额等）
 * 2. 根据订单状态显示不同的操作按钮
 * 3. 提供复制订单号等便捷功能
 */
import { Toast } from 'vant'

export default {
  name: 'OrderDetailPage',
  data () {
    return {
      loading: false,
      orderInfo: {}
    }
  },
  computed: {
    /**
     * 订单状态文本
     */
    statusText () {
      const statusMap = {
        10: '等待商家发货',
        20: '运输中',
        30: '已签收'
      }
      return this.orderInfo.refund_status > 0
        ? '售后处理中'
        : statusMap[this.orderInfo.delivery_status] || '未知状态'
    },
    /**
     * 订单状态描述
     */
    statusDesc () {
      const descMap = {
        10: '商家正在准备您的商品，请耐心等待',
        20: '您的包裹正在快马加鞭赶来',
        30: '感谢您的购买，期待再次光临'
      }
      return descMap[this.orderInfo.delivery_status] || ''
    },
    /**
     * 支付方式文本
     */
    payMethodText () {
      const methodMap = {
        1: '微信支付',
        2: '支付宝',
        3: '余额支付'
      }
      return methodMap[this.orderInfo.pay_type] || '在线支付'
    }
  },
  created () {
    this.loadOrderDetail()
  },
  methods: {
    /**
     * 加载订单详情
     * 从 Vuex store 中获取订单数据（由 OrderListItem 跳转时存入）
     */
    loadOrderDetail () {
      this.loading = true
      try {
        const orderId = this.$route.params.id

        // 从 Vuex store 获取当前订单数据
        const orderData = this.$store.getters['order/currentOrder']

        if (orderData && orderData.order_id) {
          // 验证订单ID是否匹配
          if (String(orderData.order_id) === String(orderId)) {
            this.orderInfo = orderData
          } else {
            console.warn('订单ID不匹配，使用路由参数')
            this.orderInfo = { order_id: orderId }
          }
        } else {
          // 如果没有从 Vuex 获取到数据，显示空状态或错误提示
          console.error('未找到订单数据')
          this.orderInfo = { order_id: orderId }
        }
      } catch (error) {
        console.error('加载订单详情失败:', error)
        Toast.fail('加载订单详情失败')
      } finally {
        this.loading = false
      }
    },

    /**
     * 复制订单号
     */
    copyOrderId () {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.orderInfo.order_id).then(() => {
          Toast.success('订单号已复制')
        }).catch(() => {
          this.fallbackCopy()
        })
      } else {
        this.fallbackCopy()
      }
    },

    /**
     * 兼容性降级复制方案
     */
    fallbackCopy () {
      const input = document.createElement('input')
      input.value = this.orderInfo.order_id
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      Toast.success('订单号已复制')
    },

    /**
     * 评价按钮点击
     */
    onComment () {
      Toast('评价功能开发中...')
    }
  }
}
</script>

<style lang="less" scoped>
@import "@/styles/variables.less";

.order-detail {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 80px;

  .detail-content {
    padding-top: 8px;
  }

  .status-card {
    background: linear-gradient(135deg, #c21401, #e63930);
    padding: 24px 20px;
    display: flex;
    align-items: center;
    color: #fff;

    .status-icon {
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;

      .van-icon {
        font-size: 26px;
      }
    }

    .status-info {
      flex: 1;

      h2 {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 6px;
      }

      p {
        font-size: 13px;
        opacity: 0.9;
      }
    }
  }

  .address-card {
    background: #fff;
    margin: 10px;
    padding: 16px;
    border-radius: 12px;
    display: flex;
    align-items: flex-start;

    .address-icon {
      margin-right: 12px;
      margin-top: 2px;
    }

    .address-info {
      flex: 1;

      .name-phone {
        margin-bottom: 6px;

        .name {
          font-size: 15px;
          font-weight: bold;
          color: @text-color;
          margin-right: 12px;
        }

        .phone {
          font-size: 14px;
          color: @text-color;
        }
      }

      .address-text {
        font-size: 13px;
        color: @text-light-color;
        line-height: 1.5;
      }
    }
  }

  .goods-section,
  .info-section {
    background: #fff;
    margin: 10px;
    padding: 16px;
    border-radius: 12px;

    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: @text-color;
      margin-bottom: 16px;
      padding-left: 10px;
      border-left: 4px solid @primary-color;
    }
  }

  .goods-list {
    .goods-item {
      display: flex;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      .goods-img {
        width: 90px;
        height: 90px;
        border-radius: 8px;
        overflow: hidden;
        margin-right: 12px;
        background-color: @gray-color;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .goods-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .name {
          font-size: 14px;
          color: @text-color;
          line-height: 1.4;
          font-weight: 500;
        }

        .attr {
          font-size: 12px;
          color: @text-light-color;
          margin: 4px 0;
        }

        .price-count {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .price {
            color: @price-color;
            font-weight: bold;
            font-size: 15px;
          }

          .count {
            color: @text-light-color;
            font-size: 13px;
          }
        }
      }
    }
  }

  .info-list {
    .info-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      &.total {
        margin-top: 8px;
        padding-top: 16px;
        border-top: 2px dashed #eee;
        border-bottom: none;

        .value.price {
          color: @price-color;
          font-size: 18px;
          font-weight: bold;
        }
      }

      .label {
        width: 70px;
        font-size: 13px;
        color: @text-light-color;
        flex-shrink: 0;
      }

      .value {
        flex: 1;
        font-size: 13px;
        color: @text-color;
        text-align: right;
      }

      .van-button {
        margin-left: 8px;
      }
    }
  }

  .bottom-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 12px 16px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);

    .van-button {
      height: 44px;
      font-size: 15px;
    }
  }
}
</style>
