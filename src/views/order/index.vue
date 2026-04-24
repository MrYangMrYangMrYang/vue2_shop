<template>
  <div class="order">
    <van-nav-bar title="我的订单" left-arrow @click-left="$router.go(-1)" fixed placeholder />

    <van-tabs v-model="active" sticky offset-top="46px">
      <van-tab name="all" title="全部"></van-tab>
      <van-tab name="payment" title="待支付"></van-tab>
      <van-tab name="delivery" title="待发货"></van-tab>
      <van-tab name="received" title="待收货"></van-tab>
      <van-tab name="comment" title="待评价"></van-tab>
      <van-tab name="refund" title="售后"></van-tab>
    </van-tabs>

    <div class="order-list" v-if="!loading">
      <OrderListItem v-for="item in list" :key="item.order_id" :item="item" @cancel="onCancelOrder"></OrderListItem>
      <van-empty v-if="list.length === 0" description="暂无订单" />
    </div>

    <div class="loading-box" v-else>
      <van-loading color="#c21401" vertical>加载中...</van-loading>
    </div>
  </div>
</template>

<script>
import OrderListItem from '@/components/OrderListItem.vue'
import { getMyOrderList, cancelOrder } from '@/api/order'
import { Dialog } from 'vant'
export default {
  name: 'OrderPage',
  components: {
    OrderListItem
  },
  data () {
    return {
      active: this.$route.query.dataType || 'all',
      page: 1,
      list: [],
      loading: false
    }
  },
  methods: {
    async onCancelOrder (orderId) {
      try {
        await Dialog.confirm({
          title: '提示',
          message: '确定要取消该订单吗？'
        })
        const { message } = await cancelOrder(orderId)
        this.$toast.success(message || '订单取消成功')
        this.getOrderList()
      } catch (e) {
        if (e !== 'cancel') {
          console.error(e)
          this.$toast.fail('操作失败')
        }
      }
    },
    async getOrderList () {
      this.loading = true
      try {
        const res = await getMyOrderList(this.active, this.page)
        const listData = res.data.list
        const items = listData.data || []

        items.forEach((item) => {
          item.total_num = 0
          if (item.goods) {
            item.goods.forEach(goods => {
              item.total_num += (goods.total_num || 0)
            })
          }
        })
        this.list = items

        if (this.active === 'refund') {
          // 售后单：排除掉不是售后状态的订单
          this.list = this.list.filter(item => {
            return item.order_status === 20 || (item.refund_status && item.refund_status > 0)
          })
        } else if (this.active !== 'all') {
          // 其他分类页（待发货、待收货等）：排除掉已经进入售后流程的订单
          this.list = this.list.filter(item => {
            return !item.refund_status || item.refund_status === 0
          })
        }
      } catch (e) {
        console.error('获取订单列表失败:', e)
      } finally {
        this.loading = false
      }
    }
  },
  watch: {
    active: {
      immediate: true,
      handler () {
        this.getOrderList()
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "@/styles/variables.less";

.order {
  min-height: 100vh;
  background-color: @gray-color;
  padding-bottom: @spacing-xl;
}

.order-list {
  padding-top: @spacing-sm;
}

.loading-box {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

/deep/ .van-tabs__line {
  background-color: @primary-color;
}

/deep/ .van-tab--active {
  color: @primary-color;
  font-weight: bold;
}
</style>
