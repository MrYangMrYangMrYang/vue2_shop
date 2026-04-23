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
import { mapGetters } from 'vuex'

export default {
  name: 'LayoutIndex',
  computed: {
    // 从 cart 模块获取 cartTotal
    ...mapGetters('cart', ['cartTotal']),

    // 是否登录
    isLogin () {
      return this.$store.getters.token
    },

    // 购物车徽标（超过99显示99+）
    cartBadge () {
      // 未登录时不显示徽标
      if (!this.isLogin) return ''
      // 没有商品时不显示徽标
      if (!this.cartTotal || this.cartTotal === 0) return ''
      // 超过99显示99+
      return this.cartTotal > 99 ? '99+' : String(this.cartTotal)
    }
  },
  created () {
    // 如果已登录，获取购物车数据
    if (this.isLogin) {
      this.$store.dispatch('cart/getCartAction')
    }
  },
  watch: {
    // 监听登录状态变化，登录后获取购物车数据
    isLogin (newVal) {
      if (newVal) {
        this.$store.dispatch('cart/getCartAction')
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
