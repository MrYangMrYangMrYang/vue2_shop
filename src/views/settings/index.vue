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
        <van-cell title="关于我们" is-link icon="info-o" />
        <van-cell title="清除缓存" is-link icon="delete-o" @click="clearCache" />
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
export default {
  name: 'SettingsPage',
  methods: {
    logout () {
      this.$dialog.confirm({
        title: '温馨提示',
        message: '确定要退出登录吗？',
        confirmButtonText: '退出',
        confirmButtonColor: '#ee0a24'
      }).then(() => {
        this.$store.dispatch('user/logout')
        this.$toast.success('已退出登录')
        this.$router.replace('/login')
      }).catch(() => {})
    },
    clearCache () {
      this.$toast.loading({
        message: '清理中...',
        forbidClick: true,
        duration: 1000
      })
      setTimeout(() => {
        this.$toast.success('缓存清理完成')
      }, 1000)
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
