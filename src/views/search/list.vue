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
        <div @click="$router.push('/search')">搜索</div>
      </template>
    </van-search>

    <!-- 排序选项 -->
    <van-dropdown-menu class="sort-dropdown" active-color="#fa2209">
      <van-dropdown-item v-model="sortType" :options="sortOptions" @change="onSortTypeChange" />
      <van-dropdown-item v-model="sortPrice" :options="priceOptions" @change="onSortPriceChange" />
    </van-dropdown-menu>

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
      sortPrice: 0, // 0: 升序, 1: 降序
      sortOptions: [
        { text: '综合排序', value: 'all' },
        { text: '销量排序', value: 'sales' },
        { text: '价格排序', value: 'price' }
      ],
      priceOptions: [
        { text: '升序排列', value: 0 },
        { text: '降序排列', value: 1 }
      ]
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
      try {
        const { data: { list } } = await getSearchData({
          categoryId: this.$route.query.categoryId,
          goodsName: this.querySearch,
          page: this.page,
          sortType: this.sortType,
          sortPrice: this.sortPrice
        })
        this.prodList = list.data
      } catch (e) {
        // console.log(e)
      }
    },
    onSortTypeChange () {
      // 切换类型时，根据类型设置默认的升降序
      if (this.sortType === 'sales') {
        this.sortPrice = 1 // 销量默认降序
      } else if (this.sortType === 'price') {
        this.sortPrice = 0 // 价格默认升序
      }
      this.page = 1
      this.getSearchList()
    },
    onSortPriceChange () {
      this.page = 1
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

  .sort-dropdown {
    position: sticky;
    top: 46px;
    z-index: 999;
  }
}

// 商品样式
.goods-list {
  background-color: #f6f6f6;
}
</style>
