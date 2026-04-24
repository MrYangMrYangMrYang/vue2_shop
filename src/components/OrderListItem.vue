<template>
  <div class="order-list-item" v-if="item.order_id">
    <div class="tit">
      <div class="time">{{ item.create_time }}</div>
      <div class="status">
        <van-tag plain :type="statusTagType">
          {{ item.refund_status > 0 ? '售后中' : item.state_text }}
        </van-tag>
      </div>
    </div>
    <div class="list">
      <div class="list-item" v-for="(goods, index) in item.goods" :key="index">
        <div class="goods-img">
          <img :src="goods.goods_image" alt="">
        </div>
        <div class="goods-content">
          <div class="name text-ellipsis-2">{{ goods.goods_name }}</div>
          <div class="attr" v-if="goods.goods_sku">{{ goods.goods_sku.goods_attr }}</div>
        </div>
        <div class="goods-trade">
          <p class="price">¥ {{ goods.total_pay_price }}</p>
          <p class="count">x {{ goods.total_num }}</p>
        </div>
      </div>
    </div>
    <div class="total">
      共 <span>{{ item.total_num }}</span> 件商品，总金额 <span class="price">¥{{ item.total_price }}</span>
    </div>
    <div class="actions" v-if="!item.refund_status || item.refund_status === 0">
      <template v-if="item.order_status === 10">
        <van-button v-if="item.pay_status === 10" size="small" round plain @click="$emit('cancel', item.order_id)">取消订单</van-button>
        <van-button v-if="item.pay_status === 10" size="small" round color="#fa2209" @click="$router.push(`/pay?mode=buyNow&orderId=${item.order_id}`)">立刻付款</van-button>
        <van-button v-else-if="item.delivery_status === 10" size="small" round plain @click="$router.push(`/after-sales?orderId=${item.order_id}&type=2`)">申请退款</van-button>
        <template v-else-if="item.delivery_status === 20">
          <van-button size="small" round plain @click="showLogistics(item)">查看物流</van-button>
          <van-button size="small" round color="#fa2209">确认收货</van-button>
        </template>
        <van-button v-else-if="item.delivery_status === 30" size="small" round color="#fa2209">确认收货</van-button>
      </template>
      <template v-if="item.order_status === 30">
        <van-button size="small" round plain>评价</van-button>
        <van-button size="small" round plain @click="$router.push(`/after-sales?orderId=${item.order_id}`)">申请售后</van-button>
      </template>
    </div>

    <!-- 物流弹窗 -->
    <van-popup v-model="logisticsVisible" position="bottom" round :style="{ height: '60%' }">
      <div class="logistics-container">
        <div class="title">物流详情</div>
        <div class="info" v-if="item.order_id">
          <p>快递公司：顺丰速运</p>
          <p>快递单号：SF1234567890</p>
        </div>
        <van-steps direction="vertical" :active="0">
          <van-step v-for="(step, index) in steps" :key="index">
            <h3>{{ step.status }}</h3>
            <p>{{ step.time }}</p>
          </van-step>
        </van-steps>
      </div>
    </van-popup>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  computed: {
    statusTagType () {
      // 状态：10-进行中，20-已取消，30-已完成
      switch (this.item.order_status) {
        case 10: return 'danger'
        case 30: return 'success'
        case 20: return 'default'
        default: return 'primary'
      }
    }
  },
  data () {
    return {
      logisticsVisible: false,
      steps: [
        { status: '已签收, 感谢使用顺丰, 期待再次为您服务', time: '2026-04-23 10:00:00' },
        { status: '【北京市】快件已到达 北京朝阳营业点', time: '2026-04-23 08:30:00' },
        { status: '快件已从北京分拨中心发出', time: '2026-04-23 02:00:00' },
        { status: '商家已发货', time: '2026-04-22 18:00:00' }
      ]
    }
  },
  methods: {
    showLogistics (item) {
      this.logisticsVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
@import "@/styles/variables.less";

.order-list-item {
  margin: @spacing-md auto;
  width: 94%;
  padding: @spacing-lg;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  border-radius: @border-radius;
  color: @text-color;
  font-size: 13px;

  .tit {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: @spacing-lg;
    .time {
      color: @text-light-color;
      font-size: 12px;
    }
  }

  .list {
    margin-bottom: @spacing-lg;
  }

  .list-item {
    display: flex;
    margin-bottom: @spacing-md;
    &:last-child {
      margin-bottom: 0;
    }
    .goods-img {
      width: 80px;
      height: 80px;
      margin-right: @spacing-md;
      border-radius: 4px;
      overflow: hidden;
      background-color: @gray-color;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    .goods-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 2px 0;
      .name {
        line-height: 1.4;
        font-weight: 500;
      }
      .attr {
        font-size: 11px;
        color: @text-light-color;
        margin-top: 4px;
      }
    }
    .goods-trade {
      margin-left: @spacing-md;
      text-align: right;
      .price {
        color: @text-color;
        font-weight: bold;
        margin-bottom: 4px;
      }
      .count {
        color: @text-light-color;
        font-size: 12px;
      }
    }
  }

  .total {
    text-align: right;
    padding: @spacing-md 0;
    border-top: 1px solid #f2f3f5;
    color: @text-color;
    font-size: 13px;
    span {
      font-weight: bold;
    }
    .price {
      color: @price-color;
      font-size: 16px;
      margin-left: 2px;
    }
  }

  .actions {
    text-align: right;
    margin-top: @spacing-sm;
    .van-button {
      margin-left: @spacing-sm;
      min-width: 80px;
    }
  }

  .logistics-container {
    padding: @spacing-lg;
    .title {
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      margin-bottom: @spacing-xl;
    }
    .info {
      padding: @spacing-md;
      background-color: @gray-color;
      border-radius: @border-radius;
      margin-bottom: @spacing-xl;
      p {
        margin: @spacing-xs 0;
        font-size: 14px;
        color: @text-color;
      }
    }
  }
}
</style>
