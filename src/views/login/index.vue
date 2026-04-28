<template>
  <div class="login">
    <van-nav-bar title="会员登录" left-arrow @click-left="$router.go(-1)" />

    <div class="container">
      <div class="title">
        <h3>手机号登录</h3>
        <p>未注册的手机号登录后将自动注册</p>
      </div>

      <div class="form">
        <div class="form-item">
          <input v-model="mobile" class="inp" maxlength="11" placeholder="请输入手机号码" type="text">
        </div>
        <div class="form-item">
          <input v-model="picCode" class="inp" maxlength="5" placeholder="请输入图形验证码" type="text">
          <!-- 给个判断防止出现图片空白 -->
          <img v-if="picUrl" :src="picUrl" @click="getPicCode" alt="">
        </div>
        <div class="form-item">
          <input v-model="msgCode" class="inp" placeholder="请输入短信验证码" type="text">
          <button @click="getCode">
            {{ second === totalSecond ? '获取验证码' : second + '秒后重新发送'}}
          </button>
        </div>
      </div>

      <div @click="login" class="login-btn">
        <van-loading v-if="loading" size="20px" color="#fff" />
        <span v-else>登录</span>
      </div>

      <div class="agreement">
        <van-checkbox v-model="isAgree" icon-size="16px" checked-color="#ee0a24">
          我已阅读并同意 <span class="link">《用户协议》</span> 和 <span class="link">《隐私政策》</span>
        </van-checkbox>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * LoginPage - 登录页面组件
 * 核心功能：
 * 1. 手机号+图形验证码+短信验证码登录
 * 2. 验证码倒计时逻辑
 * 3. 登录前的表单校验与协议勾选检查
 * 4. 登录成功后的 Token 持久化与页面跳转
 */
import { codeLogin, getMsgCode, getPicCode } from '@/api/login'

export default {
  name: 'LoginPage',
  data () {
    return {
      picKey: '', // 图形验证码唯一标识，用于后端验证
      picUrl: '', // 图形验证码图片地址 (base64)
      totalSecond: 60, // 倒计时总时长
      second: 60, // 当前剩余秒数
      timer: null, // 定时器句柄
      mobile: '', // 用户输入的手机号
      picCode: '', // 用户输入的图形验证码
      msgCode: '', // 用户输入的短信验证码
      isAgree: false, // 是否勾选同意用户协议
      loading: false // 登录按钮的加载状态
    }
  },
  async created () {
    // 页面初始化时获取图形验证码
    this.getPicCode()
  },
  methods: {
    /**
     * 获取/刷新图形验证码
     */
    async getPicCode () {
      const { data: { base64, key } } = await getPicCode()
      this.picUrl = base64
      this.picKey = key
    },

    /**
     * 校验手机号和图形验证码格式
     * @returns {Boolean} 是否通过基础校验
     */
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

    /**
     * 获取短信验证码并启动倒计时
     */
    async getCode () {
      // 1. 基础表单校验
      if (!this.validFn()) return

      // 2. 状态检查：当前未在倒计时且秒数已归位
      if (!this.timer && this.second === this.totalSecond) {
        // 3. 请求接口发送短信
        await getMsgCode(this.picCode, this.picKey, this.mobile)
        this.$toast('短信发送成功，注意查收')

        // 4. 开启 60s 倒计时
        this.timer = setInterval(() => {
          this.second--
          if (this.second <= 0) {
            clearInterval(this.timer)
            this.timer = null
            this.second = this.totalSecond
          }
        }, 1000)
      }
    },

    /**
     * 执行登录操作
     */
    async login () {
      // 防止重复点击
      if (this.loading) return

      // 1. 基础格式校验
      if (!this.validFn()) return
      if (!/^\d{6}$/.test(this.msgCode)) {
        this.$toast('请输入正确的手机验证码')
        return
      }

      // 2. 必须同意协议
      if (!this.isAgree) {
        this.$toast('请先阅读并同意用户协议')
        return
      }

      // 3. 调用登录接口
      this.loading = true
      try {
        const res = await codeLogin(this.mobile, this.msgCode)
        // 4. 存储用户信息到 Vuex (Token 等)
        this.$store.commit('user/setUserInfo', res.data)
        this.$toast('登录成功')

        // 5. 跳转回之前的页面或首页
        const url = this.$route.query.backUrl || '/'
        this.$router.replace(url)
      } catch (error) {
        this.loading = false
      }
    }
  },
  /**
   * 页面销毁前清理定时器，防止内存泄漏
   */
  destroyed () {
    clearInterval(this.timer)
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.container {
  padding: 40px @spacing-xl;

  .title {
    margin-bottom: 30px;
    h3 {
      font-size: 24px;
      font-weight: 500;
      color: @text-color;
    }
    p {
      line-height: 1.5;
      font-size: 14px;
      color: @text-light-color;
      margin-top: @spacing-sm;
    }
  }

  .form-item {
    border-bottom: 1px solid #f3f1f2;
    padding: @spacing-md 0;
    margin-bottom: @spacing-sm;
    display: flex;
    align-items: center;
    transition: @transition-base;

    &:focus-within {
      border-bottom-color: @accent-color;
    }

    .inp {
      display: block;
      border: none;
      outline: none;
      height: 44px; // 提升点击热区
      font-size: 16px; // 移动端输入框字体不小于16px可防止iOS自动缩放
      flex: 1;
      background: transparent;
    }
    img {
      width: 100px;
      height: 40px;
      object-fit: contain;
      cursor: pointer;
    }
    button {
      height: 44px;
      border: none;
      font-size: 14px;
      color: @accent-color;
      background-color: transparent;
      padding: 0 @spacing-sm;
      &:active {
        opacity: @active-opacity;
      }
    }
  }

  .login-btn {
    width: 100%;
    height: 48px;
    background: linear-gradient(90deg, #f9211c, #ff6335);
    color: #fff;
    border-radius: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    margin-top: 40px;
    box-shadow: 0 4px 12px rgba(249, 33, 28, 0.2);
    cursor: pointer;
    transition: @transition-base;

    &:active {
      transform: scale(0.98);
      opacity: @active-opacity;
    }
  }

  .agreement {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    .van-checkbox {
      font-size: 12px;
      color: @text-light-color;
      .link {
        color: @accent-color;
      }
    }
  }
}
</style>
