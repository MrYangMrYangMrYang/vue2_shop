<template>
  <div class="after-sales">
    <van-nav-bar title="申请售后" left-arrow @click-left="$router.go(-1)" />

    <div class="container">
      <!-- 售后类型 -->
      <van-cell-group inset title="服务类型">
        <van-radio-group v-model="type">
          <van-cell title="我要退货退款" label="已收到货，需要退还收到的货物" clickable @click="type = '1'">
            <template #right-icon>
              <van-radio name="1" />
            </template>
          </van-cell>
          <van-cell title="我要退款(无需退货)" label="未收到货，或与商家协商一致不用退货" clickable @click="type = '2'">
            <template #right-icon>
              <van-radio name="2" />
            </template>
          </van-cell>
          <van-cell title="我要换货" label="已收到货，需要更换已收到的货物" clickable @click="type = '3'">
            <template #right-icon>
              <van-radio name="3" />
            </template>
          </van-cell>
        </van-radio-group>
      </van-cell-group>

      <!-- 售后原因 -->
      <van-cell-group inset title="申请原因">
        <van-field
          v-model="reason"
          readonly
          is-link
          label="原因选择"
          placeholder="请选择售后原因"
          @click="showReason = true"
        />
        <van-field
          v-model="remark"
          rows="3"
          autosize
          label="补充描述"
          type="textarea"
          maxlength="200"
          placeholder="请详细描述您遇到的问题"
          show-word-limit
        />
      </van-cell-group>

      <!-- 图片上传 -->
      <van-cell-group inset title="凭证上传">
        <div class="upload-box">
          <van-uploader v-model="fileList" multiple :max-count="3" />
          <p class="tips">最多上传3张图片，请确保图片清晰</p>
        </div>
      </van-cell-group>

      <!-- 提交按钮 -->
      <div class="footer">
        <van-button type="danger" block round @click="submit" :loading="loading">提交申请</van-button>
      </div>
    </div>

    <!-- 原因选择弹窗 -->
    <van-action-sheet
      v-model="showReason"
      :actions="reasonActions"
      cancel-text="取消"
      close-on-click-action
      @select="onSelectReason"
    />
  </div>
</template>

<script>
export default {
  name: 'AfterSales',
  data () {
    return {
      type: this.$route.query.type || '1',
      reason: '',
      remark: '',
      showReason: false,
      loading: false,
      fileList: [],
      reasonActions: [
        { name: '不想要了' },
        { name: '商品成分描述不符' },
        { name: '商品包装破损' },
        { name: '商品漏发/错发' },
        { name: '质量问题' }
      ]
    }
  },
  methods: {
    onSelectReason (action) {
      this.reason = action.name
    },
    submit () {
      if (!this.reason) {
        this.$toast('请选择申请原因')
        return
      }
      this.loading = true
      // 模拟接口请求
      setTimeout(() => {
        this.loading = false
        this.$dialog.alert({
          title: '申请已提交',
          message: '您的售后申请已收到，客服将在24小时内为您处理。'
        }).then(() => {
          this.$router.go(-1)
        })
      }, 1500)
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  padding-bottom: 80px;
  background-color: #f7f8fa;
  min-height: calc(100vh - 46px);
}

.upload-box {
  padding: 16px;
  background-color: #fff;
  .tips {
    font-size: 12px;
    color: #999;
    margin-top: 8px;
  }
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 16px;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}
</style>
