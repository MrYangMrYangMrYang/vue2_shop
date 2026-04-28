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
/**
 * SearchListPage - 商品列表页组件
 * 核心功能：
 * 1. 根据搜索关键字或分类 ID 展示商品列表
 * 2. 提供多种排序方式：综合、销量、价格
 * 3. 支持价格升降序切换
 * 4. 集成 GoodsItem 组件展示单项商品信息
 */
import GoodsItem from '@/components/GoodsItem.vue'
import { getSearchData } from '@/api/search'
export default {
  name: 'SearchListPage',
  components: {
    GoodsItem
  },
  data () {
    return {
      page: 1, // 当前页码
      prodList: [], // 商品列表数据
      sortType: 'all', // 排序类型：all(综合), sales(销量), price(价格)
      sortPrice: 0, // 价格排序：0(升序), 1(降序)
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
    /**
     * 从路由中获取搜索关键字
     */
    querySearch () {
      return this.$route.query.search
    }
  },
  async created () {
    this.getSearchList()
  },
  methods: {
    /**
     * 获取搜索结果列表
     */
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
        // 错误处理
      }
    },
    /**
     * 切换排序类型
     */
    onSortTypeChange () {
      // 切换类型时，设置默认的升降序逻辑
      if (this.sortType === 'sales') {
        this.sortPrice = 1 // 销量默认降序
      } else if (this.sortType === 'price') {
        this.sortPrice = 0 // 价格默认升序
      }
      this.page = 1
      this.getSearchList()
    },
    /**
     * 切换价格升降序
     */
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
