<template>
  <div class="cart">
    <van-nav-bar
      title="购物车"
      fixed
      :left-arrow="$route.query.from === 'prodetail'"
      @click-left="$router.go(-1)"
    />

    <!-- 已登录且有商品 -->
    <div v-if="isLogin && cartList.length > 0" class="cart-content">
      <!-- 购物车头部 -->
      <div class="cart-header">
        <div class="total-info">
          <span class="label">共</span>
          <i class="count">{{ cartTotal }}</i>
          <span class="label">件商品</span>
        </div>
        <div class="edit-btn" @click="isEdit = !isEdit">
          <span>{{ isEdit ? '完成' : '管理' }}</span>
        </div>
      </div>

      <!-- 购物车列表 -->
      <div class="cart-list">
        <div
          class="cart-item"
          v-for="item in cartList"
          :key="item.goods_id"
          :class="{ 'item-checked': item.isChecked }"
        >
          <van-checkbox
            @click="toggleCheck(item.goods_id)"
            :value="item.isChecked"
            icon-size="20"
            checked-color="#ee0a24"
          ></van-checkbox>

          <div class="goods-image" @click="$router.push(`/prodetail/${item.goods_id}`)">
            <img :src="item.goods.goods_image" alt="">
            <span v-if="item.goods.is_new" class="tag">新品</span>
          </div>

          <div class="goods-info">
            <p class="name text-ellipsis-2" @click="$router.push(`/prodetail/${item.goods_id}`)">
              {{ item.goods.goods_name }}
            </p>

            <div class="spec" v-if="item.goods_sku_text">
              <span>{{ item.goods_sku_text }}</span>
            </div>

            <div class="price-box">
              <div class="price">
                <span class="symbol">¥</span>
                <span class="value">{{ formatPrice(item.goods.goods_price_min) }}</span>
              </div>

              <CountBox
                @input="(value) => changeCount(value, item.goods_id, item.goods_sku_id)"
                :value="item.goods_num"
                :min="1"
                :max="item.goods.stock || 999"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="footer-bar">
        <!-- 普通模式：结算栏 -->
        <div class="submit-bar" v-if="!isEdit">
          <div class="select-all" @click="toggleAllCheck">
            <van-checkbox
              :value="isAllChecked"
              icon-size="20"
              checked-color="#ee0a24"
            >
              <span class="select-text">全选</span>
            </van-checkbox>
          </div>

          <div class="total-price">
            <span class="label">合计：</span>
            <span class="price">¥{{ formatPrice(selPrice) }}</span>
          </div>

          <div
            class="pay-btn"
            :class="{ disabled: selCount === 0 }"
            @click="goPay"
          >
            结算({{ selCount }})
          </div>
        </div>

        <!-- 编辑模式：操作栏 -->
        <div class="edit-bar" v-else>
          <div class="select-all" @click="toggleAllCheck">
            <van-checkbox
              :value="isAllChecked"
              icon-size="20"
              checked-color="#ee0a24"
            >
              <span class="select-text">全选</span>
            </van-checkbox>
          </div>

          <div class="action-buttons">
            <div
              class="action-btn favorite-btn"
              :class="{ disabled: selCount === 0 }"
              @click="handleBatchFavorite"
            >
              <van-icon name="star-o" size="16" />
              <span>收藏</span>
            </div>
            <div
              class="action-btn delete-btn"
              :class="{ disabled: selCount === 0 }"
              @click="handleDel"
            >
              <van-icon name="delete-o" size="16" />
              <span>删除</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空购物车 -->
    <div class="empty-cart" v-else>
      <van-empty
        class="custom-image"
        :image="require('@/assets/empty.png')"
        description="购物车还是空的哦，快去挑选心仪的商品吧"
      >
        <van-button
          round
          type="danger"
          class="bottom-button"
          @click="$router.push('/')"
        >
          去逛逛
        </van-button>
      </van-empty>

      <div class="recommend-section" v-if="!isLogin">
        <div class="section-title">
          <span class="line"></span>
          <span class="text">热门推荐</span>
          <span class="line"></span>
        </div>
        <div class="recommend-list">
          <div class="rec-item" v-for="i in 3" :key="i" @click="$router.push('/category')">
            <img src="https://img01.yzcdn.cn/vant/ipad.jpeg" alt="">
            <p class="rec-name">热门商品 {{ i }}</p>
            <p class="rec-price">¥99.00</p>
          </div>
        </div>
      </div>

      <!-- 底部安全距离 - 防止被底部导航栏遮挡 -->
      <div class="safe-bottom"></div>
    </div>
  </div>
