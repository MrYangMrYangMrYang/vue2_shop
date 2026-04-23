<template>
  <transition name="page-fade">
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

        <!-- 秒杀模块 -->
        <div class="seckill-section">
          <div class="seckill-header">
            <div class="left">
              <span class="title">限时秒杀</span>
              <van-count-down :time="seckillTime">
                <template #default="timeData">
                  <span class="block">{{ formatTime(timeData.hours) }}</span>
                  <span class="colon">:</span>
                  <span class="block">{{ formatTime(timeData.minutes) }}</span>
                  <span class="colon">:</span>
                  <span class="block">{{ formatTime(timeData.seconds) }}</span>
                </template>
              </van-count-down>
            </div>
            <div class="right" @click="$router.push('/category')">
              更多 <van-icon name="arrow" />
            </div>
          </div>
          <div class="seckill-list">
            <div v-for="i in 3" :key="i" class="seckill-item" @click="$router.push('/category')">
              <div class="img-wrapper">
                <img src="https://img01.yzcdn.cn/vant/ipad.jpeg" alt="">
                <div class="tag">热卖</div>
              </div>
              <div class="price">
                <span class="current">¥9.9</span>
                <span class="old">¥99</span>
              </div>
              <div class="progress">
                <div class="progress-bar" :style="{ width: 60 + i * 10 + '%' }"></div>
                <span class="progress-text">已抢{{ 60 + i * 10 }}%</span>
              </div>
            </div>
          </div>
        </div>

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
            <GoodsItem
              v-for="(item, index) in prodList"
              :key="item.goods_id + '_' + index"
              :item="item"
            ></GoodsItem>
          </div>

          <!-- 底部加载状态 -->
          <div class="bottom-status">
            <!-- 加载中 -->
            <div v-if="loadingMore" class="loading-more">
              <van-loading size="20" color="#1989fa" />
              <span>加载中...</span>
            </div>

            <!-- 没有更多数据 -->
            <div v-else-if="finished" class="finished">
              <span class="line"></span>
              <span class="text">😊 已经到底啦</span>
              <span class="line"></span>
            </div>
          </div>
        </div>
      </van-skeleton>

      <!-- 回到顶部按钮 -->
      <transition name="fade">
        <div v-show="showBackTop" class="back-top" @click="scrollToTop">
          <van-icon name="back-top" size="22" color="#fff" />
        </div>
      </transition>
    </div>
  </transition>
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
      bannerList: [],
      navList: [],
      prodList: [],
      loading: true,
      loadingMore: false,
      finished: false,
      currentPage: 1,
      showBackTop: false,
      seckillTime: 3600 * 1000 * 5,
      // 加载控制相关
      isLoadingLocked: false, // 加载锁
      lockTimer: null, // 锁定时器
      scrollHandler: null // 滚动处理函数
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
    // 绑定滚动事件
    window.addEventListener('scroll', this.handleScroll)

    // 初始化时检查一次是否已触底
    this.$nextTick(() => {
      this.checkIfNeedLoadMore()
    })
  },
  beforeDestroy () {
    window.removeEventListener('scroll', this.handleScroll)
    if (this.lockTimer) {
      clearTimeout(this.lockTimer)
    }
  },
  methods: {
    // 格式化时间（补零）
    formatTime (time) {
      return time < 10 ? '0' + time : time
    },

    // 处理滚动事件
    handleScroll () {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop

      // 控制回到顶部按钮显示/隐藏
      this.showBackTop = scrollTop > 400

      // 检查是否需要加载更多
      this.checkIfNeedLoadMore()
    },

    // 检查是否需要加载更多
    checkIfNeedLoadMore () {
      // 如果已锁定、正在加载、已完成，则不再触发
      if (this.isLoadingLocked || this.loadingMore || this.finished) {
        return
      }

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // 距离底部 200px 时触发加载（提前加载，体验更好）
      const threshold = 200

      if (scrollTop + windowHeight >= documentHeight - threshold) {
        // 锁定，防止重复触发
        this.isLoadingLocked = true

        // 执行加载
        this.loadMore()

        // 1.5秒后解锁（确保加载完成且滚动停止）
        if (this.lockTimer) {
          clearTimeout(this.lockTimer)
        }
        this.lockTimer = setTimeout(() => {
          this.isLoadingLocked = false
          this.lockTimer = null

          // 解锁后再次检查是否需要加载（防止内容不够一屏）
          this.$nextTick(() => {
            this.checkIfNeedLoadMore()
          })
        }, 1500)
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
        const { data: { pageData } } = await getHomeData()
        const newData = pageData.items[6].data || []

        if (this.currentPage < 3) {
          // 去重
          const existingIds = this.prodList.map(item => item.goods_id)
          const uniqueNewData = newData.filter(item => !existingIds.includes(item.goods_id))

          if (uniqueNewData.length > 0) {
            // 追加新数据
            this.prodList = [...this.prodList, ...uniqueNewData]
            this.currentPage++
          } else {
            // 没有新数据了
            this.finished = true
          }
        } else {
          this.finished = true
        }
      } catch (error) {
        this.$toast.fail('加载失败，请重试')
        console.error('加载更多失败:', error)

        // 加载失败也要解锁
        this.isLoadingLocked = false
      } finally {
        this.loadingMore = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.home {
  padding-top: 100px;
  padding-bottom: 50px;
}

.van-nav-bar {
  z-index: 999;
  background-color: @primary-color;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  ::v-deep .van-nav-bar__title {
    color: #fff;
  }
}

.van-search {
  position: fixed;
  width: 100%;
  top: 46px;
  z-index: 998;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

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

.seckill-section {
  margin: 10px;
  background-color: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  .seckill-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .left {
      display: flex;
      align-items: center;

      .title {
        font-size: 18px;
        font-weight: bold;
        color: #333;
        margin-right: 10px;
      }

      .colon {
        display: inline-block;
        margin: 0 2px;
        color: #ee0a24;
        font-weight: bold;
      }

      .block {
        display: inline-block;
        width: 24px;
        color: #fff;
        font-size: 13px;
        text-align: center;
        background-color: #ee0a24;
        border-radius: 4px;
        padding: 2px 0;
      }
    }

    .right {
      font-size: 13px;
      color: #999;
      display: flex;
      align-items: center;
      gap: 2px;
    }
  }

  .seckill-list {
    display: flex;
    justify-content: space-between;
    gap: 8px;

    .seckill-item {
      flex: 1;
      cursor: pointer;

      .img-wrapper {
        position: relative;
        border-radius: 8px;
        overflow: hidden;

        img {
          width: 100%;
          height: 90px;
          border-radius: 8px;
          object-fit: cover;
          display: block;
        }

        .tag {
          position: absolute;
          top: 0;
          left: 0;
          background: linear-gradient(135deg, #ff6b6b, #ee0a24);
          color: #fff;
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 8px 0 6px 0;
          font-weight: 500;
        }
      }

      .price {
        margin-top: 6px;
        display: flex;
        align-items: baseline;

        .current {
          font-size: 16px;
          color: #ee0a24;
          font-weight: bold;
        }

        .old {
          font-size: 11px;
          color: #999;
          text-decoration: line-through;
          margin-left: 6px;
        }
      }

      .progress {
        margin-top: 4px;
        height: 4px;
        background-color: #f0f0f0;
        border-radius: 2px;
        position: relative;

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #ff6b6b, #ee0a24);
          border-radius: 2px;
        }

        .progress-text {
          display: block;
          font-size: 10px;
          color: #999;
          margin-top: 4px;
        }
      }
    }
  }
}

.main {
  margin: 10px;

  img {
    display: block;
    width: 100%;
    border-radius: 12px;
  }
}

.guess {
  .van-divider {
    margin: 16px 0;
    font-weight: 500;
  }
}

.goods-list {
  background-color: #f6f6f6;
  display: flex;
  flex-wrap: wrap;
  padding: 0 8px;
  justify-content: space-between;
}

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
}

.back-top {
  position: fixed;
  right: 16px;
  bottom: 80px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #1989fa;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  cursor: pointer;
  transition: all 0.3s;

  &:active {
    opacity: 0.8;
    transform: scale(0.92);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>
