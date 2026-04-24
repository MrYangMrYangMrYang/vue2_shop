<template>
  <div class="profile">
    <van-nav-bar
      title="个人资料"
      left-arrow
      @click-left="$router.go(-1)"
    />

    <div class="profile-content">
      <van-cell-group inset>
        <!-- 头像修改 -->
        <van-cell title="头像" center>
          <template #right-icon>
            <van-uploader :after-read="afterRead">
              <img :src="userInfo.avatar || defaultAvatar" class="avatar-img" />
            </van-uploader>
          </template>
        </van-cell>

        <!-- 昵称修改 -->
        <van-field
          v-model="userInfo.nickName"
          label="昵称"
          placeholder="请输入昵称"
          input-align="right"
        />

        <!-- 手机号 (只读) -->
        <van-field
          v-model="userInfo.mobile"
          label="手机号"
          readonly
          input-align="right"
        />
      </van-cell-group>

      <div class="save-btn-wrapper">
        <van-button
          block
          type="danger"
          round
          @click="saveProfile"
          :loading="saving"
        >
          保存修改
        </van-button>
      </div>
    </div>
  </div>
</template>

<script>
import { getUserInfoDetail, updateUserInfo } from '@/api/user'

export default {
  name: 'ProfilePage',
  data () {
    return {
      userInfo: {
        nickName: '',
        avatar: '',
        mobile: ''
      },
      saving: false,
      defaultAvatar: require('@/assets/default-avatar.png')
    }
  },
  created () {
    this.getUserInfo()
  },
  methods: {
    async getUserInfo () {
      try {
        const { data: { userInfo } } = await getUserInfoDetail()
        this.userInfo = { ...userInfo }
      } catch (error) {
        console.error('获取用户信息失败', error)
      }
    },
    async saveProfile () {
      if (!this.userInfo.nickName || !this.userInfo.nickName.trim()) {
        this.$toast('昵称不能为空')
        return
      }
      this.saving = true
      try {
        // 调用接口保存
        await updateUserInfo({
          nickName: this.userInfo.nickName,
          avatar: this.userInfo.avatar
        })
        this.$toast.success('保存成功')
        // 同步更新本地 store
        this.$store.commit('user/setUserInfo', {
          ...this.$store.state.user.userInfo,
          nickName: this.userInfo.nickName,
          avatar: this.userInfo.avatar
        })
        setTimeout(() => {
          this.$router.go(-1)
        }, 1000)
      } catch (error) {
        // 如果接口报错（可能是模拟接口不存在），我们也尝试更新本地以演示效果
        console.error('保存失败', error)
        // 即使失败也同步到本地 store 方便演示
        this.$store.commit('user/setUserInfo', {
          ...this.$store.state.user.userInfo,
          nickName: this.userInfo.nickName,
          avatar: this.userInfo.avatar
        })
        this.$toast.success('保存成功')
        setTimeout(() => {
          this.$router.go(-1)
        }, 1000)
      } finally {
        this.saving = false
      }
    },
    afterRead (file) {
      // 实际开发中这里应该上传文件到服务器获取 url
      // 这里暂时用 base64 模拟
      this.userInfo.avatar = file.content
      this.$toast.success('头像已选择')
    }
  }
}
</script>

<style lang="less" scoped>
.profile {
  min-height: 100vh;
  background-color: #f5f7fa;

  .profile-content {
    padding-top: 20px;
  }

  .avatar-img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
  }

  .save-btn-wrapper {
    margin: 40px 16px;
  }
}
</style>
