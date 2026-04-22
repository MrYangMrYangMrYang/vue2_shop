<template>
  <div class="home">
    <!-- 导航条 -->
    <van-nav-bar title="智慧商城" fixed />

    <!-- 搜索框 -->
    <van-search
      readonly
      shape="round"
      background="#f1f1f2"
      placeholder="请在此输入搜索关键词"
      @click="$router.push('/search')"
    />

    <!-- 加载骨架屏 -->
    <van-skeleton title avatar :row="3" :loading="loading">
      <!-- 轮播图 -->
      <van-swipe class="my-swipe" :autoplay="3000" indicator-color="white">
        <van-swipe-item v-for="item in bannerList" :key="item.imgUrl">
          <img :src="item.imgUrl" alt="">
        </van-swipe-item>
      </van-swipe>

      <!-- 导航 -->
      <van-grid column-num="5" icon-size="40" :border="false">
        <van-grid-item
          v-for="item in navList" :key="item.imgUrl"
          :icon="item.imgUrl"
          text="新品首发"
          @click="$router.push('/category')"
        />
      </van-grid>

      <!-- 主会场 -->
      <div class="main">
        <img src="@/assets/main.png" alt="">
      </div>

      <!-- 猜你喜欢 -->
      <div class="guess">
        <van-divider
          :style="{ color: '#333', borderColor: '#ccc', padding: '0 16px' }"
        >
          猜你喜欢
        </van-divider>

        <div class="goods-list">
          <!-- 父传子，将数据item传到子组件 -->
          <GoodsItem v-for="item in prodList" :key="item.goods_id" :item="item"></GoodsItem>
        </div>

        <!-- 底部加载状态 -->
        <div class="bottom-status">
          <!-- 加载中 -->
          <div v-if="loadingMore" class="loading-more">
            <van-loading size="20" color="#1989fa" />
            <span>加载中...</span>
          </div>

          <!-- 没有更多数据 -->
          <div v-else-if="finished && prodList.length > 0" class="finished">
            <span class="line"></span>
            <span class="text">😊 已经到底啦 😊</span>
            <span class="line"></span>
          </div>

          <!-- 点击加载更多 -->
          <div v-else-if="!finished && prodList.length > 0" class="click-load" @click="loadMore">
            <span>点击加载更多</span>
            <van-icon name="arrow-down" size="16" />
          </div>
        </div>
      </div>
    </van-skeleton>

    <!-- 回到顶部按钮 -->
    <transition name="fade">
      <div v-show="showBackTop" class="back-top" @click="scrollToTop">
        <van-icon name="back-top" size="24" color="#fff" />
      </div>
    </transition>
  </div>
</template>

<script>
import GoodsItem from '@/components/GoodsItem.vue'
import { getHomeData } from '@/api/home'

export default {
  name: 'HomePage',
  components: {
    GoodsItem
  },
  data () {
    return {
      bannerList: [], // 轮播组
      navList: [], // 导航组
      prodList: [], // 商品组
      loading: true, // 骨架屏加载状态
      loadingMore: false, // 加载更多状态
      finished: false, // 是否加载完成
      currentPage: 1, // 当前页码
      showBackTop: false // 回到顶部按钮显示状态
    }
  },
  async created () {
    try {
      const { data: { pageData } } = await getHomeData()
      this.bannerList = pageData.items[1].data
      this.navList = pageData.items[3].data
      this.prodList = pageData.items[6].data || []
    } finally {
      this.loading = false
    }
  },
  mounted () {
    // 监听滚动事件
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeDestroy () {
    // 移除滚动监听
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    // 处理滚动事件（回到顶部按钮 + 触底加载）
    handleScroll () {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // 控制回到顶部按钮显示/隐藏（滚动超过400px显示）
      this.showBackTop = scrollTop > 400

      // 触底加载（距离底部100px时触发）
      if (!this.loadingMore && !this.finished && scrollTop + windowHeight >= documentHeight - 100) {
        this.loadMore()
      }
    },

    // 回到顶部
    scrollToTop () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    },

    // 加载更多数据
    async loadMore () {
      if (this.loadingMore || this.finished) return

      this.loadingMore = true

      try {
        // 模拟加载更多，实际使用时替换为真实API
        // const res = await getMoreData({ page: this.currentPage + 1 })

        // 这里使用初始数据API演示，实际应该有分页接口
        const { data: { pageData } } = await getHomeData()
        const newData = pageData.items[6].data || []

        // 模拟分页效果（实际API会返回新数据）
        if (this.currentPage < 3) {
          // 模拟加载新数据
          this.prodList = [...this.prodList, ...newData]
          this.currentPage++
        } else {
          // 模拟没有更多数据
          this.finished = true
          this.$toast({
            message: '没有更多商品了',
            duration: 1500,
            icon: 'smile'
          })
        }
      } catch (error) {
        this.$toast.fail('加载失败，请重试')
        console.error('加载更多失败:', error)
      } finally {
        this.loadingMore = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

// 主题 padding
.home {
  padding-top: 100px;
  padding-bottom: 50px;
}

// 导航条样式定制
.van-nav-bar {
  z-index: 999;
  background-color: @primary-color;
  ::v-deep .van-nav-bar__title {
    color: #fff;
  }
}

// 搜索框样式定制
.van-search {
  position: fixed;
  width: 100%;
  top: 46px;
  z-index: 999;
}

// 分类导航部分
.my-swipe .van-swipe-item {
  height: 185px;
  color: #fff;
  font-size: 20px;
  text-align: center;
  background-color: #39a9ed;
}
.my-swipe .van-swipe-item img {
  width: 100%;
  height: 185px;
}

// 主会场
.main img {
  display: block;
  width: 100%;
}

// 猜你喜欢
.guess .guess-title {
  height: 40px;
  line-height: 40px;
  text-align: center;
}

// 商品样式
.goods-list {
  background-color: #f6f6f6;
}

// 底部状态样式
.bottom-status {
  padding: 20px 0;

  .loading-more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #666;
    font-size: 14px;
  }

  .finished {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;

    .line {
      width: 40px;
      height: 1px;
      background-color: #ebedf0;
    }

    .text {
      color: #969799;
      font-size: 13px;
    }
  }

  .click-load {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 12px 0;
    color: #1989fa;
    font-size: 14px;
    cursor: pointer;

    &:active {
      opacity: 0.7;
    }
  }
}

// 回到顶部按钮
.back-top {
  position: fixed;
  right: 20px;
  bottom: 70px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #1989fa;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  z-index: 998;
  cursor: pointer;
  transition: all 0.3s;

  &:active {
    opacity: 0.8;
    transform: scale(0.95);
  }
}

// 淡入淡出动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
