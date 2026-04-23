<template>
  <div class="user">
    <!-- 骨架屏加载 -->
    <van-skeleton title avatar :row="6" :loading="loading">
      <!-- 头部用户信息 -->
      <div class="user-header" :class="{ 'is-login': isLogin }">
        <div class="header-bg"></div>
        <div class="header-content">
          <div class="avatar-wrapper" @click="isLogin ? null : $router.push('/login')">
            <img :src="isLogin ? (detail.avatar || defaultAvatar) : defaultAvatar" alt="头像" />
            <div v-if="!isLogin" class="avatar-mask">
              <van-icon name="plus" size="20" />
            </div>
          </div>
          <div class="user-info" @click="isLogin ? null : $router.push('/login')">
            <div class="name">
              <span>{{ isLogin ? (detail.nickName || detail.mobile) : '点击登录' }}</span>
              <van-tag v-if="isLogin" type="warning" size="medium" round>普通会员</van-tag>
            </div>
            <div class="mobile" v-if="isLogin">{{ detail.mobile }}</div>
            <div class="login-tip" v-else>登录后享受更多权益</div>
          </div>
          <div v-if="isLogin" class="settings-btn" @click="$router.push('/settings')">
            <van-icon name="setting-o" size="22" color="#fff" />
          </div>
        </div>
      </div>

      <!-- 资产卡片 -->
      <div class="asset-card">
        <div class="asset-items">
          <div class="asset-item" @click="$router.push('/my-resource?type=balance')">
            <span class="value">¥{{ formatPrice(detail.pay_money || 0) }}</span>
            <span class="label">账户余额</span>
          </div>
          <div class="asset-item" @click="$router.push('/my-resource?type=points')">
            <span class="value">{{ formatNumber(detail.points || 0) }}</span>
            <span class="label">我的积分</span>
          </div>
          <div class="asset-item" @click="$router.push('/my-resource?type=coupon')">
            <span class="value">{{ detail.coupon_count || 0 }}</span>
            <span class="label">优惠券</span>
          </div>
        </div>
        <div class="asset-action" @click="$router.push('/wallet')">
          <van-icon name="balance-pay" size="20" />
          <span>我的钱包</span>
          <van-icon name="arrow" size="14" color="#999" />
        </div>
      </div>

      <!-- 收藏与足迹 -->
      <div class="stats-card">
        <div class="stats-item" @click="$router.push('/my-resource?type=favorite')">
          <div class="stats-icon favorite">
            <van-icon name="star-o" size="20" />
          </div>
          <div class="stats-info">
            <span class="value">{{ detail.favorite_count || 0 }}</span>
            <span class="label">我的收藏</span>
          </div>
        </div>
        <div class="stats-divider"></div>
        <div class="stats-item" @click="$router.push('/my-resource?type=footprint')">
          <div class="stats-icon footprint">
            <van-icon name="eye-o" size="20" />
          </div>
          <div class="stats-info">
            <span class="value">{{ detail.footprint_count || 0 }}</span>
            <span class="label">历史足迹</span>
          </div>
        </div>
      </div>

      <!-- 我的订单 -->
      <div class="section-card">
        <div class="section-header" @click="$router.push('/order?dataType=all')">
          <span class="title">我的订单</span>
          <div class="more">
            <span>全部订单</span>
            <van-icon name="arrow" size="12" />
          </div>
        </div>
        <div class="order-grid">
          <div class="order-item" @click="$router.push('/order?dataType=payment')">
            <div class="icon-wrapper payment">
              <van-icon name="clock-o" size="24" />
              <span v-if="detail.pending_payment_count" class="badge">{{ detail.pending_payment_count }}</span>
            </div>
            <span class="label">待付款</span>
          </div>
          <div class="order-item" @click="$router.push('/order?dataType=delivery')">
            <div class="icon-wrapper delivery">
              <van-icon name="logistics" size="24" />
              <span v-if="detail.pending_delivery_count" class="badge">{{ detail.pending_delivery_count }}</span>
            </div>
            <span class="label">待发货</span>
          </div>
          <div class="order-item" @click="$router.push('/order?dataType=received')">
            <div class="icon-wrapper received">
              <van-icon name="send-gift-o" size="24" />
              <span v-if="detail.pending_received_count" class="badge">{{ detail.pending_received_count }}</span>
            </div>
            <span class="label">待收货</span>
          </div>
          <div class="order-item" @click="$router.push('/order/after-sale')">
            <div class="icon-wrapper service">
              <van-icon name="after-sale" size="24" />
            </div>
            <span class="label">售后/退款</span>
          </div>
        </div>
      </div>

      <!-- 我的服务 -->
      <div class="section-card">
        <div class="section-header">
          <span class="title">我的服务</span>
        </div>
        <div class="service-grid">
          <div class="service-item" @click="$router.push('/address')">
            <div class="icon-bg address">
              <van-icon name="location-o" size="22" />
            </div>
            <span class="label">收货地址</span>
          </div>
          <div class="service-item" @click="$router.push('/help')">
            <div class="icon-bg help">
              <van-icon name="service-o" size="22" />
            </div>
            <span class="label">帮助客服</span>
          </div>
          <div class="service-item" @click="$router.push('/coupon')">
            <div class="icon-bg coupon">
              <van-icon name="coupon-o" size="22" />
            </div>
            <span class="label">领券中心</span>
          </div>
          <div class="service-item" @click="$router.push('/about')">
            <div class="icon-bg about">
              <van-icon name="info-o" size="22" />
            </div>
            <span class="label">关于我们</span>
          </div>
        </div>
      </div>

      <!-- 退出登录 -->
      <div v-if="isLogin" class="logout-section">
        <van-button
          plain
          round
          size="large"
          @click="logout"
          class="logout-btn"
        >
          退出登录
        </van-button>
      </div>
    </van-skeleton>
  </div>
