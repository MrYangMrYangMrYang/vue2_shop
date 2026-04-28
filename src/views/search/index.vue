<template>
  <div class="search">
    <van-nav-bar title="商品搜索" left-arrow @click-left="$router.go(-1)" />

    <van-search v-model="search" show-action placeholder="请输入搜索关键词" clearable>
      <template #action>
        <div @click="goSearch(search)">搜索</div>
      </template>
    </van-search>

    <!-- 搜索发现 -->
    <div class="search-discover">
      <div class="title">搜索发现</div>
      <div class="list">
        <div v-for="item in hotKeywords" :key="item" @click="goSearch(item)" class="list-item">
          {{ item }}
        </div>
      </div>
    </div>

    <!-- 搜索历史 -->
    <div class="search-history" v-if="historyData.length > 0">
      <div class="title">
        <span>最近搜索</span>
        <van-icon @click="clear" name="delete-o" size="16" />
      </div>
      <div class="list">
        <div v-for="item in historyData" :key="item" class="list-item">
          <span @click="goSearch(item)">{{ item }}</span>
          <van-icon name="cross" size="12" @click.stop="removeHistory(item)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * SearchPage - 商品搜索入口页面组件
 * 核心功能：
 * 1. 搜索关键词录入：支持通过输入框手动录入关键词
 * 2. 搜索发现：展示后端配置或预设的热门搜索词
 * 3. 历史记录管理：
 *    - 基于本地存储 (LocalStorage) 持久化搜索历史
 *    - 自动去重与排序 (新搜索项置顶)
 *    - 限制存储条数 (最多 10 条)
 *    - 支持单条删除与一键清空历史
 * 4. 路由跳转：携带关键词跳转至商品列表结果页
 */
import { getHistoryList, setHistoryList } from '@/utils/storage'

export default {
  name: 'SearchPage',
  data () {
    return {
      search: '', // 当前搜索框输入的关键词
      historyData: getHistoryList(), // 从本地存储初始化的搜索历史列表
      hotKeywords: ['手机', '电脑', '耳机', '衣服', '鞋子', '零食', '水杯', '充电宝'] // 模拟的热门搜索词列表
    }
  },
  methods: {
    /**
     * 执行搜索逻辑
     * 1. 校验关键词合法性
     * 2. 更新本地历史记录 (去重、置顶、限额)
     * 3. 持久化存储
     * 4. 携带参数跳转
     * @param {String} key 搜索关键词
     */
    goSearch (key) {
      if (!key.trim()) return

      const index = this.historyData.indexOf(key)
      if (index !== -1) {
        // 若已存在，先移除旧项，实现“位置更新”
        this.historyData.splice(index, 1)
      }
      // 将最新搜索词插入首位
      this.historyData.unshift(key)

      // 维护历史记录容量
      if (this.historyData.length > 10) {
        this.historyData.pop()
      }

      // 同步到本地存储
      setHistoryList(this.historyData)

      // 跳转至搜索结果页
      this.$router.push(`/searchlist?search=${key}`)
    },

    /**
     * 删除单条指定的搜索历史
     * @param {String} key 要删除的关键词
     */
    removeHistory (key) {
      this.historyData = this.historyData.filter(item => item !== key)
      setHistoryList(this.historyData)
    },

    /**
     * 清空全部搜索历史
     * 包含确认弹窗提醒
     */
    clear () {
      this.$dialog.confirm({
        title: '温馨提示',
        message: '确认清空所有搜索历史吗？'
      }).then(() => {
        // 清除内存与本地持久化数据
        this.historyData = []
        setHistoryList([])
      }).catch(() => {
        // 用户取消操作
      })
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

  .search-history, .search-discover {
    padding: @spacing-lg;

    .title {
      height: 40px;
      line-height: 40px;
      font-size: @font-size-lg;
      display: flex;      justify-content: space-between;
      align-items: center;
      color: @text-color;
      font-weight: bold;
    }

    .list {
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;
      padding-top: @spacing-sm;

      .list-item {
        width: 30%;
        text-align: center;
        padding: @spacing-sm @spacing-md;
        font-size: @font-size-sm;
        border-radius: 50px;
        background: #f4f4f4;
        margin-right: 3%;
        margin-bottom: @spacing-md;
        color: @text-color-secondary;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        span {
          flex: 1;
        }

        .van-icon-cross {
          margin-left: 4px;
          color: #ccc;
          &:active {
            color: @primary-color;
          }
        }
      }
    }
  }

  .search-discover {
    padding-bottom: 0;
    .list-item {
      background-color: #fdf5f2;
      color: @price-color;
    }
  }
}
</style>
