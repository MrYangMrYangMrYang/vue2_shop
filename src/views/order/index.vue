<template>
  <div class="order">
    <van-nav-bar title="我的订单" left-arrow @click-left="$router.go(-1)" fixed placeholder />

    <van-tabs v-model="active" sticky offset-top="46px" @change="onTabChange">
      <van-tab name="all" title="全部"></van-tab>
      <van-tab name="payment" title="待支付"></van-tab>
      <van-tab name="delivery" title="待发货"></van-tab>
      <van-tab name="received" title="待收货"></van-tab>
      <van-tab name="comment" title="待评价"></van-tab>
      <van-tab name="refund" title="售后"></van-tab>
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="order-list">
        <!-- 骨架屏展示 -->
        <div v-if="loading && list.length === 0" class="skeleton-list">
          <van-skeleton
            v-for="i in 3"
            :key="i"
            title
            avatar
            :row="3"
            class="skeleton-item"
          />
        </div>

        <van-list
          v-else
          v-model="loading"
          :finished="finished"
          @load="onLoad"
          :immediate-check="false"
        >
          <OrderListItem v-for="item in list" :key="item.order_id" :item="item" @cancel="onCancelOrder"></OrderListItem>
        </van-list>
        <van-empty v-if="!loading && list.length === 0" description="暂无订单">
          <van-button round type="danger" class="bottom-button" @click="$router.push('/')">
            去逛逛
          </van-button>
        </van-empty>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script>
/**
 * OrderPage - 我的订单列表页面组件
 * 核心功能：
 * 1. 状态分类展示：支持 全部、待支付、待发货、待收货、待评价、售后 六大维度的 Tab 切换
 * 2. 列表加载机制：集成 Vant PullRefresh (下拉刷新) 与 List (上拉无限加载)
 * 3. 业务过滤逻辑：
 *    - 在售后 Tab 下仅展示售后中订单
 *    - 在非全部/非售后 Tab 下过滤掉正处于售后状态的订单，避免业务干扰
 * 4. 订单交互：支持订单取消功能，并自动触发全局用户信息 (角标) 的刷新
 * 5. 异常处理：包含骨架屏展示与空状态兜底
 */
import OrderListItem from '@/components/OrderListItem.vue'
import { getMyOrderList, cancelOrder } from '@/api/order'
import { Dialog } from 'vant'
import { REFUND_STATUS_NONE } from '@/constants/order'

export default {
  name: 'OrderPage',
  components: {
    OrderListItem
  },
  data () {
    return {
      active: this.$route.query.dataType || 'all', // 当前选中的 Tab 类型
      page: 1, // 当前加载的页码
      list: [], // 订单列表数据
      loading: false, // 是否正在加载下一页
      finished: false, // 是否已加载全部
      refreshing: false // 是否正在执行下拉刷新
    }
  },
  methods: {
    /**
     * Tab 切换事件回调
     * 重置列表数据并从第一页开始加载
     */
    onTabChange () {
      this.list = []
      this.page = 1
      this.finished = false
      this.onLoad()
    },
    /**
     * 下拉刷新回调
     */
    onRefresh () {
      this.finished = false
      this.page = 1
      this.onLoad()
    },
    /**
     * 核心加载逻辑 (支持分页)
     */
    async onLoad () {
      if (this.refreshing) {
        this.list = []
        this.refreshing = false
      }

      this.loading = true
      try {
        const res = await getMyOrderList(this.active, this.page)
        const listData = res.data.list
        const items = listData.data || []

        // 前端聚合逻辑：计算每个订单的商品总件数
        items.forEach((item) => {
          item.total_num = 0
          if (item.goods) {
            item.goods.forEach(goods => {
              item.total_num += (goods.total_num || 0)
            })
          }
        })

        // 核心过滤业务
        let filteredItems = items
        if (this.active === 'refund') {
          // 售后 Tab：仅保留有售后记录的项目
          filteredItems = items.filter(item => {
            return item.refund_status && item.refund_status !== REFUND_STATUS_NONE
          })
        } else if (this.active !== 'all') {
          // 正常状态 Tab：过滤掉正在处理售后的项目，保证流程纯净
          filteredItems = items.filter(item => {
            return !item.refund_status || item.refund_status === REFUND_STATUS_NONE
          })
        }

        this.list = [...this.list, ...filteredItems]
        this.page++

        // 分页完成校验 (基于后端返回的总页数或单页长度)
        if (items.length < listData.per_page || this.page > listData.last_page) {
          this.finished = true
        }
      } catch (e) {
        console.error('获取订单列表失败:', e)
        this.finished = true
      } finally {
        this.loading = false
      }
    },
    /**
     * 取消订单逻辑
     * @param {String|Number} orderId
     */
    async onCancelOrder (orderId) {
      try {
        await Dialog.confirm({
          title: '提示',
          message: '确定要取消该订单吗？'
        })
        const { message } = await cancelOrder(orderId)
        this.$toast.success(message || '订单取消成功')
        // 取消成功后执行刷新，并同步更新个人中心角标
        this.onRefresh()
        this.$store.dispatch('user/getUserInfoAction')
      } catch (e) {
        if (e !== 'cancel') {
          console.error(e)
          this.$toast.fail('操作失败')
        }
      }
    }
  },
  created () {
    this.onLoad()
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
  min-height: calc(100vh - 90px);
  .bottom-button {
    width: 160px;
    height: 40px;
  }
}

.skeleton-list {
  padding: @spacing-md;
  .skeleton-item {
    background: #fff;
    padding: @spacing-lg;
    border-radius: 8px;
    margin-bottom: @spacing-md;
  }
}

/deep/ .van-tabs__line {
  background-color: @primary-color;
}

/deep/ .van-tab--active {
  color: @primary-color;
  font-weight: bold;
}
</style>
