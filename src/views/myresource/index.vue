<template>
  <div class="my-resource">
    <van-nav-bar :title="title" left-arrow @click-left="$router.go(-1)" />

    <div class="container">
      <!-- 积分商城入口 (仅在积分类型显示) -->
      <div v-if="type === 'points'" class="points-mall-banner" @click="$toast('积分商城开发中...')">
        <van-icon name="gem-o" size="32" color="#ffd700" />
        <div class="text">
          <p class="t1">积分商城</p>
          <p class="t2">小积分兑大礼，更多好物等你来</p>
        </div>
        <van-button size="small" round type="warning">去兑换</van-button>
      </div>

      <!-- 收藏/足迹 列表 -->
      <div v-if="type === 'favorite' || type === 'footprint'" class="list">
        <div v-for="item in list" :key="item.goods_id" class="goods-card" @click="$router.push(`/prodetail/${item.goods_id}`)">
          <div class="img-box">
            <img :src="item.goods_image" alt="">
          </div>
          <div class="info">
            <div class="name van-multi-ellipsis--l2">{{ item.goods_name }}</div>
            <div class="bottom">
              <div class="price">¥{{ item.goods_price_min }}</div>
              <van-button size="mini" round plain type="danger" @click.stop="handleAction(item)">
                {{ type === 'favorite' ? '取消收藏' : '加入购物车' }}
              </van-button>
            </div>
          </div>
        </div>
        <van-empty v-if="list.length === 0" description="暂无数据" />
      </div>

      <!-- 优惠券列表 (我的优惠券) -->
      <div v-else-if="type === 'coupon'" class="coupon-list">
        <div v-for="item in couponList" :key="item.id" class="coupon-card">
          <div class="left">
            <div class="price">¥<span>{{ item.value }}</span></div>
          </div>
          <div class="right">
            <div class="name">{{ item.name }}</div>
            <div class="time">有效期至 {{ item.endTime }}</div>
          </div>
        </div>
        <van-empty v-if="couponList.length === 0" description="暂无优惠券" />

        <!-- 获得更多优惠券入口 -->
        <div class="get-more-coupons" @click="$router.push('/my-resource?type=get-coupon')">
          <span>没有更多优惠券了，去领券中心看看</span>
          <van-icon name="arrow" />
        </div>
      </div>

      <!-- 领券中心 -->
      <div v-else-if="type === 'get-coupon'" class="coupon-list center">
        <!-- 领券中心头部 -->
        <div class="center-header">
          <div class="info">
            <div class="t1">福利领券中心</div>
            <div class="t2">领券下单更优惠</div>
          </div>
          <van-icon name="coupon" class="bg-icon" />
        </div>

        <div class="section-title">精选好券</div>
        <div v-for="item in claimableCoupons" :key="item.id" class="coupon-card">
          <div class="left">
            <div class="price">¥<span>{{ item.value }}</span></div>
          </div>
          <div class="right">
            <div class="name">{{ item.name }}</div>
            <div class="desc">满{{ item.min }}元可用</div>
            <van-button size="mini" round type="danger" :disabled="item.claimed" @click="claimCoupon(item)">
              {{ item.claimed ? '已领取' : '立即领取' }}
            </van-button>
          </div>
        </div>

        <!-- 领券规则说明 -->
        <div class="rules-section">
          <div class="title">领券说明</div>
          <div class="content">
            <p>1. 优惠券领取后自动发放到个人账户中；</p>
            <p>2. 每张优惠券每个用户仅限领取一次；</p>
            <p>3. 优惠券不可折现，不可转让；</p>
            <p>4. 最终解释权归商城所有。</p>
          </div>
        </div>
      </div>

      <!-- 余额/积分 简单展示 -->
      <div v-else class="simple-info">
        <!-- <van-cell-group inset>
          <van-cell title="当前数值" :value="currentValue" />
          <van-cell title="记录明细" is-link @click="$toast('明细功能开发中...')" />
        </van-cell-group> -->
        <div class="tips" v-if="type === 'points'">
          温馨提示：积分可以用于下单时抵扣现金。
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyResource',
  data () {
    return {
      list: [],
      couponList: [],
      claimableCoupons: [] // 可领取的优惠券
    }
  },
  computed: {
    type () {
      return this.$route.query.type || 'favorite'
    },
    title () {
      const map = {
        favorite: '我的收藏',
        footprint: '历史足迹',
        points: '我的积分',
        coupon: '我的优惠券',
        'get-coupon': '领券中心'
      }
      return map[this.type]
    },
    currentValue () {
      // 模拟从 store 或 api 获取的数据
      return '100.00'
    }
  },
  created () {
    this.getList()
  },
  watch: {
    // 监听路由参数变化，重新获取数据
    '$route.query.type': {
      handler () {
        this.getList()
      }
    }
  },
  methods: {
    getList () {
      // 模拟数据加载
      if (this.type === 'favorite' || this.type === 'footprint') {
        this.list = [
          {
            goods_id: 1,
            goods_name: '示例商品1 - 这是一个非常好的商品，快来买吧',
            goods_image: 'https://img01.yzcdn.cn/vant/ipad.jpeg',
            goods_price_min: '99.00'
          },
          {
            goods_id: 2,
            goods_name: '示例商品2 - 优惠多多，不容错过',
            goods_image: 'https://img01.yzcdn.cn/vant/apple-1.jpg',
            goods_price_min: '199.00'
          }
        ]
      } else if (this.type === 'coupon') {
        this.couponList = [
          { id: 1, name: '全场通用满减券', value: 5, endTime: '2026-12-31' },
          { id: 2, name: '新用户专享券', value: 10, endTime: '2026-12-31' }
        ]
      } else if (this.type === 'get-coupon') {
        this.claimableCoupons = [
          { id: 3, name: '春季大促券', value: 20, min: 200, claimed: false },
          { id: 4, name: '数码产品专项券', value: 50, min: 1000, claimed: false },
          { id: 5, name: '零食大礼包券', value: 3, min: 50, claimed: false }
        ]
      }
    },
    claimCoupon (item) {
      this.$toast.loading({
        message: '领取中...',
        forbidClick: true,
        duration: 500
      })
      setTimeout(() => {
        item.claimed = true
        this.$toast.success('领取成功')
      }, 500)
    },
    handleAction (item) {
      if (this.type === 'favorite') {
        this.$toast('取消收藏成功')
        this.list = this.list.filter(g => g.goods_id !== item.goods_id)
      } else {
        this.$toast('已加入购物车')
      }
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

.points-mall-banner {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #333, #555);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  color: #fff;
  .text {
    flex: 1;
    margin-left: 12px;
    .t1 {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .t2 {
      font-size: 12px;
      opacity: 0.8;
    }
  }
}

.goods-card {
  display: flex;
  background: #fff;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  .img-box {
    width: 90px;
    height: 90px;
    img {
      width: 100%;
      height: 100%;
      border-radius: 4px;
      object-fit: cover;
    }
  }
  .info {
    flex: 1;
    margin-left: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .name {
      font-size: 14px;
      line-height: 1.4;
      color: #333;
    }
    .bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .price {
        color: #fa2209;
        font-size: 16px;
        font-weight: bold;
      }
    }
  }
}

.simple-info {
  margin-top: 10px;
  .tips {
    padding: 16px;
    font-size: 12px;
    color: #999;
  }
}

.coupon-list {
  padding: 10px 0;
  &.center {
    .center-header {
      position: relative;
      background: linear-gradient(135deg, #ee0a24, #ff6034);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      overflow: hidden;
      .info {
        position: relative;
        z-index: 2;
        .t1 {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .t2 {
          font-size: 13px;
          opacity: 0.9;
        }
      }
      .bg-icon {
        position: absolute;
        right: -10px;
        bottom: -10px;
        font-size: 100px;
        opacity: 0.2;
        transform: rotate(-15deg);
      }
    }
    .section-title {
      font-size: 15px;
      font-weight: bold;
      color: #323233;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      &::before {
        content: "";
        width: 3px;
        height: 15px;
        background: #ee0a24;
        margin-right: 8px;
        border-radius: 2px;
      }
    }
    .rules-section {
      margin-top: 30px;
      padding: 20px;
      background: #fff;
      border-radius: 12px;
      .title {
        font-size: 14px;
        font-weight: bold;
        color: #323233;
        margin-bottom: 12px;
      }
      .content {
        font-size: 12px;
        color: #969799;
        line-height: 2;
        p {
          margin: 0;
        }
      }
    }
  }
  .coupon-card {
    display: flex;
    align-items: center;
    background: #fff5f5;
    margin-bottom: 12px;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(238, 10, 36, 0.05);
    position: relative;
    overflow: hidden;
    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: #ee0a24;
    }
    .left {
      width: 80px;
      text-align: center;
      .price {
        color: #ee0a24;
        font-size: 14px;
        span {
          font-size: 28px;
          font-weight: bold;
          margin-left: 2px;
        }
      }
    }
    .right {
      flex: 1;
      margin-left: 20px;
      .name {
        font-size: 16px;
        font-weight: bold;
        color: #323233;
        margin-bottom: 6px;
      }
      .time, .desc {
        font-size: 12px;
        color: #969799;
      }
      .desc {
        margin-bottom: 8px;
      }
    }
  }
}

.get-more-coupons {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  color: #969799;
  font-size: 13px;
  .van-icon {
    margin-left: 4px;
  }
}
</style>
