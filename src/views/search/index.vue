<template>
  <div class="search">
    <van-nav-bar title="商品搜索" left-arrow @click-left="$router.go(-1)" />

    <van-search v-model="search" show-action placeholder="请输入搜索关键词" clearable>
      <template #action>
        <div @click="goSearch(search)">搜索</div>
      </template>
    </van-search>

    <!-- 搜索历史 -->
    <div class="search-history" v-if="historyData.length > 0">
      <div class="title">
        <span>最近搜索</span>
        <van-icon @click="clear" name="delete-o" size="16" />
      </div>
      <div class="list">
        <div v-for="item in historyData" :key="item" @click="goSearch(item)" class="list-item">
          {{ item }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 导入存储模块
import { getHistoryList, setHistoryList } from '@/utils/storage'
export default {
  name: 'SearchPage',
  data () {
    return {
      search: '', // 搜索框的内容
      historyData: getHistoryList() // 历史记录
    }
  },
  methods: {
    goSearch (key) {
      // console.log('进行了搜索，搜索历史要更新', key)
      const index = this.historyData.indexOf(key)
      if (index !== -1) {
        // 存在相同的项，将原有关键字移除
        // splice(从哪开始删除, 从这一项开始删除几个)
        this.historyData.splice(index, 1)
      }
      // 追加到数组的第一位
      this.historyData.unshift(key)
      // 将历史数据存储到本地
      setHistoryList(this.historyData)

      // 跳转到搜索列表页
      this.$router.push(`/searchlist?search=${key}`)
    },

    // 清空历史记录
    clear () {
      // 清除页面的历史数据
      this.historyData = []
      // 清除本地的历史数据
      setHistoryList([])
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.search {
  background-color: #fff;
  min-height: 100vh;

  .searchBtn {
    background-color: @price-color;
    color: #fff;
    border-radius: 4px;
    padding: 0 @spacing-md;
  }

  ::v-deep .van-search__action {
    background-color: @primary-color;
    color: #fff;
    padding: 0 @spacing-lg;
    border-radius: 0 4px 4px 0;
    margin-right: @spacing-md;
    font-weight: 500;
    transition: @transition-base;
    &:active {
      opacity: @active-opacity;
    }
  }

  ::v-deep .van-icon-arrow-left {
    color: @text-color;
  }

  .search-history {
    padding: @spacing-lg;

    .title {
      height: 40px;
      line-height: 40px;
      font-size: 15px;
      font-weight: 500;
      color: @text-color;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: @spacing-md;
    }

    .list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: @spacing-md;
    }

    .list-item {
      text-align: center;
      padding: @spacing-sm @spacing-md;
      line-height: 1.2;
      border-radius: 20px;
      background: @gray-color;
      font-size: 13px;
      color: @text-color;
      border: 1px solid transparent;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      transition: @transition-base;

      &:active {
        background: darken(@gray-color, 5%);
        transform: scale(@active-scale);
      }
    }
  }
}
</style>
