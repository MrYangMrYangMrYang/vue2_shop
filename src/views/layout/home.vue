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
          <van-swipe-item v-for="item in bannerList" :key="item.imgUrl" @click="$router.push('/category')">
            <img v-lazy="item.imgUrl" alt="">
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
                <img v-lazy="'https://img01.yzcdn.cn/vant/ipad.jpeg'" alt="">
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
        <div class="main" @click="$router.push('/category')">
          <img v-lazy="require('@/assets/main.png')" alt="">
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
/**
 * HomePage - 首页组件
 * 核心功能：
 * 1. 首页多模块展示 (轮播图、秒杀、主会场、猜你喜欢列表)
 * 2. 骨架屏加载状态处理
 * 3. 瀑布流/无限滚动加载更多数据
 * 4. 回到顶部功能
 * 5. 秒杀倒计时展示
 */
import GoodsItem from '@/components/GoodsItem.vue'
import { getHomeData } from '@/api/home'

export default {
  name: 'HomePage',
  components: {
    GoodsItem
  },
  data () {
    return {
      bannerList: [], // 轮播图列表数据
      navList: [], // 导航菜单列表 (暂未使用)
      prodList: [], // 商品列表数据
      loading: true, // 初始骨架屏加载状态
      loadingMore: false, // 底部加载更多状态
      finished: false, // 是否已加载完所有数据
      currentPage: 1, // 当前加载的页码
      showBackTop: false, // 是否显示“回到顶部”按钮
      seckillTime: 3600 * 1000 * 5, // 秒杀剩余时间 (模拟 5 小时)
      // 加载控制相关
      isLoadingLocked: false, // 瀑布流加载锁，防止瞬间重复触发
      lockTimer: null, // 锁定时器
      scrollHandler: null // 滚动事件处理器引用
    }
  },
  async created () {
    // 初始获取首页聚合数据
    try {
      const { data: { pageData } } = await getHomeData()
      this.bannerList = pageData.items[1].data
      this.navList = pageData.items[3].data
      this.prodList = pageData.items[6].data || []
    } finally {
      // 无论成功失败，都关闭初始骨架屏
      this.loading = false
    }
  },
  mounted () {
    // 监听全局滚动事件，用于处理回到顶部和瀑布流加载
    window.addEventListener('scroll', this.handleScroll)

    // 初始渲染后，检查内容是否填满一屏，若不满则尝试加载更多
    this.$nextTick(() => {
      this.checkIfNeedLoadMore()
    })
  },
  beforeDestroy () {
    // 页面销毁前必须移除全局滚动监听，防止内存泄漏和逻辑异常
    window.removeEventListener('scroll', this.handleScroll)
    if (this.lockTimer) {
      clearTimeout(this.lockTimer)
    }
  },
  methods: {
    /**
     * 时间格式化补零
     * @param {Number} time
     */
    formatTime (time) {
      return time < 10 ? '0' + time : time
    },

    /**
     * 全局滚动事件回调
     */
    handleScroll () {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop

      // 1. 动态显示/隐藏“回到顶部”按钮 (阈值 400px)
      this.showBackTop = scrollTop > 400

      // 2. 检查瀑布流触底逻辑
      this.checkIfNeedLoadMore()
    },

    /**
     * 瀑布流触底检测逻辑
     */
    checkIfNeedLoadMore () {
      // 状态拦截：已锁定、正在加载中、或已全部完成，则直接跳过
      if (this.isLoadingLocked || this.loadingMore || this.finished) {
        return
      }

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // 提前加载阈值：距离底部 200px 时即开始预加载下一页
      const threshold = 200

      if (scrollTop + windowHeight >= documentHeight - threshold) {
        // 1. 触发加载锁
        this.isLoadingLocked = true

        // 2. 执行数据追加
        this.loadMore()

        // 3. 延时解锁 (1.5s 后)，确保网络请求有缓冲时间且用户滚动感知平滑
        if (this.lockTimer) {
          clearTimeout(this.lockTimer)
        }
        this.lockTimer = setTimeout(() => {
          this.isLoadingLocked = false
          this.lockTimer = null

          // 解锁后立即自检一次，防止内容仍不足以触发下一次滚动的情况
          this.$nextTick(() => {
            this.checkIfNeedLoadMore()
          })
        }, 1500)
      }
    },

    /**
     * 平滑回到顶部
     */
    scrollToTop () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    },

    /**
     * 加载更多商品数据 (模拟分页)
     */
    async loadMore () {
      if (this.loadingMore || this.finished) return

      this.loadingMore = true

      try {
        // 模拟分页请求，当前演示版本重复获取首页数据并追加
        const { data: { pageData } } = await getHomeData()
        const newData = pageData.items[6].data || []

        // 模拟最多加载 3 页数据
        if (this.currentPage < 3) {
          // 简易去重逻辑，防止 ID 重复导致的列表渲染警告
          const existingIds = this.prodList.map(item => item.goods_id)
          const uniqueNewData = newData.filter(item => !existingIds.includes(item.goods_id))

          if (uniqueNewData.length > 0) {
            // 将新数据合并到原列表
            this.prodList = [...this.prodList, ...uniqueNewData]
            this.currentPage++
          } else {
            this.finished = true
          }
        } else {
          // 达到模拟的最大页数，标记完成
          this.finished = true
        }
      } catch (error) {
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