</template>

<script>
import { getUserInfoDetail } from '@/api/user.js'
import { formatPrice } from '@/utils/format'

export default {
  name: 'UserPage',
  data () {
    return {
      detail: {},
      loading: true,
      defaultAvatar: require('@/assets/default-avatar.png')
    }
  },
  computed: {
    isLogin () {
      return this.$store.getters.token
    }
  },
  created () {
    if (this.isLogin) {
      this.getUserInfoDetail()
    } else {
      this.loading = false
    }
  },
  methods: {
    formatPrice,
    formatNumber (num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w'
      }
      return num.toString()
    },
    async getUserInfoDetail () {
      try {
        const { data: { userInfo } } = await getUserInfoDetail()
        this.detail = userInfo
      } catch (error) {
        console.error('获取用户信息失败:', error)
      } finally {
        this.loading = false
      }
    },
    logout () {
      this.$dialog.confirm({
        title: '温馨提示',
        message: '确定要退出登录吗？',
        confirmButtonText: '退出',
        confirmButtonColor: '#ee0a24'
      }).then(() => {
        this.$store.dispatch('user/logout')
        this.$toast.success('已退出登录')
      }).catch(() => {})
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.user {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 30px;
}

// 用户头部
.user-header {
  position: relative;
  overflow: hidden;

  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 180px;
    background: linear-gradient(135deg, @primary-color, lighten(@primary-color, 15%));
    border-radius: 0 0 30px 30px;
  }

  .header-content {
    position: relative;
    display: flex;
    align-items: center;
    padding: 30px 20px 20px;
    z-index: 1;
  }

  .avatar-wrapper {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.5);
    overflow: hidden;
    margin-right: 16px;
    position: relative;
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
  }

  .user-info {
    flex: 1;
    cursor: pointer;

    .name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 6px;
    }

    .mobile {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
    }

    .login-tip {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .settings-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    cursor: pointer;

    &:active {
      opacity: 0.8;
    }
  }
}

// 资产卡片
.asset-card {
  background-color: #fff;
  border-radius: 16px;
  margin: -10px 16px 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 2;

  .asset-items {
    display: flex;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;

    .asset-item {
      flex: 1;
      text-align: center;
      cursor: pointer;

      &:active {
        opacity: 0.7;
      }

      .value {
        display: block;
        font-size: 20px;
        font-weight: 700;
        color: @price-color;
        margin-bottom: 6px;
      }

      .label {
        font-size: 13px;
        color: #999;
      }
    }
  }

  .asset-action {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding-top: 16px;
    color: #333;
    font-size: 14px;
    cursor: pointer;

    &:active {
      opacity: 0.7;
    }
  }
}

// 收藏与足迹
.stats-card {
  background-color: #fff;
  border-radius: 16px;
  margin: 0 16px 12px;
  padding: 16px;
  display: flex;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

  .stats-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    cursor: pointer;

    &:active {
      opacity: 0.7;
    }

    .stats-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.favorite {
        background: linear-gradient(135deg, #fff3e0, #ffe0b2);
        color: #ff9800;
      }

      &.footprint {
        background: linear-gradient(135deg, #e3f2fd, #bbdefb);
        color: #2196f3;
      }
    }

    .stats-info {
      display: flex;
      flex-direction: column;

      .value {
        font-size: 18px;
        font-weight: 700;
        color: #333;
      }

      .label {
        font-size: 12px;
        color: #999;
      }
    }
  }

  .stats-divider {
    width: 1px;
    height: 40px;
    background-color: #f0f0f0;
    margin: 0 8px;
  }
}

// 卡片通用样式
.section-card {
  background-color: #fff;
  border-radius: 16px;
  margin: 0 16px 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    cursor: pointer;

    .title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .more {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #999;
    }
  }
}

// 订单网格
.order-grid {
  display: flex;

  .order-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;

    &:active {
      opacity: 0.7;
    }

    .icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      position: relative;

      &.payment { background-color: #fff3e0; color: #ff9800; }
      &.delivery { background-color: #e8f5e9; color: #4caf50; }
      &.received { background-color: #e3f2fd; color: #2196f3; }
      &.service { background-color: #fce4ec; color: #e91e63; }

      .badge {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 18px;
        height: 18px;
        line-height: 18px;
        text-align: center;
        background-color: @price-color;
        color: #fff;
        font-size: 10px;
        border-radius: 9px;
        padding: 0 4px;
      }
    }

    .label {
      font-size: 12px;
      color: #666;
    }
  }
}

// 服务网格
.service-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px 8px;

  .service-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;

    &:active {
      opacity: 0.7;
    }

    .icon-bg {
      width: 48px;
      height: 48px;
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;

      &.address { background: linear-gradient(135deg, #e3f2fd, #bbdefb); color: #2196f3; }
      &.help { background: linear-gradient(135deg, #fff3e0, #ffe0b2); color: #ff9800; }
      &.coupon { background: linear-gradient(135deg, #fce4ec, #f8bbd0); color: #e91e63; }
      &.about { background: linear-gradient(135deg, #e8f5e9, #c8e6c9); color: #4caf50; }
    }

    .label {
      font-size: 12px;
      color: #666;
    }
  }
}

// 退出登录
.logout-section {
  padding: 8px 16px 20px; // 上边距减小，让按钮往上移动

  .logout-btn {
    background-color: #fff;
    color: #999;
    border: 1px solid #e5e5e5;
    font-size: 15px;
    height: 44px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);

    &:active {
      background-color: #f5f5f5;
    }
  }
}
</style>
