<template>
  <div class="category">
    <!-- 导航条 -->
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
      <!-- 左侧一级分类 -->
      <div class="left">
        <ul>
          <li v-for="(item, index) in list" :key="item.category_id">
            <a
              :class="{ active: index === activeIndex }"
              @click="activeIndex = index"
              href="javascript:;"
            >
              <span class="name">{{ item.name }}</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- 右侧二级分类 -->
      <div class="right">
        <!-- 当前分类标题 -->
        <div v-if="list[activeIndex]?.children?.length" class="category-header">
          <h3>{{ list[activeIndex].name }}</h3>
          <span class="count">{{ list[activeIndex].children.length }}个分类</span>
        </div>

        <!-- 分类网格 -->
        <div class="category-grid">
          <div
            @click="$router.push(`/searchlist?categoryId=${item.category_id}`)"
            v-for="item in list[activeIndex]?.children"
            :key="item.category_id"
            class="cate-item"
          >
            <div class="img-wrapper">
              <img :src="item.image?.external_url || defaultImg" alt="">
            </div>
            <p class="name">{{ item.name }}</p>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!list[activeIndex]?.children?.length" class="empty-state">
          <van-icon name="apps-o" size="48" color="#dcdee0" />
          <p>暂无分类</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * CategoryPage - 商品分类页面组件
 * 核心功能：
 * 1. 联动式双栏布局：左侧展示一级分类，右侧展示对应的二级分类网格
 * 2. 初始数据获取与智能索引：自动选中第一个包含子分类的项目
 * 3. 搜索入口集成：点击顶部搜索框跳转至搜索页
 * 4. 分类导航逻辑：点击二级分类跳转至对应的商品列表页 (SearchList)
 */
import { getCategoryData } from '@/api/category'

export default {
  name: 'CategoryPage',
  data () {
    return {
      list: [], // 分类树形数据列表
      activeIndex: 0, // 当前激活的一级分类索引
      defaultImg: 'https://img01.yzcdn.cn/vant/cat.jpeg' // 缺省图
    }
  },
  created () {
    this.getCategoryList()
  },
  methods: {
    /**
     * 获取全部分类数据
     */
    async getCategoryList () {
      try {
        const { data: { list } } = await getCategoryData()
        this.list = list

        // 体验优化：初始化时自动定位到第一个有内容的分类
        const firstValidIndex = list.findIndex(item => item.children?.length > 0)
        if (firstValidIndex !== -1) {
          this.activeIndex = firstValidIndex
        }
      } catch (error) {
        this.$toast.fail('加载分类失败')
        console.error('分类加载失败:', error)
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.category {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  box-sizing: border-box;

  .list-box {
    flex: 1;
    display: flex;
    overflow: hidden;
    margin-top: 96px;
    margin-bottom: 50px;

    // 左侧一级分类
    .left {
      width: 90px;
      height: 100%;
      background-color: #f7f8fa;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      flex-shrink: 0;

      &::-webkit-scrollbar {
        display: none;
      }

      ul {
        padding: 0;
        margin: 0;
      }

      li {
        list-style: none;

        a {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 50px;
          padding: 8px 6px;
          color: #646566;
          font-size: 14px;
          transition: all 0.2s ease;
          position: relative;
          text-align: center;
          word-break: break-word;
          box-sizing: border-box;

          .name {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            line-height: 1.4;
          }

          &.active {
            color: @primary-color;
            background-color: #fff;
            font-weight: 600;
            font-size: 15px;

            &::before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              bottom: 0;
              width: 3px;
              background: linear-gradient(180deg, @primary-color, lighten(@primary-color, 20%));
              border-radius: 0 2px 2px 0;
            }
          }

          &:active:not(.active) {
            background-color: #eeeef0;
          }
        }
      }
    }

    // 右侧内容区
    .right {
      flex: 1;
      height: 100%;
      background-color: #fff;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      padding: 0 12px 20px;

      &::-webkit-scrollbar {
        display: none;
      }

      .category-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 50px; // 与左侧 a 标签最小高度一致
        padding: 8px 0; // 与左侧 a 标签内边距一致
        margin-bottom: 8px;
        border-bottom: 1px solid #ebedf0;
        box-sizing: border-box;

        h3 {
          font-size: 16px;
          font-weight: 600;
          color: #323233;
          margin: 0;
        }

        .count {
          font-size: 12px;
          color: #969799;
        }
      }

      .category-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px 12px;

        .cate-item {
          cursor: pointer;
          transition: transform 0.15s ease;

          &:active {
            transform: scale(0.96);
          }

          .img-wrapper {
            width: 100%;
            aspect-ratio: 1/1;
            background: linear-gradient(135deg, #f8f9fa, #f0f1f2);
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
            }
          }

          .name {
            text-align: center;
            font-size: 12px;
            color: #323233;
            line-height: 1.4;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding: 0 2px;
            margin: 0;
          }
        }
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;

        p {
          margin-top: 12px;
          color: #969799;
          font-size: 14px;
        }
      }
    }
  }
}

// 导航条样式
.van-nav-bar {
  z-index: 999;
  ::v-deep .van-nav-bar__title {
    font-weight: 600;
  }
}

// 搜索框样式
.van-search {
  position: fixed;
  width: 100%;
  top: 46px;
  z-index: 999;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}
</style>
