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
              <span>{{ isLogin ? (detail.nickName || '默认昵称') : '点击登录' }}</span>
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
          <div class="asset-item" @click="$router.push('/my-resource?type=points')">
            <span class="value">{{ formatNumber(detail.points || 0) }}</span>
            <span class="label">我的积分</span>
          </div>
          <div class="asset-item" @click="$router.push('/my-resource?type=coupon')">
            <span class="value">{{ detail.coupon_count || 2 }}</span>
            <span class="label">优惠券</span>
          </div>
          <div class="asset-item" @click="$router.push('/my-resource?type=favorite')">
            <span class="value">{{ detail.favorite_count || 2 }}</span>
            <span class="label">我的收藏</span>
          </div>
          <div class="asset-item" @click="$router.push('/my-resource?type=footprint')">
            <span class="value">{{ detail.footprint_count || 2 }}</span>
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
              <span v-if="orderCounts.payment" class="badge">{{ orderCounts.payment }}</span>
            </div>
            <span class="label">待付款</span>
          </div>
          <div class="order-item" @click="$router.push('/order?dataType=delivery')">
            <div class="icon-wrapper delivery">
              <van-icon name="logistics" size="24" />
              <span v-if="orderCounts.delivery" class="badge">{{ orderCounts.delivery }}</span>
            </div>
            <span class="label">待发货</span>
          </div>
          <div class="order-item" @click="$router.push('/order?dataType=received')">
            <div class="icon-wrapper received">
              <van-icon name="send-gift-o" size="24" />
              <span v-if="orderCounts.received" class="badge">{{ orderCounts.received }}</span>
            </div>
            <span class="label">待收货</span>
          </div>
          <div class="order-item" @click="$router.push('/order?dataType=comment')">
            <div class="icon-wrapper evaluation">
              <van-icon name="chat-o" size="24" />
              <span v-if="orderCounts.comment" class="badge">{{ orderCounts.comment }}</span>
            </div>
            <span class="label">待评价</span>
          </div>
          <div class="order-item" @click="$router.push('/order?dataType=refund')">
            <div class="icon-wrapper service">
              <van-icon name="after-sale" size="24" />
            </div>
            <span class="label">售后</span>
          </div>
        </div>
      </div>

      <!-- 福利与服务行 -->
      <div class="section-row">
        <!-- 我的福利 -->
        <div class="section-card">
          <div class="section-header">
            <span class="title">我的福利</span>
          </div>
          <div class="service-grid">
            <div class="service-item" @click="$router.push('/my-resource?type=get-coupon')">
              <div class="icon-bg coupon">
                <van-icon name="coupon-o" size="22" />
              </div>
              <span class="label">领券中心</span>
            </div>
          </div>
        </div>

        <!-- 我的服务 -->
        <div class="section-card">
          <div class="section-header">
            <span class="title">我的服务</span>
          </div>
          <div class="service-grid">
            <div class="service-item" @click="$router.push('/help')">
              <div class="icon-bg help">
                <van-icon name="service-o" size="22" />
              </div>
              <span class="label">客服服务</span>
            </div>
          </div>
        </div>
      </div>

    </van-skeleton>
  </div>
</template>

<script>
/**
 * UserPage - 个人中心页面组件
 * 核心功能：
 * 1. 用户信息展示：包含头像、昵称、手机号及会员等级
 * 2. 资产统计展示：积分、优惠券、收藏、足迹
 * 3. 订单状态追踪：多维度订单状态入口 (待付款、待发货等) 及其数量徽标 (Badge)
 * 4. 服务入口管理：集成设置、领券中心、帮助中心等功能入口
 * 5. 登录校验逻辑：根据 Token 状态动态切换 UI 展示 (登录前 vs 登录后)
 * 6. 数据同步：进入页面时自动分发 Action 获取最新的用户信息详情
 */
import { mapState, mapActions } from 'vuex'

export default {
  name: 'UserPage',
  data () {
    return {
      loading: true, // 初始加载状态
      defaultAvatar: require('@/assets/default-avatar.png'), // 默认头像
      detail: {} // 用户详情数据对象
    }
  },
  computed: {
    ...mapState('user', ['userInfo', 'orderCounts']),
    /**
     * 根据本地存储的 Token 判断是否登录
     */
    isLogin () {
      return !!this.userInfo.token
    }
  },
  watch: {
    /**
     * 深度监听 Vuex 中 userInfo 的变化
     * 当用户信息更新 (如修改个人资料返回) 时，实时同步到本地 detail 变量
     */
    userInfo: {
      handler (newVal) {
        if (newVal && newVal.token) {
          this.detail = newVal
        } else {
          this.detail = {}
        }
      },
      immediate: true,
      deep: true
    }
  },
  created () {
    // 页面创建时，如果已登录则触发异步 Action 获取后端详细数据
    if (this.isLogin) {
      this.getUserData()
    } else {
      this.loading = false
    }
  },
  methods: {
    ...mapActions('user', ['getUserInfoAction']),

    /**
     * 数字格式化 (过万展示 w)
     * @param {Number} num
     */
    formatNumber (num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w'
      }
      return num.toString()
    },

    /**
     * 调用 Vuex Action 获取用户核心数据
     */
    async getUserData () {
      try {
        await this.getUserInfoAction()
      } catch (error) {
        console.error('获取用户数据失败:', error)
      } finally {
        this.loading = false
      }
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
    padding: 4px 0;

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

// 左右分栏布局
.section-row {
  display: flex;
  margin: 0 16px 12px;
  gap: 12px;

  .section-card {
     flex: 1;
     margin: 0; // 覆盖外部 margin

     .service-grid {
       grid-template-columns: 1fr; // 一行只显示一个
       gap: 0;

       .service-item {
         align-items: flex-start; // 左对齐
         padding-left: 4px; // 稍微给点内边距，避免紧贴边缘
       }
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
      &.evaluation { background-color: #f3e5f5; color: #9c27b0; }
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
</style>
