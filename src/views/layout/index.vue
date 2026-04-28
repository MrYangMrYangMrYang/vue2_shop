<template>
  <div>
    <!-- 二级路由出口:二级组件展示的位置 -->
    <router-view/>

    <!-- 底部导航组件 -->
    <van-tabbar route active-color="#ee0a24" inactive-color="#000">
      <van-tabbar-item to="/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/category" icon="apps-o">分类</van-tabbar-item>
      <van-tabbar-item to="/cart" icon="shopping-cart-o" :badge="cartBadge">购物车</van-tabbar-item>
      <van-tabbar-item to="/user" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
/**
 * LayoutIndex - 底部导航布局容器组件
 * 核心功能：
 * 1. 管理主页、分类、购物车、我的四个主要模块的二级路由出口
 * 2. 展示全局底部导航栏 Tabbar
 * 3. 动态维护购物车徽标 (Badge) 的显示逻辑 (包含登录校验与上限处理)
 * 4. 监听登录状态，自动触发全局数据的预加载 (购物车列表、用户信息)
 */
import { mapGetters } from 'vuex'

export default {
  name: 'LayoutIndex',
  computed: {
    // 获取购物车商品总数
    ...mapGetters('cart', ['cartTotal']),

    /**
     * 判断当前用户是否已登录
     */
    isLogin () {
      return this.$store.getters.token
    },

    /**
     * 计算购物车徽标显示的文本
     * 逻辑：未登录不显示，数量为 0 不显示，超过 99 显示 '99+'
     */
    cartBadge () {
      if (!this.isLogin) return ''
      if (!this.cartTotal || this.cartTotal === 0) return ''
      return this.cartTotal > 99 ? '99+' : String(this.cartTotal)
    }
  },
  created () {
    // 页面初始化时，如果已登录则预加载全局核心数据
    if (this.isLogin) {
      this.$store.dispatch('cart/getCartAction')
      this.$store.dispatch('user/getUserInfoAction')
    }
  },
  watch: {
    /**
     * 监听登录状态变化
     * 场景：用户从登录页返回或重新登录后，立即触发数据同步
     */
    isLogin (newVal) {
      if (newVal) {
        this.$store.dispatch('cart/getCartAction')
        this.$store.dispatch('user/getUserInfoAction')
      }
    }
  }
}
</script>

<style scoped>
/* 底部导航栏徽标样式 */
::v-deep .van-tabbar-item .van-info {
  background-color: #ee0a24;
  border: none;
  font-size: 9px;
  min-width: 12px;
  height: 12px;
  line-height: 12px;
  padding: 0 3px;
  right: 2px;
  transform: translate(30%, -30%);
}
</style>
