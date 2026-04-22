<template>
  <div class="cart">
    <van-nav-bar title="购物车" fixed />

    <div v-if="isLogin && cartList.length > 0">
      <!-- 购物车开头 -->
      <div class="cart-title">
        <span class="all">共<i>{{ cartTotal }}</i>件商品</span>
        <span class="edit" @click="isEdit = !isEdit">
          <van-icon name="edit" />
          编辑
        </span>
      </div>

      <!-- 购物车列表 -->
      <div class="cart-list">
        <div class="cart-item" v-for="item in cartList" :key="item.goods_id">
          <van-checkbox @click="toggleCheck(item.goods_id)"  :value="item.isChecked"></van-checkbox>
          <div class="show">
            <img :src="item.goods.goods_image" alt="">
          </div>
          <div class="info">
            <span class="tit text-ellipsis-2">{{ item.goods.goods_name }}</span>
            <span class="bottom">
              <div class="price">¥ <span>{{ formatPrice(item.goods.goods_price_min) }}</span></div>
              <!-- 既希望保留原本的形参，又需要通过调用函数传参 => 可以通过箭头函数多包装一层来实现 -->
              <CountBox @input="(value) => changeCount(value, item.goods_id, item.goods_sku_id)" :value="item.goods_num"></CountBox>
            </span>
          </div>
        </div>
      </div>

      <!-- 底部结算栏 (使用 Vant 组件) -->
      <van-submit-bar
        v-if="!isEdit"
        :price="selPrice * 100"
        :button-text="'结算(' + selCount + ')'"
        :disabled="selCount === 0"
        @submit="goPay"
        class="submit-bar"
      >
        <van-checkbox @click="toggleAllCheck" :value="isAllChecked">全选</van-checkbox>
      </van-submit-bar>

      <!-- 编辑状态下的删除栏 -->
      <div class="footer-fixed" v-else>
        <div @click="toggleAllCheck" class="all-check">
          <van-checkbox :value="isAllChecked" icon-size="18"></van-checkbox>
          全选
        </div>
        <div class="all-total">
          <div @click="handleDel" class="delete" :class="{ disabled: selCount === 0 }">删除</div>
        </div>
      </div>
    </div>

    <div class="empty-cart" v-else>
      <img src="@/assets/empty.png" alt="">
      <div class="tips">
        您的购物车是空的, 快去逛逛吧
      </div>
      <div class="btn" @click="$router.push('/')">去逛逛</div>
    </div>

  </div>
</template>

<script>
import CountBox from '@/components/CountBox.vue'
import { mapGetters, mapState } from 'vuex'
import { formatPrice } from '@/utils/format'

export default {
  name: 'CartPage',
  components: {
    CountBox
  },
  data () {
    return {
      isEdit: false // 默认编辑状态
    }
  },
  computed: {
    ...mapState('cart', ['cartList']),
    ...mapGetters('cart', ['cartTotal', 'selCartList', 'selCount', 'selPrice', 'isAllChecked']),
    isLogin () {
      return this.$store.getters.token
    }
  },
  created () {
    // 必须是登录过的用户，才能用户购物车列表
    if (this.isLogin) {
      this.$store.dispatch('cart/getCartAction')
    }
  },
  methods: {
    formatPrice,
    // 选中取反
    toggleCheck (goodsId) {
      this.$store.commit('cart/toggleCheck', goodsId)
    },
    // 全选反选
    toggleAllCheck () {
      this.$store.commit('cart/toggleAllCheck', !this.isAllChecked)
    },
    // 更改数量
    changeCount (goodsNum, goodsId, goodsSkuId) {
      // console.log(goodsNum, goodsId, goodsSkuId)
      // 调用 vuex 的 action，进行数量的修改
      this.$store.dispatch('cart/changeCountAction', {
        goodsNum,
        goodsId,
        goodsSkuId
      })
    },
    // 删除商品
    async handleDel () {
      if (this.selCount === 0) return
      await this.$store.dispatch('cart/delSelectAction')
      this.$toast('删除成功')
      this.isEdit = false
    },
    goPay () {
      // 判断有没有选中商品
      if (this.selCount > 0) {
        // 有选中的 商品 才进行结算跳转
        this.$router.push({
          path: '/pay',
          query: {
            mode: 'cart',
            cartIds: this.selCartList.map(item => item.id).join(',') // 'cartId,cartId,cartId'
          }
        })
      }
    }
  },
  // 监视编辑状态的改动
  watch: {
    isEdit (value) {
      if (value) {
        this.$store.commit('cart/toggleAllCheck', false)
      } else {
        this.$store.commit('cart/toggleAllCheck', true)
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

// 主题 padding
.cart {
  padding-top: 46px;
  padding-bottom: 100px;
  background-color: #f5f5f5;
  min-height: 100vh;
  .cart-title {
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    font-size: 14px;
    .all {
      i {
        font-style: normal;
        margin: 0 2px;
        color: @price-color;
        font-size: 16px;
      }
    }
    .edit {
      .van-icon {
        font-size: 18px;
      }
    }
  }

  .cart-item {
    margin: 0 10px 10px 10px;
    padding: 10px;
    display: flex;
    justify-content: space-between;
    background-color: #ffffff;
    border-radius: @border-radius;

    .show img {
      width: 100px;
      height: 100px;
      object-fit: contain;
    }
    .info {
      flex: 1;
      padding: 0 5px 0 10px;
      font-size: 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .price {
          display: flex;
          align-items: flex-end;
          color: @price-color;
          font-size: 12px;
          span {
            font-size: 16px;
            font-weight: bold;
          }
        }
      }
    }
  }

  .submit-bar {
    bottom: 50px;
  }

  .footer-fixed {
    position: fixed;
    left: 0;
    bottom: 50px;
    height: 50px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    background-color: #fff;
    border-top: 1px solid #eee;
    z-index: 999;
    .all-check {
      display: flex;
      align-items: center;
      .van-checkbox {
        margin-right: 5px;
      }
    }
    .all-total {
      display: flex;
      align-items: center;
      .delete {
        width: 110px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        background-color: @primary-color;
        color: #fff;
        border-radius: 20px;
        font-size: 14px;
        &.disabled {
          background-color: #ff9999;
        }
      }
    }
  }

  .empty-cart {
    padding: 80px 30px;
    text-align: center;
    img {
      width: 140px;
      height: 92px;
      margin-bottom: 20px;
    }
    .tips {
      color: #999;
      margin-bottom: 20px;
    }
    .btn {
      width: 150px;
      height: 40px;
      line-height: 40px;
      margin: 0 auto;
      background-color: @primary-color;
      color: #fff;
      border-radius: 20px;
    }
  }
}
</style>
