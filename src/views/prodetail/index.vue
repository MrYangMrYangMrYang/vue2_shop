<template>
  <div class="prodetail">
    <van-nav-bar fixed title="商品详情页" left-arrow @click-left="$router.go(-1)" />

    <van-skeleton title avatar :row="10" :loading="loading">
      <van-swipe :autoplay="3000" @change="onChange">
        <van-swipe-item v-for="(image, index) in images" :key="image.file_id">
          <img :src="image.external_url" @click="previewImage(index)" />
        </van-swipe-item>

        <template #indicator>
          <div class="custom-indicator">{{ current + 1 }} / {{ images.length }}</div>
        </template>
      </van-swipe>

      <!-- 商品说明 -->
      <div class="info">
        <div class="title">
          <div class="price">
            <span class="now">￥{{ formatPrice(detail.goods_price_min) }}</span>
            <span class="oldprice">￥{{ formatPrice(detail.goods_price_max) }}</span>
          </div>
          <div class="sellcount">已售 {{ detail.goods_sales }} 件</div>
        </div>
        <div class="msg text-ellipsis-2">
          {{ detail.goods_name }}
        </div>

        <div class="service">
          <div class="left-words">
            <span><van-icon name="passed" />七天无理由退货</span>
            <span><van-icon name="passed" />48小时发货</span>
          </div>
          <div class="right-icon">
            <van-icon name="arrow" />
          </div>
        </div>
      </div>

      <!-- 商品评价 -->
      <div class="comment">
        <div class="comment-title">
          <div class="left">商品评价 ({{ total }}条)</div>
          <div class="right">查看更多 <van-icon name="arrow" /> </div>
        </div>
        <div class="comment-list">
          <div class="comment-item" v-for="item in commentList" :key="item.comment_id">
            <div class="top">
              <img :src="item.user.avatar_url || defaultImg" alt="">
              <div class="name">{{ item.user.nick_name }}</div>
              <van-rate :size="16" :value="item.score / 2" color="#ffd21e" void-icon="star" void-color="#eee"/>
            </div>
            <div class="content">
              {{ item.content }}
            </div>
            <div class="time">
              {{ item.create_time }}
            </div>
          </div>
        </div>
      </div>

      <!-- 商品描述 -->
      <div class="desc" v-html="detail.content">
      </div>
    </van-skeleton>

    <!-- 底部操作栏 (使用 Vant 组件) -->
    <van-goods-action>
      <van-goods-action-icon icon="wap-home-o" text="首页" @click="$router.push('/')" />
      <van-goods-action-icon icon="shopping-cart-o" text="购物车" :badge="cartTotal > 0 ? cartTotal : ''" @click="$router.push('/cart?from=prodetail')" />
      <van-goods-action-icon
        :icon="isCollect ? 'star' : 'star-o'"
        :text="isCollect ? '已收藏' : '收藏'"
        :color="isCollect ? '#ff5000' : ''"
        @click="toggleCollect"
      />
      <van-goods-action-button type="warning" text="加入购物车" @click="add" />
      <van-goods-action-button type="danger" text="立即购买" @click="buy" />
    </van-goods-action>

    <!-- 加入购物车/立即购买 公用的弹层 -->
    <van-action-sheet v-model="showPannel" :title="mode === 'cart' ? '加入购物车' : '立刻购买'">
      <div class="product">
        <div class="product-title">
          <div class="left">
            <img :src="detail.goods_image" alt="">
          </div>
          <div class="right">
            <div class="price">
              <span>¥</span>
              <span class="nowprice">{{ detail.goods_price_min }}</span>
            </div>
            <div class="count">
              <span>库存</span>
              <span>{{ detail.stock_total }}</span>
            </div>
          </div>
        </div>

        <div class="num-box">
          <span class="label">数量</span>
          <!-- v-model 本质上 :value 和 @input 的简写 -->
          <CountBox v-model="changeCount" :max="detail.stock_total"></CountBox>
        </div>

        <!-- 有库存才显示提交按钮 -->
        <div class="showbtn" v-if="detail.stock_total > 0">
          <div class="btn" v-if="mode === 'cart'" @click="onAddCart">加入购物车</div>
          <div class="btn now" v-else @click="onBuyNow">立即购买</div>
        </div>
        <div class="btn-none" v-else>该商品已抢完</div>
      </div>
    </van-action-sheet>
  </div>
</template>

