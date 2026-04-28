<template>
  <div v-if="item.goods_id" class="goods-item" @click="$router.push(`/prodetail/${item.goods_id}`)">
    <div class="left">
      <img v-lazy="item.goods_image" alt="" />
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
/**
 * GoodsItem - 商品列表项组件
 * 核心功能：
 * 1. 基础信息展示：渲染商品图片（支持懒加载）、标题（自动两行省略）、销量及优惠价
 * 2. 页面跳转：点击整个组件区域自动跳转至对应的商品详情页 (/prodetail/:id)
 * 3. 性能优化：通过 v-lazy 指令实现图片懒加载，提升长列表滚动性能
 */
import { formatPrice, formatSales } from '@/utils/format'

export default {
  name: 'GoodsItem',
  props: {
    // 商品数据对象，包含 goods_id, goods_name, goods_image, goods_sales, goods_price_min 等
    item: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  methods: {
    /**
     * 将格式化工具函数挂载到 methods，方便在 template 中直接调用
     */
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
