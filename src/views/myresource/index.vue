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

      <!-- 余额/积分/优惠券 简单展示 -->
      <div v-else class="simple-info">
        <van-cell-group inset>
          <van-cell title="当前数值" :value="currentValue" />
          <van-cell title="记录明细" is-link @click="$toast('明细功能开发中...')" />
        </van-cell-group>
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
      list: []
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
        balance: '账户余额',
        points: '我的积分',
        coupon: '优惠券'
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
      }
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
</style>
