<template>
  <div class="search">
    <van-nav-bar fixed title="商品列表" left-arrow @click-left="$router.go(-1)" />

    <van-search
      readonly
      shape="round"
      background="#ffffff"
      :value="querySearch || '搜索商品'"
      show-action
      @click="$router.push('/search')"
    >
      <template #action>
        <van-icon class="tool" name="apps-o" />
      </template>
    </van-search>

    <!-- 排序选项按钮 -->
    <div class="sort-btns">
      <div class="sort-item" :class="{ active: sortType === 'all' }" @click="toggleSort('all')">综合</div>
      <div class="sort-item" :class="{ active: sortType === 'sales' }" @click="toggleSort('sales')">销量</div>
      <div class="sort-item" :class="{ active: sortType === 'price' }" @click="toggleSort('price')">
        价格
        <van-icon v-if="sortType === 'price'" :name="sortPrice === 0 ? 'arrow-up' : 'arrow-down'" />
      </div>
    </div>

    <div class="goods-list">
      <GoodsItem v-for="item in prodList" :key="item.goods_id" :item="item"></GoodsItem>
    </div>
  </div>
</template>

<script>
import GoodsItem from '@/components/GoodsItem.vue'
import { getSearchData } from '@/api/search'
export default {
  name: 'SearchListPage',
  components: {
    GoodsItem
  },
  data () {
    return {
      page: 1,
      prodList: [],
      sortType: 'all', // all, sales, price
      sortPrice: 0 // 0: 升序, 1: 降序
    }
  },
  computed: {
    // 获取地址栏的搜索关键字
    querySearch () {
      return this.$route.query.search
    }
  },
  async created () {
    this.getSearchList()
  },
  methods: {
    async getSearchList () {
      const { data: { list } } = await getSearchData({
        categoryId: this.$route.query.categoryId,
        goodsName: this.querySearch,
        page: this.page,
        sortType: this.sortType,
        sortPrice: this.sortPrice
      })
      this.prodList = list.data
    },
    toggleSort (type) {
      if (type === 'price') {
        if (this.sortType === 'price') {
          // 切换升降序
          this.sortPrice = this.sortPrice === 0 ? 1 : 0
        } else {
          this.sortType = 'price'
          this.sortPrice = 0 // 默认价格升序
        }
      } else {
        this.sortType = type
      }
      this.page = 1 // 重置页码
      this.getSearchList()
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.search {
  padding-top: 46px;
  ::v-deep .van-icon-arrow-left {
    color: #333;
  }
  .tool {
    font-size: 24px;
    height: 40px;
    line-height: 40px;
  }

  .sort-btns {
    display: flex;
    height: 36px;
    line-height: 36px;
    .sort-item {
      text-align: center;
      flex: 1;
      font-size: 16px;
      color: #333;
      &.active {
        color: @primary-color;
        font-weight: bold;
      }
      .van-icon {
        font-size: 12px;
        margin-left: 2px;
      }
    }
  }
}

// 商品样式
.goods-list {
  background-color: #f6f6f6;
}
</style>
