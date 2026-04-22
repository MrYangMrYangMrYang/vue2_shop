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

      <div @click="login" class="login-btn">登录</div>
    </div>
  </div>
</template>

<script>
import { codeLogin, getMsgCode, getPicCode } from '@/api/login'

export default {
  name: 'LoginPage',
  data () {
    return {
      picKey: '', // 将来请求传递的图形验证码唯一标识
      picUrl: '', // 存储请求渲染的图片地址
      totalSecond: 60, // 总秒数
      second: 60, // 当前秒数，开定时器对 second--
      timer: null, // 定时器 id
      mobile: '', // 手机号
      picCode: '', // 用户输入的图形验证码
      msgCode: '' // 短信验证码
    }
  },
  async created () {
    this.getPicCode()
  },
  methods: {
    // 获取图形验证码
    async getPicCode () {
      const { data: { base64, key } } = await getPicCode()
      this.picUrl = base64 // 存储地址
      this.picKey = key // 存储唯一标识
    },

    // 校验 手机号 和 图形验证码 是否合法
    // 通过校验，返回true
    // 不通过校验，返回false
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

    // 获取短信验证码
    async getCode () {
      if (!this.validFn()) {
        // 如果没通过校验，没必要往下走了
        return
      }

      // 当目前没有定时器开着，且 totalSecond 和 second 一致 (秒数归位) 才可以倒计时
      if (!this.timer && this.second === this.totalSecond) {
        // 发送请求
        // 预期：希望如果响应的status非200，最好抛出一个promise错误，await只会等待成功的promise
        await getMsgCode(this.picCode, this.picKey, this.mobile)
        // console.log(res)
        this.$toast('短信发送成功，注意查收')

        // 开启倒计时
        this.timer = setInterval(() => {
          this.second--

          if (this.second <= 0) {
            clearInterval(this.timer)
            this.timer = null // 重置定时器 id
            this.second = this.totalSecond // 归位
          }
        }, 1000)
      }
    },

    // 登录
    async login () {
      // 校验
      if (!this.validFn()) {
        return
      }
      if (!/^\d{6}$/.test(this.msgCode)) {
        this.$toast('请输入正确的手机验证码')
        return
      }

      // 发送请求
      console.log('发送请求成功')
      const res = await codeLogin(this.mobile, this.msgCode)
      console.log(res)
      // 将token信息存入vuex中
      this.$store.commit('user/setUserInfo', res.data)
      this.$toast('登录成功')
      // this.$router.push('/')

      // 进行判断，看地址栏有无回跳地址
      // 1. 如果有   => 说明是其他页面，拦截到登录来的，需要回跳
      // 2. 如果没有 => 正常去首页
      const url = this.$route.query.backUrl || '/'
      this.$router.replace(url)
    }
  },
  // 离开页面清除定时器
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
    margin-top: 40px;
    background: linear-gradient(90deg, #ecb53c, #ff9211);
    color: #fff;
    border-radius: 24px;
    box-shadow: 0 4px 12px rgba(255, 146, 17, 0.3);
    letter-spacing: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    transition: @transition-base;

    &:active {
      transform: scale(@active-scale);
      box-shadow: 0 2px 6px rgba(255, 146, 17, 0.2);
    }
  }
}
</style>