</template>

<script>
/**
 * CartPage - 购物车页面组件
 * 核心功能：
 * 1. 列表展示：基于 Vuex 同步展示用户购物车商品
 * 2. 交互管理：
 *    - 商品选择 (单选/全选)
 *    - 数量修改 (CountBox 联动 Vuex Action)
 *    - 编辑模式切换 (支持批量删除、批量收藏)
 * 3. 价格计算：实时计算选中商品的总价与总数
 * 4. 结算流程：携带选中商品 ID 跳转至结算页 (Pay)
 * 5. 异常处理：区分未登录、空购物车等多种状态展示
 */
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
      isEdit: false // 是否处于编辑模式 (管理状态)
    }
  },
  computed: {
    ...mapState('cart', ['cartList']),
    ...mapGetters('cart', ['cartTotal', 'selCartList', 'selCount', 'selPrice', 'isAllChecked']),
    /**
     * 判断当前登录状态
     */
    isLogin () {
      return this.$store.getters.token
    }
  },
  created () {
    // 进入购物车页面，若已登录则立即同步最新的购物车数据
    if (this.isLogin) {
      this.$store.dispatch('cart/getCartAction')
    }
  },
  methods: {
    formatPrice,

    /**
     * 切换单个商品的选中状态
     * @param {Number} goodsId
     */
    toggleCheck (goodsId) {
      this.$store.commit('cart/toggleCheck', goodsId)
    },

    /**
     * 全选/取消全选
     */
    toggleAllCheck () {
      this.$store.commit('cart/toggleAllCheck', !this.isAllChecked)
    },

    /**
     * 修改商品数量
     * @param {Number} goodsNum 新数量
     * @param {Number} goodsId 商品ID
     * @param {Number} goodsSkuId 规格ID
     */
    changeCount (goodsNum, goodsId, goodsSkuId) {
      this.$store.dispatch('cart/changeCountAction', {
        goodsNum,
        goodsId,
        goodsSkuId
      })
    },

    /**
     * 批量删除选中的商品
     */
    async handleDel () {
      if (this.selCount === 0) return

      try {
        await this.$dialog.confirm({
          title: '删除商品',
          message: `确定要删除选中的 ${this.selCount} 件商品吗？`,
          confirmButtonText: '删除',
          confirmButtonColor: '#ee0a24',
          cancelButtonText: '取消'
        })

        // 异步调用 Vuex Action 执行后端删除
        await this.$store.dispatch('cart/delSelectAction')
        this.$toast.success('删除成功')
        this.isEdit = false
      } catch (error) {
        // 用户取消删除或接口异常
      }
    },

    /**
     * 批量收藏选中的商品 (模拟)
     */
    handleBatchFavorite () {
      if (this.selCount === 0) return
      this.$toast.success('已移入收藏夹')
      this.isEdit = false
    },

    /**
     * 跳转至结算页
     */
    goPay () {
      if (this.selCount === 0) return

      this.$router.push({
        path: '/pay',
        query: {
          mode: 'cart',
          // 传递选中项的 ID 字符串，供结算页获取数据
          cartIds: this.selCartList.map(item => item.id).join(',')
        }
      })
    }
  },
  watch: {
    isEdit (value) {
      if (value) {
        this.$store.commit('cart/toggleAllCheck', false)
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.cart {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-top: 46px; // 导航条高度

  .cart-content {
    padding-bottom: 70px; // 底部操作栏高度
  }

  // 头部
  .cart-header {
    position: fixed;
    top: 46px; // 紧贴导航条下方
    left: 0;
    right: 0;
    height: 48px;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    z-index: 99;
    border-bottom: 1px solid #ebedf0;

    .total-info {
      font-size: 14px;
      color: #323233;

      .count {
        font-style: normal;
        color: @price-color;
        font-weight: 600;
        margin: 0 2px;
      }
    }

    .edit-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #646566;
      font-size: 14px;
      cursor: pointer;

      &:active {
        opacity: 0.7;
      }
    }
  }

  // 购物车列表
  .cart-list {
    padding: 60px 12px 0; // 给头部留出空间

    .cart-item {
      display: flex;
      align-items: center;
      background-color: #fff;
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 12px;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

      &.item-checked {
        background-color: #fff9f9;
      }

      .goods-image {
        width: 90px;
        height: 90px;
        margin: 0 12px;
        position: relative;
        cursor: pointer;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }

        .tag {
          position: absolute;
          top: 0;
          left: 0;
          background: linear-gradient(135deg, #ff6b6b, @price-color);
          color: #fff;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 8px 0 6px 0;
        }
      }

      .goods-info {
        flex: 1;
        min-width: 0;

        .name {
          font-size: 14px;
          color: #323233;
          line-height: 1.4;
          margin-bottom: 6px;
          cursor: pointer;

          &:active {
            color: @primary-color;
          }
        }

        .spec {
          font-size: 12px;
          color: #969799;
          margin-bottom: 8px;
          background-color: #f7f8fa;
          padding: 2px 8px;
          border-radius: 4px;
          display: inline-block;
        }

        .price-box {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .price {
            color: @price-color;

            .symbol {
              font-size: 12px;
            }

            .value {
              font-size: 18px;
              font-weight: 700;
            }
          }
        }
      }
    }
  }

  // 底部操作栏
  .footer-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 50px; // 底部导航栏高度
    height: 60px;
    background-color: #fff;
    border-top: 1px solid #ebedf0;
    z-index: 100;

    .submit-bar {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 16px;

      .select-all {
        flex-shrink: 0;
        cursor: pointer;

        .select-text {
          margin-left: 8px;
          font-size: 14px;
          color: #323233;
        }
      }

      .total-price {
        flex: 1;
        text-align: right;
        margin-right: 16px;

        .label {
          font-size: 14px;
          color: #323233;
        }

        .price {
          font-size: 20px;
          font-weight: 700;
          color: @price-color;
        }
      }

      .pay-btn {
        width: 110px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        background: linear-gradient(135deg, lighten(@price-color, 10%), @price-color);
        color: #fff;
        border-radius: 20px;
        font-size: 15px;
        font-weight: 500;
        transition: all 0.2s ease;
        cursor: pointer;

        &:active {
          opacity: 0.8;
          transform: scale(0.98);
        }

        &.disabled {
          opacity: 0.5;
          pointer-events: none;
        }
      }
    }

    .edit-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 0 16px;

      .select-all {
        cursor: pointer;

        .select-text {
          margin-left: 8px;
          font-size: 14px;
          color: #323233;
        }
      }

      .action-buttons {
        display: flex;
        gap: 12px;

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 14px;
          transition: all 0.2s ease;
          cursor: pointer;

          &:active {
            opacity: 0.8;
            transform: scale(0.96);
          }

          &.disabled {
            opacity: 0.4;
            pointer-events: none;
          }

          &.favorite-btn {
            background-color: #fff7f0;
            color: #ff976a;
            border: 1px solid #ffe0cc;
          }

          &.delete-btn {
            background-color: @price-color;
            color: #fff;
          }
        }
      }
    }
  }

  // 空购物车
  .empty-cart {
    min-height: calc(100vh - 46px);
    background-color: #fff;
    padding-bottom: 20px; // 添加底部内边距
    box-sizing: border-box;
    padding-top: 100px;

    .custom-image {
      padding: 0;
      ::v-deep .van-empty__image {
        width: 160px;
        height: 160px;
      }
    }

    .bottom-button {
      width: 160px;
      height: 40px;
    }

    .recommend-section {
      padding: 20px 16px;

      .section-title {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;

        .line {
          width: 40px;
          height: 1px;
          background-color: #ebedf0;
        }

        .text {
          margin: 0 16px;
          font-size: 14px;
          color: #969799;
        }
      }

      .recommend-list {
        display: flex;
        gap: 12px;

        .rec-item {
          flex: 1;
          cursor: pointer;
          text-align: center; // 添加这一行，让文字和数字居中

          img {
            width: 100%;
            aspect-ratio: 1/1;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 8px;
          }

          .rec-name {
            font-size: 13px;
            color: #323233;
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .rec-price {
            font-size: 15px;
            font-weight: 600;
            color: @price-color;
          }
        }
      }
    }

    // 底部安全距离 - 防止被底部导航栏遮挡
    .safe-bottom {
      height: 50px;
      width: 100%;
    }
  }
}

// 导航条样式
.van-nav-bar {
  z-index: 999 !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  ::v-deep .van-nav-bar__title {
    font-weight: 600;
  }
}

.text-ellipsis-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-all;
}
</style>
