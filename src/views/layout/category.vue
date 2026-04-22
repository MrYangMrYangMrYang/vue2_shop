<template>
  <div class="category">
    <!-- 分类 -->
    <van-nav-bar title="全部分类" fixed />

    <!-- 搜索框 -->
    <van-search
      readonly
      shape="round"
      background="#f1f1f2"
      placeholder="请输入搜索关键词"
      @click="$router.push('/search')"
    />

    <!-- 分类列表 -->
    <div class="list-box">
      <div class="left">
        <ul>
          <li v-for="(item, index) in list" :key="item.category_id">
            <!-- 动态类名绑定 :class --当 index 等于 activeIndex 时，为 <a> 标签添加 active 类名。用于高亮当前选中的项。 -->
            <!-- 点击事件 @click -- 点击链接时，将 activeIndex 设置为当前项的 index。实现点击切换激活状态。 -->
            <!-- href="javascript:;" -- 阻止链接默认跳转行为 -->
            <a :class="{ active: index === activeIndex }" @click="activeIndex = index" href="javascript:;">{{ item.name }}</a>
          </li>
        </ul>
      </div>
      <div class="right">
        <!-- item in list[activeIndex]?.children：它遍历 list 数组中，索引为 activeIndex 的元素的 children 属性。 -->
        <!-- ?. (可选链操作符)：这是一个安全措施。如果 list[activeIndex] 为 null 或 undefined，则不会尝试访问其 .children 属性，从而避免运行时错误。以下同理 -->
        <div @click="$router.push(`/searchlist?categoryId=${item.category_id}`)" v-for="item in list[activeIndex]?.children" :key="item.category_id" class="cate-goods">
          <img :src="item.image?.external_url" alt="">
          <p>{{ item.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCategoryData } from '@/api/category'
export default {
  name: 'CategoryPage',
  created () {
    this.getCategoryList()
  },
  data () {
    return {
      list: [],
      activeIndex: 0
    }
  },
  methods: {
    async getCategoryList () {
      const { data: { list } } = await getCategoryData()
      // console.log(list)
      this.list = list
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

// 主题 padding
.category {
  padding-top: 96px; // 46 (navbar) + 50 (search)
  padding-bottom: 50px;
  height: 100vh;
  background-color: #fff;

  .list-box {
    height: 100%;
    display: flex;
    .left {
      width: 85px;
      height: 100%;
      background-color: @gray-color;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;

      a {
        display: block;
        height: 50px;
        line-height: 50px;
        text-align: center;
        color: @text-color;
        font-size: 13px;
        transition: @transition-base;
        position: relative;

        &.active {
          color: @primary-color;
          background-color: #fff;
          font-weight: 500;
          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 16px;
            background-color: @primary-color;
          }
        }

        &:active:not(.active) {
          background-color: darken(@gray-color, 3%);
        }
      }
    }
    .right {
      flex: 1;
      height: 100%;
      background-color: #ffffff;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: @spacing-md;
      padding: @spacing-lg;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      align-content: flex-start;

      .cate-goods {
        width: 100%;
        margin-bottom: @spacing-sm;
        transition: @transition-base;

        &:active {
          transform: scale(@active-scale);
          opacity: @active-opacity;
        }

        img {
          width: 100%;
          aspect-ratio: 1/1; // 保持比例防止抖动
          object-fit: contain;
          display: block;
          margin: 0 auto @spacing-xs;
        }
        p {
          text-align: center;
          font-size: 12px;
          color: @text-color;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}

// 导航条样式定制
.van-nav-bar {
  z-index: 999;
}

// 搜索框样式定制
.van-search {
  position: fixed;
  width: 100%;
  top: 46px;
  z-index: 999;
}
</style>
