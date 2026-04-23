<template>
  <div class="help-page">
    <van-nav-bar title="帮助与客服" left-arrow @click-left="$router.go(-1)" />

    <div class="container">
      <!-- 常见问题 -->
      <div class="section">
        <div class="section-title">常见问题</div>
        <van-collapse v-model="activeNames">
          <van-collapse-item title="如何进行退换货？" name="1">
            在订单详情页面点击“申请售后”，选择退货或换货，填写原因并提交即可。
          </van-collapse-item>
          <van-collapse-item title="订单什么时候发货？" name="2">
            通常情况下，订单会在支付成功后的24-48小时内发货。
          </van-collapse-item>
          <van-collapse-item title="支持哪些支付方式？" name="3">
            目前支持余额支付、微信支付、支付宝支付。
          </van-collapse-item>
          <van-collapse-item title="如何修改收货地址？" name="4">
            在订单发货前，您可以联系客服修改地址；若已发货，则无法直接修改。
          </van-collapse-item>
        </van-collapse>
      </div>

      <!-- 反馈 -->
      <div class="section feedback">
        <div class="section-title">意见反馈</div>
        <van-field
          v-model="feedback"
          rows="4"
          autosize
          label="反馈内容"
          type="textarea"
          maxlength="200"
          placeholder="请输入您的宝贵意见"
          show-word-limit
        />
        <div class="btn-box">
          <van-button block round type="danger" @click="submitFeedback">提交反馈</van-button>
        </div>
      </div>

      <!-- 客服 -->
      <div class="service-box">
        <div class="item" @click="$toast('正在接入在线客服...')">
          <van-icon name="chat-o" />
          <span>在线客服</span>
        </div>
        <div class="item" @click="callService">
          <van-icon name="phone-o" />
          <span>电话客服</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelpPage',
  data () {
    return {
      activeNames: ['1'],
      feedback: ''
    }
  },
  methods: {
    submitFeedback () {
      if (!this.feedback.trim()) {
        this.$toast('请输入反馈内容')
        return
      }
      this.$toast.success('感谢您的反馈！')
      this.feedback = ''
    },
    callService () {
      this.$toast('拨打客服电话: 400-123-4567')
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  padding: 12px;
  background-color: #f7f8fa;
  min-height: calc(100vh - 46px);
}

.section {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
  .section-title {
    padding: 12px 16px;
    font-size: 14px;
    font-weight: bold;
    color: #333;
    border-bottom: 1px solid #f2f2f2;
  }
}

.feedback {
  .btn-box {
    padding: 16px;
  }
}

.service-box {
  display: flex;
  justify-content: space-between;
  .item {
    flex: 1;
    background: #fff;
    margin: 0 6px;
    padding: 16px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    &:first-child { margin-left: 0; }
    &:last-child { margin-right: 0; }
    .van-icon {
      font-size: 24px;
      color: #ee0a24;
      margin-bottom: 8px;
    }
    span {
      font-size: 14px;
      color: #333;
    }
  }
}
</style>
