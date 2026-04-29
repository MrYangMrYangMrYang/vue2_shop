<template>
  <div class="settings">
    <van-nav-bar
      title="设置"
      left-arrow
      @click-left="$router.go(-1)"
    />

    <div class="settings-content">
      <van-cell-group title="账号管理">
        <van-cell title="个人资料" is-link to="/profile" icon="user-o" />
        <van-cell title="收货地址" is-link to="/address" icon="location-o" />
      </van-cell-group>

      <van-cell-group title="系统设置">
        <van-cell title="关于我们" is-link icon="info-o" @click="onAboutUs" />
      </van-cell-group>

      <div class="logout-section">
        <van-button
          block
          type="danger"
          @click="logout"
          class="logout-btn"
        >
          退出登录
        </van-button>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * SettingsPage - 设置中心页面组件
 * 核心功能：
 * 1. 提供个人资料、收货地址管理入口
 * 2. 系统相关信息展示入口 (关于我们)
 * 3. 核心功能：处理退出登录逻辑 (清除本地存储及 Vuex 状态)
 */
export default {
  name: 'SettingsPage',
  methods: {
    /**
     * 关于我们点击事件
     */
    onAboutUs () {
      this.$toast('相关功能正在开发中...')
    },
    /**
     * 退出登录逻辑
     * 弹出确认框，成功后分发 logout action 并重定向至登录页
     * 注意：不传递 backUrl 参数，确保登录页不会显示返回按钮
     * 防止用户在未登录状态下返回到需要权限的页面
     */
    logout () {
      this.$dialog.confirm({
        title: '温馨提示',
        message: '确定要退出登录吗？',
        confirmButtonText: '退出',
        confirmButtonColor: '#ee0a24'
      }).then(() => {
        // 分发 Vuex Action 执行退出清理工作 (清除 Token/UserInfo 等)
        this.$store.dispatch('user/logout')
        this.$toast.success('已退出登录')
        // 使用 replace 替换当前历史记录，防止回退到设置页
        // 不带 backUrl 参数 → 登录页将隐藏返回按钮
        this.$router.replace({
          path: '/login'
        })
      }).catch(() => {
        // 取消退出
      })
    }
  }
}
</script>

<style lang="less" scoped>
.settings {
  min-height: 100vh;
  background-color: #f5f7fa;

  .settings-content {
    padding-top: 10px;
  }

  .logout-section {
    margin-top: 40px;
    padding: 0 16px;

    .logout-btn {
      border-radius: 8px;
      font-weight: bold;
    }
  }
}
</style>