<script>
/**
 * ProDetailPage - 商品详情页组件
 * 核心功能：
 * 1. 展示商品多图轮播及预览
 * 2. 展示商品基础信息、价格、销量、服务保障
 * 3. 展示精选商品评价列表
 * 4. 富文本渲染商品详情描述内容
 * 5. 处理收藏/取消收藏逻辑 (本地存储持久化)
 * 6. 唤起规格选择弹窗，处理加入购物车或立即购买逻辑
 * 7. 登录状态校验拦截 (使用 mixin)
 */
import { ImagePreview } from 'vant'
import { mapGetters } from 'vuex'
import { addCart } from '@/api/cart'
import { getProDetail, getProComments } from '@/api/prodetail'
import defaultImg from '@/assets/default-avatar.png'
import CountBox from '@/components/CountBox.vue'
import loginConfirm from '@/mixins/loginConfirm'
import { formatPrice } from '@/utils/format'

export default {
  name: 'ProDetailPage',
  mixins: [loginConfirm],
  components: {
    CountBox
  },
  data () {
    return {
      images: [], // 轮播图列表
      current: 0, // 当前轮播索引
      detail: {}, // 商品详情数据对象
      total: 0, // 评价总数
      commentList: [], // 评价列表数据
      defaultImg,
      showPannel: false, // 控制规格选择弹层的显示隐藏
      mode: 'cart', // 弹层操作模式：'cart' (加入购物车) 或 'buy' (立即购买)
      changeCount: 1, // 选中的商品数量
      loading: true, // 页面骨架屏加载状态
      isCollect: false // 当前商品是否已收藏
    }
  },
  computed: {
    ...mapGetters('cart', ['cartTotal']),
    // 获取路由参数中的商品 ID
    goodsId () {
      return this.$route.params.id
    }
  },
  created () {
    this.initData()
    // 如果已登录，自动同步最新的购物车数量
    if (this.$store.getters.token) {
      this.$store.dispatch('cart/getCartAction')
    }
    // 从本地读取当前商品的收藏状态
    this.isCollect = localStorage.getItem(`collect_${this.goodsId}`) === 'true'
  },
  methods: {
    formatPrice,
    /**
     * 切换收藏状态
     */
    toggleCollect () {
      // 拦截未登录操作
      if (this.loginConfirm()) {
        return
      }
      this.isCollect = !this.isCollect
      localStorage.setItem(`collect_${this.goodsId}`, this.isCollect)
      this.$toast({
        message: this.isCollect ? '收藏成功' : '已取消收藏',
        icon: this.isCollect ? 'star' : 'info-o'
      })
    },
    /**
     * 初始化页面数据 (并行请求详情和评价)
     */
    async initData () {
      try {
        await Promise.all([this.getDetail(), this.getComments()])
      } finally {
        this.loading = false
      }
    },
    /**
     * 轮播图切换事件
     */
    onChange (index) {
      this.current = index
    },
    /**
     * 预览大图
     */
    previewImage (index) {
      ImagePreview({
        images: this.images.map(item => item.external_url),
        startPosition: index
      })
    },
    /**
     * 获取商品详情数据
     */
    async getDetail () {
      const { data: { detail } } = await getProDetail(this.goodsId)
      this.detail = detail
      this.images = detail.goods_images
    },
    /**
     * 获取商品评价数据 (取前3条展示)
     */
    async getComments () {
      const { data: { list, total } } = await getProComments(this.goodsId, 3)
      this.commentList = list
      this.total = total
    },
    /**
     * 触发加入购物车弹层
     */
    add () {
      this.mode = 'cart'
      this.showPannel = true
    },
    /**
     * 触发立即购买弹层
     */
    buy () {
      this.mode = 'buy'
      this.showPannel = true
    },
    /**
     * 执行加入购物车提交操作
     */
    async onAddCart () {
      if (this.loginConfirm()) {
        return
      }
      this.$toast.loading({
        message: '正在加入购物车...',
        forbidClick: true,
        loadingType: 'spinner',
        duration: 0
      })
      try {
        // 调用接口提交，默认取 SKU 列表第一项
        await addCart(this.goodsId, this.changeCount, this.detail.skuList[0].goods_sku_id)
        // 成功后重新获取购物车全局状态
        await this.$store.dispatch('cart/getCartAction')
        this.$toast.success('加入购物车成功')
        this.showPannel = false

        // 延迟跳转，提升用户反馈感知
        setTimeout(() => {
          this.$router.push('/cart?from=prodetail')
        }, 1500)
      } catch (e) {
        this.$toast.fail('加入购物车失败')
      }
    },
    /**
     * 执行立即购买操作 (跳转至订单确认页)
     */
    onBuyNow () {
      if (this.loginConfirm()) {
        return
      }
      this.$router.push({
        path: '/pay',
        query: {
          mode: 'buyNow',
          goodsId: this.goodsId,
          goodsSkuId: this.detail.skuList[0].goods_sku_id,
          goodsNum: this.changeCount
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.prodetail {
  padding-bottom: 50px;
  background-color: @gray-color;
  min-height: 100vh;
  overflow-x: hidden; // 防止水平溢出导致底部栏错位
}

.van-goods-action {
  z-index: 1000; // 确保底部栏在最上层
}

.van-nav-bar {
  ::v-deep .van-icon-arrow-left {
    color: @text-color;
  }
}

.van-swipe {
  img {
    width: 100%;
    aspect-ratio: 1/1;
    object-fit: cover;
  }
}

.custom-indicator {
  position: absolute;
  right: @spacing-lg;
  bottom: @spacing-lg;
  padding: 2px @spacing-sm;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  color: #fff;
}

.info {
  padding: @spacing-lg;
  background-color: #fff;
  margin-bottom: @spacing-sm;

  .title {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: @spacing-md;

    .price {
      .now {
        color: @price-color;
        font-size: 24px;
        font-weight: 500;
      }
      .oldprice {
        color: @text-light-color;
        text-decoration: line-through;
        font-size: 14px;
        margin-left: @spacing-sm;
      }
    }
    .sellcount {
      color: @text-light-color;
      font-size: 13px;
    }
  }

  .msg {
    font-size: 16px;
    line-height: 1.5;
    color: @text-color;
    font-weight: 500;
    margin-bottom: @spacing-lg;
  }

  .service {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: @spacing-md;
    background-color: #fafafa;
    border-radius: @border-radius;
    font-size: 12px;
    color: @text-light-color;

    .left-words {
      span {
        margin-right: @spacing-lg;
        .van-icon {
          color: @price-color;
          margin-right: 2px;
        }
      }
    }
  }
}

.comment {
  padding: @spacing-lg;
  background-color: #fff;
  margin-bottom: @spacing-sm;

  .comment-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: @spacing-md;
    border-bottom: 1px solid @gray-color;
    font-size: 14px;

    .left {
      color: @text-color;
      font-weight: 500;
    }
    .right {
      color: @text-light-color;
      font-size: 13px;
    }
  }

  .comment-list {
    .comment-item {
      padding: @spacing-md 0;
      border-bottom: 1px solid @gray-color;
      &:last-child {
        border-bottom: none;
      }

      .top {
        display: flex;
        align-items: center;
        margin-bottom: @spacing-sm;

        img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          margin-right: @spacing-sm;
        }
        .name {
          flex: 1;
          font-size: 13px;
          color: @text-color;
        }
      }
      .content {
        font-size: 14px;
        line-height: 1.5;
        color: @text-color;
        margin-bottom: @spacing-xs;
      }
      .time {
        font-size: 12px;
        color: @text-light-color;
      }
    }
  }
}

.desc {
  background-color: #fff;
  padding: @spacing-lg;
  overflow: hidden; // 确保描述内容不溢出
  ::v-deep {
    img {
      display: block;
      width: 100% !important;
      height: auto !important;
    }
    table {
      width: 100% !important;
    }
    p, div, span {
      max-width: 100% !important;
      word-break: break-all; // 强制换行防止撑开容器
    }
  }
}

.product {
  padding: @spacing-lg;

  .product-title {
    display: flex;
    margin-bottom: @spacing-lg;

    .left {
      img {
        width: 90px;
        height: 90px;
        border-radius: @border-radius-sm;
        object-fit: cover;
      }
    }

    .right {
      margin-left: @spacing-md;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;

      .price {
        color: @price-color;
        margin-bottom: @spacing-sm;

        .nowprice {
          font-size: 24px;
          font-weight: 500;
        }
      }

      .count {
        color: @text-light-color;
        font-size: 12px;
      }
    }
  }

  .num-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: @spacing-md 0;
    border-top: 1px solid #f2f3f5;
    margin-bottom: @spacing-lg;

    .label {
      font-size: 14px;
      color: @text-color;
    }
  }

  .showbtn {
    .btn {
      height: 44px;
      line-height: 44px;
      text-align: center;
      background: linear-gradient(90deg, #ffd01e, #ff8917);
      color: #fff;
      border-radius: 22px;
      font-size: 16px;
      font-weight: 500;
      transition: @transition-base;
      &:active {
        transform: scale(@active-scale);
        opacity: @active-opacity;
      }
      &.now {
        background: linear-gradient(90deg, #ff6034, #ee0a24);
      }
    }
  }
  .btn-none {
    height: 44px;
    line-height: 44px;
    text-align: center;
    background-color: #ccc;
    color: #fff;
    border-radius: 22px;
    font-size: 16px;
  }
}
</style>
