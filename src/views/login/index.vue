<template>
  <div class="login">
    <van-nav-bar
      title="会员登录"
      :left-arrow="showBackButton"
      @click-left="handleBack"
    />

    <div class="login-container">
      <!-- 品牌展示区 -->
      <div class="brand-section">
        <div class="logo-wrapper">
          <img src="@/assets/default-avatar.png" alt="avatar" class="logo-avatar">
        </div>
        <h1 class="brand-title">欢迎回来</h1>
        <p class="brand-subtitle">登录您的账号，开始购物之旅</p>
      </div>

      <!-- 表单区域 -->
      <div class="form-section">
        <!-- 手机号输入 -->
        <div class="form-group">
          <div class="input-wrapper" :class="{ 'focused': focusedField === 'mobile' }">
            <div class="input-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.1.31.03.66-.25 1.02l-2.2 2.2z"/>
              </svg>
            </div>
            <input
              v-model="mobile"
              type="tel"
              maxlength="11"
              placeholder="请输入手机号码"
              class="form-input"
              @focus="focusedField = 'mobile'"
              @blur="focusedField = ''"
            >
          </div>
        </div>

        <!-- 图形验证码 -->
        <div class="form-group">
          <div class="input-wrapper input-wrapper-with-action" :class="{ 'focused': focusedField === 'picCode' }">
            <div class="input-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
              </svg>
            </div>
            <input
              v-model="picCode"
              type="text"
              maxlength="4"
              placeholder="请输入图形验证码"
              class="form-input has-action"
              @focus="focusedField = 'picCode'"
              @blur="focusedField = ''"
            >
            <div v-if="picUrl" class="code-image" @click="getPicCode">
              <img :src="picUrl" alt="验证码">
            </div>
          </div>
        </div>

        <!-- 短信验证码 -->
        <div class="form-group">
          <div class="input-wrapper input-wrapper-with-action" :class="{ 'focused': focusedField === 'msgCode' }">
            <div class="input-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                <path d="M11 9h2v2h-2zm0 3h2v2h-2z"/>
              </svg>
            </div>
            <input
              v-model="msgCode"
              type="text"
              maxlength="6"
              placeholder="请输入短信验证码"
              class="form-input has-action"
              @focus="focusedField = 'msgCode'"
              @blur="focusedField = ''"
            >
            <button
              type="button"
              class="code-btn"
              :class="{ 'disabled': timerActive }"
              :disabled="timerActive"
              @click="getCode"
            >
              {{ timerActive ? `${second}秒后重发` : '获取验证码' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 登录按钮 -->
      <div class="action-section">
        <button
          type="button"
          class="login-button"
          :class="{ 'loading': loading }"
          :disabled="loading"
          @click="login"
        >
          <span v-if="!loading" class="btn-text">登 录</span>
          <van-loading v-else size="22px" color="#fff" />
        </button>
      </div>

      <!-- 协议区域 -->
      <div class="agreement-section">
        <label class="agreement-label">
          <span class="checkbox-custom" :class="{ 'checked': isAgree }" @click="isAgree = !isAgree">
            <svg v-if="isAgree" viewBox="0 0 24 24" width="14" height="14" fill="#fff">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </span>
          <span class="agreement-text">
            我已阅读并同意
            <span class="link">《用户协议》</span> 和
            <span class="link">《隐私政策》</span>
          </span>
        </label>
      </div>

      <!-- 底部提示 -->
      <div class="footer-hint">
        <p>未注册的手机号登录后将自动注册</p>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * LoginPage - 登录页面组件 (优化版)
 * 核心功能：
 * 1. 手机号+图形验证码+短信验证码登录
 * 2. 验证码倒计时逻辑
 * 3. 登录前的表单校验与协议勾选检查
 * 4. 登录成功后的 Token 持久化与页面跳转
 * 5. 现代化UI设计与流畅的交互动画
 */
import { codeLogin, getMsgCode, getPicCode } from '@/api/login'

export default {
  name: 'LoginPage',
  data () {
    return {
      picKey: '',
      picUrl: '',
      totalSecond: 60,
      second: 60,
      timer: null,
      mobile: '',
      picCode: '',
      msgCode: '',
      isAgree: false,
      loading: false,
      focusedField: '',
      timerActive: false
    }
  },
  computed: {
    canSubmit () {
      return this.mobile && this.picCode && this.msgCode && this.isAgree && !this.loading
    },
    /**
     * 是否显示返回按钮
     * 规则：
     * 1. 如果有 backUrl 参数（从其他页面跳转过来需要登录）→ 显示返回按钮
     * 2. 如果没有 backUrl 参数（直接访问或退出登录后）→ 隐藏返回按钮
     */
    showBackButton () {
      return !!this.$route.query.backUrl
    }
  },
  async created () {
    await this.getPicCode()
  },
  methods: {
    /**
     * 处理导航栏返回按钮点击
     * 安全返回到来源页面
     */
    handleBack () {
      const backUrl = this.$route.query.backUrl
      if (backUrl) {
        this.$router.replace(backUrl)
      } else {
        this.$router.replace('/')
      }
    },

    async getPicCode () {
      try {
        const { data: { base64, key } } = await getPicCode()
        this.picUrl = base64
        this.picKey = key
      } catch (error) {
        console.error('获取图形验证码失败:', error)
      }
    },

    validFn () {
      if (!/^1[3-9]\d{9}$/.test(this.mobile)) {
        this.$toast('请输入正确的手机号')
        return false
      }
      if (!/^\w{4}$/.test(this.picCode)) {
        this.$toast('请输入正确的图形验证码')
        return false
      }
      return true
    },

    async getCode () {
      if (!this.validFn()) return

      if (!this.timer && !this.timerActive) {
        try {
          await getMsgCode(this.picCode, this.picKey, this.mobile)
          this.$toast.success('验证码发送成功')

          this.timerActive = true
          this.second = this.totalSecond

          this.timer = setInterval(() => {
            this.second--
            if (this.second <= 0) {
              clearInterval(this.timer)
              this.timer = null
              this.timerActive = false
              this.second = this.totalSecond
            }
          }, 1000)
        } catch (error) {
          console.error('获取验证码失败:', error)
        }
      }
    },

    async login () {
      if (this.loading) return

      if (!this.validFn()) return
      if (!/^\d{6}$/.test(this.msgCode)) {
        this.$toast('请输入正确的手机验证码')
        return
      }

      if (!this.isAgree) {
        this.$toast('请先阅读并同意用户协议')
        return
      }

      this.loading = true
      try {
        const res = await codeLogin(this.mobile, this.msgCode)
        this.$store.commit('user/setUserInfo', res.data)
        this.$toast.success('登录成功')

        setTimeout(() => {
          const url = this.$route.query.backUrl || '/'
          this.$router.replace(url)
        }, 500)
      } catch (error) {
        this.loading = false
        console.error('登录失败:', error)
      }
    }
  },
  destroyed () {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.login {
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 50%, #f0f2f5 100%);
  position: relative;
  overflow-x: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -120px;
    right: -80px;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(206, 162, 106, 0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 100px;
    left: -100px;
    width: 250px;
    height: 250px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(206, 162, 106, 0.06) 0%, transparent 70%);
    pointer-events: none;
  }
}

.login-container {
  position: relative;
  z-index: 1;
  padding: 16px 28px 40px;
  max-width: 420px;
  margin: 0 auto;
}

.brand-section {
  text-align: center;
  padding: 16px 0 24px;

  .logo-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  .logo-avatar {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow:
      0 6px 20px rgba(0, 0, 0, 0.12),
      0 2px 6px rgba(0, 0, 0, 0.08);
    animation: float 3s ease-in-out infinite;
  }

  .brand-title {
    font-size: 26px;
    font-weight: 700;
    color: @text-color;
    margin-bottom: 8px;
    letter-spacing: 1px;
  }

  .brand-subtitle {
    font-size: 13px;
    color: @text-light-color;
    line-height: 1.5;
  }
}

.form-section {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 2px solid #e8e8e8;
  border-radius: @border-radius-lg;
  padding: 0 16px;
  height: 52px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &.focused {
    border-color: @primary-color;
    box-shadow:
      0 4px 16px rgba(194, 20, 1, 0.12),
      0 0 0 4px rgba(194, 20, 1, 0.06);
    transform: translateY(-1px);
  }

  &:hover:not(.focused) {
    border-color: #d0d0d0;
  }

  &.input-wrapper-with-action {
    position: relative;
  }
}

.input-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-right: 12px;
  color: #999;
  flex-shrink: 0;
  transition: color 0.3s ease;

  .focused & {
    color: @primary-color;
  }

  svg {
    display: block;
  }
}

.form-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  font-size: 15px;
  color: @text-color;
  background: transparent;
  height: 100%;

  &::placeholder {
    color: #bfbfbf;
    font-weight: 400;
  }

  &.has-action {
    padding-right: 8px;
  }
}

.code-image {
  cursor: pointer;
  flex-shrink: 0;
  margin-left: 10px;
  border-radius: @border-radius-sm;
  overflow: hidden;
  transition: transform 0.2s ease;

  img {
    display: block;
    width: 90px;
    height: 36px;
    object-fit: cover;
    border-radius: @border-radius-sm;
  }

  &:active {
    transform: scale(0.95);
  }
}

.code-btn {
  flex-shrink: 0;
  padding: 8px 14px;
  background: linear-gradient(135deg, @primary-color 0%, #e63930 100%);
  color: #fff;
  border: none;
  border-radius: @border-radius;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 10px;
  line-height: 1.2;

  &:active:not(.disabled) {
    transform: scale(0.96);
    opacity: 0.9;
  }

  &.disabled {
    background: #ccc;
    color: #999;
    cursor: not-allowed;
  }
}

.action-section {
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: @border-radius-lg;
  background: linear-gradient(135deg, @primary-color 0%, #e63930 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 4px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 4px 16px rgba(194, 20, 1, 0.25),
    0 2px 6px rgba(230, 57, 48, 0.15);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.6s ease;
  }

  &:hover:not(:disabled)::before {
    left: 100%;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow:
      0 6px 24px rgba(194, 20, 1, 0.35),
      0 3px 10px rgba(230, 57, 48, 0.2);
  }

  &:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
    box-shadow:
      0 3px 12px rgba(194, 20, 1, 0.25),
      0 2px 6px rgba(230, 57, 48, 0.15);
  }

  &:disabled {
    opacity: 0.85;
    cursor: not-allowed;
  }

  &.loading {
    pointer-events: none;
  }

  .btn-text {
    display: block;
    line-height: 1;
  }
}

.agreement-section {
  margin-bottom: 16px;
  padding: 0 4px;
}

.agreement-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  user-select: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #d0d0d0;
  border-radius: 4px;
  margin-right: 10px;
  margin-top: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.25s ease;
  background: #fff;

  &.checked {
    background: @primary-color;
    border-color: @primary-color;
    animation: checkBounce 0.3s ease;
  }

  svg {
    display: block;
  }
}

.agreement-text {
  font-size: 13px;
  color: @text-light-color;
  line-height: 1.6;
  flex: 1;

  .link {
    color: @primary-color;
    font-weight: 500;
    text-decoration: none;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 100%;
      height: 1px;
      background: currentColor;
      transform: scaleX(0);
      transition: transform 0.25s ease;
    }

    &:active::after {
      transform: scaleX(1);
    }
  }
}

.footer-hint {
  text-align: center;
  padding-top: 12px;

  p {
    font-size: 12px;
    color: #b0b0b0;
    line-height: 1.5;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes checkBounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@media screen and (max-width: 375px) {
  .login-container {
    padding: 12px 20px 32px;
  }

  .brand-section {
    padding: 12px 0 20px;

    .logo-avatar {
      width: 60px;
      height: 60px;
    }

    .brand-title {
      font-size: 23px;
    }

    .brand-subtitle {
      font-size: 12px;
    }
  }

  .input-wrapper {
    height: 48px;
    padding: 0 14px;
  }

  .code-image img {
    width: 80px;
    height: 32px;
  }

  .login-button {
    height: 46px;
    font-size: 15px;
  }
}
</style>
