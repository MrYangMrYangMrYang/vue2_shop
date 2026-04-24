<template>
  <div v-if="item.goods_id" class="goods-item" @click="$router.push(`/prodetail/${item.goods_id}`)">
    <div class="left">
      <img :src="item.goods_image" alt="" />
    </div>
    <div class="right">
      <p class="tit text-ellipsis-2">
        {{ item.goods_name }}
      </p>
      <p class="count">已售 {{ formatSales(item.goods_sales) }}</p>
      <p class="price">
        <span class="new">￥{{ formatPrice(item.goods_price_min) }}</span>
        <!-- <span class="old">￥{{ formatPrice(item.goods_price_max) }}</span> -->
      </p>
    </div>
  </div>
</template>

<script>
import { formatPrice, formatSales } from '@/utils/format'

export default {
  name: 'GoodsItem',
  // 接收父组件传过来的数据
  props: {
    item: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  methods: {
    formatPrice,
    formatSales
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.goods-item {
  height: 148px;
  margin-bottom: 6px;
  padding: 10px;
  background-color: #fff;
  display: flex;
  border-radius: @border-radius;
  .left {
    width: 127px;
    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  .right {
    flex: 1;
    font-size: 14px;
    line-height: 1.3;
    padding: 0 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;

    .count {
      color: @text-light-color;
      font-size: 12px;
    }
    .price {
      color: @text-light-color;
      font-size: 16px;
      .new {
        color: @price-color;
        margin-right: 10px;
        font-weight: bold;
      }
      .old {
        text-decoration: line-through;
        font-size: 12px;
      }
    }
  }
}
</style>
