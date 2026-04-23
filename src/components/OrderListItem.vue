<template>
  <div class="order-list-item" v-if="item.order_id">
    <div class="tit">
      <div class="time">{{ item.create_time }}</div>
      <div class="status">
        <span>{{ item.state_text }}</span>
      </div>
    </div>
    <div class="list" >
      <div class="list-item" v-for="(goods, index) in item.goods" :key="index">
        <div class="goods-img">
          <img :src="goods.goods_image" alt="">
        </div>
        <div class="goods-content text-ellipsis-2">
          {{ goods.goods_name }}
        </div>
        <div class="goods-trade">
          <p>¥ {{ goods.total_pay_price }}</p>
          <p>x {{ goods.total_num }}</p>
        </div>
      </div>
    </div>
    <div class="total">
      共 {{ item.total_num }} 件商品，总金额 ¥{{ item.total_price }}
    </div>
    <div class="actions">
      <div v-if="item.order_status === 10">
        <span v-if="item.pay_status === 10" class="btn" @click="$router.push(`/pay?mode=buyNow&orderId=${item.order_id}`)">立刻付款</span>
        <span v-else-if="item.delivery_status === 10" class="btn">申请取消</span>
        <span v-else-if="item.delivery_status === 20" class="btn" @click="showLogistics(item)">查看物流</span>
        <span v-else-if="item.delivery_status === 20 || item.delivery_status === 30" class="btn danger">确认收货</span>
      </div>
      <div v-if="item.order_status === 30">
        <span class="btn">评价</span>
        <span class="btn" @click="$router.push(`/after-sales?orderId=${item.order_id}`)">申请售后</span>
      </div>
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
.order-list-item {
  margin: 10px auto;
  width: 94%;
  padding: 15px;
  background-color: #ffffff;
  box-shadow: 0 0.5px 2px 0 rgba(0,0,0,.05);
  border-radius: 8px;
  color: #333;
  font-size: 13px;

  .tit {
    height: 24px;
    line-height: 24px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    .status {
      color: #fa2209;
    }
  }

  .list-item {
    display: flex;
    .goods-img {
      width: 90px;
      height: 90px;
      margin: 0px 10px 10px 0;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .goods-content {
      flex: 2;
      line-height: 18px;
      max-height: 36px;
      margin-top: 8px;
    }
    .goods-trade {
      flex: 1;
      line-height: 18px;
      text-align: right;
      color: #b39999;
      margin-top: 8px;
    }
  }

  .total {
    text-align: right;
  }
  .actions {
    text-align: right;
    .btn {
      display: inline-block;
      padding: 5px 15px;
      border: 1px solid #ccc;
      border-radius: 15px;
      margin-left: 10px;
      color: #666;
      &.danger {
        border-color: #fa2209;
        color: #fa2209;
      }
    }
  }

  .logistics-container {
    padding: 16px;
    .title {
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 20px;
    }
    .info {
      padding: 12px;
      background-color: #f7f8fa;
      border-radius: 8px;
      margin-bottom: 20px;
      p {
        margin: 5px 0;
        font-size: 14px;
        color: #666;
      }
    }
  }
}
</style>
