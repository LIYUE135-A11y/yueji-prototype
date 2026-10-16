<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="discover-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.id"
        class="discover-tab"
        :class="{ active: activeTab === tab.id }"
        @tap="activeTab = tab.id"
      >
        <text class="tab-text">{{ tab.name }}</text>
        <view v-if="activeTab === tab.id" class="tab-underline"></view>
      </view>
    </view>

    <scroll-view scroll-y class="feed-scroll" :style="{ height: scrollHeight }">
      <!-- 动态 -->
      <view v-if="activeTab === 'review'" class="review-list">
        <view v-if="!reviews.length" class="empty-panel">
          <text class="empty-tip">暂无已通过审核的动态</text>
        </view>
        <view
          v-for="item in reviews"
          :key="item.id"
          class="review-card"
          hover-class="review-card-hover"
          @tap.stop="goReviewDetail(item)"
          @click.stop="goReviewDetail(item)"
        >
          <view class="review-user">
            <image class="avatar" :src="item.avatar" mode="aspectFill" />
            <text class="username">{{ item.user }}</text>
          </view>
          <view class="review-body">
            <view class="review-cover">
              <image class="review-img" :src="item.img" mode="aspectFill" />
            </view>
            <view class="review-content">
              <view class="review-title-row">
                <text class="review-product">{{ item.product }}</text>
                <text v-if="item.cat" class="review-cat">{{ item.cat }}</text>
              </view>
              <text class="review-tag">[{{ item.tag }}]</text>
              <text class="review-desc">{{ item.desc }}</text>
              <view class="review-stats">
                <view class="stat-item stat-btn" @tap.stop="onFeedAction(item, 'likes')">
                  <text class="stat-icon">♡</text>
                  <text class="stat-num">{{ item.likes }}</text>
                </view>
                <view class="stat-item stat-btn" @tap.stop="onFeedAction(item, 'comments')">
                  <text class="stat-icon">💬</text>
                  <text class="stat-num">{{ item.comments }}</text>
                </view>
                <view class="stat-item stat-btn" @tap.stop="onFeedAction(item, 'shares')">
                  <text class="stat-icon">↗</text>
                  <text class="stat-num">{{ item.shares }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 推荐 -->
      <view v-else-if="activeTab === 'recommend'" class="recommend-wrap">
        <view class="hot-circle-section">
          <view class="hot-section-head">
            <text class="hot-section-title">热门圈子</text>
            <text class="hot-refresh" @tap.stop="refreshRecommendCircles">↻ 换一批</text>
          </view>
          <scroll-view scroll-x class="hot-circle-scroll" :show-scrollbar="false">
            <view
              v-for="item in recommendCircles"
              :key="item.id"
              class="hot-circle-card"
              @tap.stop="goContentDetail('circle', item.id)"
            >
              <image class="hot-circle-cover" :src="item.img" mode="aspectFill" />
              <text class="hot-circle-name">{{ item.name }}</text>
              <text class="hot-circle-meta">{{ item.members }}人</text>
            </view>
          </scroll-view>
        </view>

        <view class="hot-user-section">
          <view class="hot-section-head">
            <text class="hot-section-title">推荐用户</text>
            <text class="hot-refresh" @tap.stop="refreshRecommendUsers">↻ 换一批</text>
          </view>
          <scroll-view scroll-x class="hot-user-scroll" :show-scrollbar="false">
            <view
              v-for="item in recommendUsers"
              :key="item.id"
              class="hot-user-card"
              @tap.stop="goContentDetail('user', item.id)"
            >
              <image class="hot-user-avatar" :src="item.avatar" mode="aspectFill" />
              <text class="hot-user-name">{{ item.nickName }}</text>
            </view>
          </scroll-view>
        </view>

        <view class="feed">
        <view class="col col-left">
          <view
            class="card feature-card"
            hover-class="card-hover"
            @tap="goProductDetail(featureAd)"
            @click="goProductDetail(featureAd)"
          >
            <image class="feature-ad" :src="featureAd.img" mode="aspectFill" />
          </view>

          <view
            class="card product-card"
            hover-class="card-hover"
            @tap="goProductDetail(featuredProduct)"
            @click="goProductDetail(featuredProduct)"
          >
            <view class="product-cover">
              <image class="product-img" :src="featuredProduct.img" mode="aspectFill" />
              <view class="rank-tag">{{ featuredProduct.rankTag }}</view>
            </view>
            <text class="product-name">{{ featuredProduct.title }}</text>
            <view class="review-row">
              <text class="review-badge">点评</text>
              <text class="review-text">{{ featuredProduct.reviewText }}</text>
            </view>
            <view class="user-row">
              <image class="avatar" :src="featuredProduct.avatar" mode="aspectFill" />
              <text class="username">{{ featuredProduct.user }}</text>
            </view>
          </view>

          <view class="card topic-card">
            <view class="topic-head">
              <text class="topic-title">话题</text>
              <text class="topic-more" @tap.stop="onTap('topics')">更多 ›</text>
            </view>
            <view
              v-for="item in topics"
              :key="item.id"
              class="topic-item"
              @tap.stop="goContentDetail(item.contentType || 'topic', item.id)"
              @click.stop="goContentDetail(item.contentType || 'topic', item.id)"
            >
              <image class="topic-thumb" :src="item.img" mode="aspectFill" />
              <view class="topic-body">
                <view class="topic-name-row">
                  <text class="topic-name">{{ item.name }}</text>
                  <text v-if="item.hot" class="hot-tag">HOT</text>
                  <text class="topic-meta">{{ item.watch }}人围观</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="col col-right">
          <view
            class="card challenge-card"
            hover-class="card-hover"
            @tap="goQuiz"
            @click="goQuiz"
          >
            <text class="challenge-title">{{ challenge.title }}</text>
            <text class="challenge-sub">{{ challenge.subTitle }}</text>
            <text class="challenge-link">去查看 ›</text>
          </view>

          <view
            v-for="item in posts"
            :key="item.id"
            class="card post-card"
            hover-class="card-hover"
            @tap.stop="goContentDetail(item.contentType || 'post', item.id)"
            @click.stop="goContentDetail(item.contentType || 'post', item.id)"
          >
            <view class="post-cover">
              <image class="post-img" :src="item.img" mode="aspectFill" />
            </view>
            <text class="post-title">{{ item.title }}</text>
            <view class="post-footer">
              <image class="avatar sm" :src="item.avatar" mode="aspectFill" />
              <text class="username">{{ item.user }}</text>
              <text class="views">{{ item.views }}</text>
            </view>
          </view>
        </view>
        </view>
      </view>

      <!-- 活动：大家在讨论 + 抢购卡片 -->
      <view v-else-if="activeTab === 'activity'" class="deal-panel">
        <view class="discuss-card">
          <view class="discuss-head" @tap="onTap('discuss')">
            <view class="discuss-dot"></view>
            <text class="discuss-title">大家在讨论</text>
            <text class="discuss-arrow">›</text>
          </view>
          <view class="discuss-grid">
            <text
              v-for="(tag, idx) in discussTags"
              :key="tag + idx"
              class="discuss-tag"
              :class="{ hot: idx === 0 }"
              @tap="onTap('discuss')"
            >{{ tag }}</text>
          </view>
        </view>

        <view
          v-for="item in activityDeals"
          :key="item.id"
          class="deal-card"
          hover-class="card-hover"
          @tap="goDealDetail(item)"
          @click="goDealDetail(item)"
        >
          <image class="deal-cover" :src="item.img" mode="aspectFill" />
          <view class="deal-body">
            <view class="deal-top">
              <text class="deal-badge">{{ item.badge }}</text>
            </view>
            <text class="deal-title">{{ item.title }}</text>
            <text class="deal-sub">{{ item.subTitle }}</text>
            <view class="deal-bottom">
              <text class="deal-price">
                {{ item.typeKey === 'manzhe' ? item.price + '折' : '¥' + item.price }}
              </text>
              <view class="grab-btn" @tap.stop="goDealDetail(item)">
                <text class="grab-text">快来抢</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 发现 -->
      <view v-else-if="activeTab === 'discover'" class="activity-wrap">
        <view class="hot-bar" @tap="goQuiz" @click="goQuiz">
          <view class="hot-left">
            <view class="hot-dot"></view>
            <text class="hot-label">热门讨论：</text>
            <text class="hot-text">{{ findHot.text }}</text>
          </view>
          <text class="hot-join">去答题 ›</text>
        </view>

        <view
          v-for="item in findPosts"
          :key="item.id"
          class="act-card"
          hover-class="card-hover"
          @tap.stop="goFindDetail(item)"
          @click.stop="goFindDetail(item)"
        >
          <view class="act-user">
            <image class="act-avatar" :src="item.avatar" mode="aspectFill" />
            <view class="act-user-info">
              <text class="act-username">{{ item.user }}</text>
              <text class="act-tags">{{ item.tags }}</text>
            </view>
            <text class="act-enter">详情 ›</text>
          </view>
          <text class="act-title">{{ item.title }}</text>
          <text class="act-desc">{{ item.desc }}</text>
          <view class="act-imgs">
            <image
              v-for="(img, idx) in item.images"
              :key="idx"
              class="act-img"
              :src="img"
              mode="aspectFill"
            />
          </view>
          <view class="act-actions">
            <view class="act-action" @tap.stop="onFindAction('fav', item)">
              <view class="act-ico"></view>
              <text class="act-action-text">收藏 {{ item.favoritesText }}</text>
            </view>
            <view class="act-action" @tap.stop="onFindAction('comment', item)">
              <view class="act-ico"></view>
              <text class="act-action-text">评论 {{ item.commentsText }}</text>
            </view>
            <view class="act-action" @tap.stop="onFindAction('like', item)">
              <view class="act-ico"></view>
              <text class="act-action-text">点赞 {{ item.likesText }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="empty-panel">
        <text class="empty-tip">内容即将上线</text>
      </view>
    </scroll-view>

    <!-- Path 式发布按钮 -->
    <view class="publish-mask" :class="{ show: publishOpen }" @tap="closePublish"></view>
    <view class="publish-fab-wrap" :class="{ open: publishOpen }">
      <view class="publish-menu">
        <view
          v-for="(item, idx) in publishItems"
          :key="item.id"
          class="publish-item"
          :style="{ '--i': idx }"
          @tap.stop="onPublish(item)"
        >
          <text class="publish-item-label">{{ item.name }}</text>
          <view class="publish-item-icon" :class="item.id">{{ item.short }}</view>
        </view>
      </view>
      <view class="publish-fab" @tap.stop="togglePublish">+</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { getUserAvatar } from '../../common/user-data.js'
import { getProductImage, getProductImages } from '../../common/product-image.js'
import {
  FEED_STORAGE_KEY,
  loadFeedList,
  filterFeedsForDiscover,
  mapFeedToDiscoverCard,
  saveFeedList,
  bumpFeedStat
} from '../../common/feed-data.js'
import {
  GRASS_STORAGE_KEY,
  loadGrassList,
  filterGrassForRecommend,
  mapGrassToRecommendCard
} from '../../common/grass-data.js'
import {
  TOPIC_STORAGE_KEY,
  loadTopicList,
  filterTopicForRecommend,
  mapTopicToRecommendCard
} from '../../common/topic-data.js'
import {
  ARTICLE_STORAGE_KEY,
  loadArticleList,
  filterArticlesForDiscover,
  mapArticleToFindCard,
  saveArticleList,
  bumpArticleStat
} from '../../common/article-data.js'
import {
  ACTIVITY_STORAGE_KEY,
  loadActivityList,
  filterActivitiesForDiscover,
  mapActivityToDealCard,
  saveActivityList
} from '../../common/activity-data.js'
import { calcScrollHeightStyle } from '../../common/scroll-layout.js'

function withImg(item) {
  return {
    ...item,
    img: getProductImage(item.productId, item.product || item.title || item.name || '')
  }
}

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const activeTab = ref('review')

const reviews = ref([])

function refreshDiscoverFeeds() {
  const list = filterFeedsForDiscover(loadFeedList())
  reviews.value = list.map(mapFeedToDiscoverCard)
}

function handleFeedStorage(ev) {
  if (!ev || ev.key !== FEED_STORAGE_KEY) return
  refreshDiscoverFeeds()
}

function handleFeedMessage(ev) {
  if (!ev.data || ev.data.type !== 'feed-sync' || !Array.isArray(ev.data.feeds)) return
  saveFeedList(ev.data.feeds)
  refreshDiscoverFeeds()
}

function onFeedAction(item, field) {
  if (!item || !item.id) return
  bumpFeedStat(item.id, field)
  refreshDiscoverFeeds()
  if (field === 'comments') {
    goReviewDetail(item)
    return
  }
  if (field === 'shares') {
    uni.showToast({ title: '已转发', icon: 'none' })
  }
}

const tabs = [
  { id: 'review', name: '动态' },
  { id: 'recommend', name: '推荐' },
  { id: 'activity', name: '活动' },
  { id: 'discover', name: '发现' }
]

const posts = ref([])
const topics = ref([])

const ALL_RECOMMEND_CIRCLES = [
  { id: '00011', name: '护肤交流圈', members: '12.5万', img: getProductImage('p1', '护肤交流') },
  { id: '00012', name: '彩妆学习圈', members: '8.6万', img: getProductImage('p2', '彩妆学习') },
  { id: '00014', name: '宝妈美妆圈', members: '3.8万', img: getProductImage('p3', '宝妈美妆') },
  { id: '00015', name: '成分研究社', members: '2.1万', img: getProductImage('p4', '成分研究') }
]
const ALL_RECOMMEND_USERS = [
  { id: 'U20240105', nickName: '林予安', avatar: '/static/images/user-f01.jpg' },
  { id: 'U20241102', nickName: '梁慕白', avatar: '/static/images/user-f02.jpg' },
  { id: 'U20240178', nickName: '许清禾', avatar: '/static/images/user-f03.jpg' },
  { id: 'U20240778', nickName: '周南枝', avatar: '/static/images/user-f04.jpg' },
  { id: 'U20240888', nickName: '陈初雪', avatar: '/static/images/user-f05.jpg' }
]
const recommendCircles = ref(ALL_RECOMMEND_CIRCLES.slice(0, 4))
const recommendUsers = ref(ALL_RECOMMEND_USERS.slice(0, 5))
let circleBatchOffset = 0
let userBatchOffset = 0

function refreshRecommendContent() {
  posts.value = filterGrassForRecommend(loadGrassList()).map(mapGrassToRecommendCard)
  topics.value = filterTopicForRecommend(loadTopicList(), 4).map(mapTopicToRecommendCard)
}

function refreshRecommendCircles() {
  circleBatchOffset = (circleBatchOffset + 1) % ALL_RECOMMEND_CIRCLES.length
  const batch = []
  for (let i = 0; i < 4; i++) {
    batch.push(ALL_RECOMMEND_CIRCLES[(circleBatchOffset + i) % ALL_RECOMMEND_CIRCLES.length])
  }
  recommendCircles.value = batch
}

function refreshRecommendUsers() {
  userBatchOffset = (userBatchOffset + 1) % ALL_RECOMMEND_USERS.length
  const batch = []
  for (let i = 0; i < 5; i++) {
    batch.push(ALL_RECOMMEND_USERS[(userBatchOffset + i) % ALL_RECOMMEND_USERS.length])
  }
  recommendUsers.value = batch
}

function handleGrassTopicStorage(ev) {
  if (!ev) return
  if (ev.key === GRASS_STORAGE_KEY || ev.key === TOPIC_STORAGE_KEY) {
    refreshRecommendContent()
  }
}

function handleGrassTopicMessage(ev) {
  if (!ev.data) return
  if (ev.data.type === 'grass-sync' && Array.isArray(ev.data.grasses)) {
    refreshRecommendContent()
  }
  if (ev.data.type === 'topic-sync' && Array.isArray(ev.data.topics)) {
    refreshRecommendContent()
  }
}

function goContentDetail(type, id) {
  if (!id) return
  if (type === 'post' || type === 'topic' || type === 'article') {
    uni.navigateTo({
      url: `/pages/content/detail?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`,
      fail() {
        uni.showToast({ title: '打开详情失败', icon: 'none' })
      }
    })
    return
  }
  uni.showToast({ title: '详情即将上线', icon: 'none' })
}

const featureAd = withImg({
  productId: 'p2',
  title: '七夕好物 贴心好礼',
  subTitle: '礼盒优选 · 限时特惠',
  desc: '七夕好物贴心好礼，精选口红礼盒，送给重要的她。'
})

const featuredProduct = withImg({
  productId: 'p2',
  title: '花兰槿养肤粉底液',
  subTitle: '养肤底妆 · 自然服帖',
  rankTag: '2026年6月彩妆榜NO.2',
  reviewText: '妆感自然服帖，养肤底妆持妆一整天都稳…',
  user: '修宝012644',
  avatar: getUserAvatar('修宝012644'),
  desc: '花兰槿养肤粉底液，妆感自然服帖，养肤底妆持妆一整天都稳。'
})

const challenge = withImg({
  productId: 'p1',
  title: '卷王挑战|10秒快速问答!',
  subTitle: '每日必答',
  desc: '10秒快速问答挑战，每日必答赢取美妆好礼。'
})

const discussTags = [
  '#我在阅己盒挖到宝',
  '#秋冬屏障修护',
  '#显白口红色号',
  '#1元抢爆款进行中'
]

const activityDeals = ref([])

function refreshDiscoverActivities() {
  const list = filterActivitiesForDiscover(loadActivityList())
  activityDeals.value = list.map(mapActivityToDealCard)
}

function handleActivityStorage(ev) {
  if (!ev || ev.key !== ACTIVITY_STORAGE_KEY) return
  refreshDiscoverActivities()
}

function handleActivityMessage(ev) {
  if (!ev.data || ev.data.type !== 'activity-sync' || !Array.isArray(ev.data.activities)) return
  saveActivityList(ev.data.activities)
  refreshDiscoverActivities()
}

const findHot = ref({
  text: '10秒护肤问答你能答对几题'
})

const findPosts = ref([])

function refreshDiscoverArticles() {
  const list = filterArticlesForDiscover(loadArticleList())
  findPosts.value = list.map(mapArticleToFindCard)
  if (list.length) {
    findHot.value = { text: list[0].title }
  }
}

function handleArticleStorage(ev) {
  if (!ev || ev.key !== ARTICLE_STORAGE_KEY) return
  refreshDiscoverArticles()
}

function handleArticleMessage(ev) {
  if (!ev.data || ev.data.type !== 'article-sync' || !Array.isArray(ev.data.articles)) return
  saveArticleList(ev.data.articles)
  refreshDiscoverArticles()
}

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    scrollHeight.value = calcScrollHeightStyle({ tabsRpx: 88, includeTabBar: true })
  } catch (e) {}
  refreshDiscoverFeeds()
  refreshRecommendContent()
  refreshDiscoverArticles()
  refreshDiscoverActivities()
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleFeedStorage)
    window.addEventListener('storage', handleGrassTopicStorage)
    window.addEventListener('storage', handleArticleStorage)
    window.addEventListener('storage', handleActivityStorage)
    window.addEventListener('message', handleFeedMessage)
    window.addEventListener('message', handleGrassTopicMessage)
    window.addEventListener('message', handleArticleMessage)
    window.addEventListener('message', handleActivityMessage)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('storage', handleFeedStorage)
    window.removeEventListener('storage', handleGrassTopicStorage)
    window.removeEventListener('storage', handleArticleStorage)
    window.removeEventListener('storage', handleActivityStorage)
    window.removeEventListener('message', handleFeedMessage)
    window.removeEventListener('message', handleGrassTopicMessage)
    window.removeEventListener('message', handleArticleMessage)
    window.removeEventListener('message', handleActivityMessage)
  }
})

function onTap(id) {
  if (id === 'hot-discuss') {
    uni.navigateTo({
      url: '/pages/trial/index',
      fail(err) {
        uni.showToast({
          title: (err && err.errMsg) || '打开试用中心失败',
          icon: 'none'
        })
      }
    })
    return
  }
  if (id === 'discuss') {
    uni.navigateTo({
      url: '/pages/review/detail?id=1',
      fail() {
        uni.showToast({ title: '话题讨论', icon: 'none' })
      }
    })
    return
  }
  if (id === 'find-hot') {
    goQuiz()
    return
  }
  if (id === 'topics') {
    if (topics.value.length) {
      goContentDetail('topic', topics.value[0].id)
    } else {
      uni.showToast({ title: '暂无话题', icon: 'none' })
    }
    return
  }
  uni.showToast({ title: String(id || ''), icon: 'none' })
}

function goQuiz() {
  uni.navigateTo({
    url: '/pages/quiz/index',
    fail(err) {
      uni.showToast({
        title: (err && err.errMsg) || '打开小问答失败',
        icon: 'none'
      })
    }
  })
}

function goProductDetail(item) {
  if (!item) return
  const title = item.title || item.name || '商品详情'
  const subTitle = item.subTitle || item.rankTag || ''
  const img = item.img || getProductImage(item.productId, item.product || item.title)
  const desc = item.desc || item.reviewText || subTitle || title
  uni.navigateTo({
    url:
      `/pages/product/detail?id=${item.productId || 'p1'}` +
      `&title=${encodeURIComponent(title)}` +
      `&subTitle=${encodeURIComponent(subTitle)}` +
      `&img=${encodeURIComponent(img)}` +
      `&desc=${encodeURIComponent(desc)}`,
    fail(err) {
      uni.showToast({
        title: (err && err.errMsg) || '打开详情失败',
        icon: 'none'
      })
    }
  })
}

function onFindAction(type, item) {
  if (!item || !item.id) return
  bumpArticleStat(item.id, type)
  refreshDiscoverArticles()
  if (type === 'comment') {
    goContentDetail('article', item.id)
    return
  }
  const map = { fav: '已收藏', like: '已点赞' }
  uni.showToast({ title: map[type] || '操作成功', icon: 'none' })
}

function goFindDetail(item) {
  if (!item) return
  if (item.contentType === 'article' || item.articleId) {
    goContentDetail('article', item.id)
    return
  }
  const rid = item.reviewId || item.id || 1
  uni.navigateTo({
    url: `/pages/review/detail?id=${rid}`,
    fail() {
      goProductDetail({
        productId: item.productId || 'p1',
        title: item.title,
        subTitle: item.tags || '',
        img: (item.images && item.images[0]) || getProductImage(item.productId, item.title),
        desc: item.desc
      })
    }
  })
}

function goDealDetail(item) {
  if (!item) return
  const actId = item.activityId || item.id
  if (actId) {
    uni.navigateTo({
      url: `/pages/activity/detail?id=${encodeURIComponent(actId)}`,
      fail() {
        goProductDetail(item)
      }
    })
    return
  }
  goProductDetail(item)
}

function goReviewDetail(item) {
  const id = item && item.id
  if (!id) {
    uni.showToast({ title: '动态数据异常', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pages/review/detail?id=${id}`,
    fail: (err) => {
      console.error('navigate review detail failed', err)
      uni.showToast({
        title: (err && err.errMsg) || '打开详情失败，请重新编译运行',
        icon: 'none',
        duration: 2500
      })
    }
  })
}

const publishOpen = ref(false)
const publishItems = [
  { id: 'article', name: '文章', short: '文' },
  { id: 'grass', name: '种草', short: '草' },
  { id: 'circle', name: '圈子', short: '圈' },
  { id: 'feed', name: '动态', short: '动' }
]

function togglePublish() {
  publishOpen.value = !publishOpen.value
}

function closePublish() {
  publishOpen.value = false
}

function onPublish(item) {
  closePublish()
  const titles = { article: '发布文章', grass: '发布种草', circle: '发布圈子', feed: '发布动态' }
  uni.showToast({ title: titles[item.id] || '发布', icon: 'none' })
}

watch(activeTab, () => {
  closePublish()
})

</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  height: 100vh;
  overflow: hidden;
  background: $purple-surface;
  position: relative;
  display: flex;
  flex-direction: column;
}

.feed-scroll {
  flex: 1;
  min-height: 0;
}

.status-bar {
  background: #FFFFFF;
}

.discover-tabs {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 8rpx 24rpx 0;
  background: #FFFFFF;
  height: 88rpx;
  box-sizing: border-box;
  flex-shrink: 0;
}

.discover-tab {
  position: relative;
  padding: 12rpx 8rpx 20rpx;
}

.tab-text {
  font-size: 30rpx;
  color: #666666;
}

.discover-tab.active .tab-text {
  color: #8B7CF6;
  font-weight: 700;
  font-size: 32rpx;
}

.tab-underline {
  position: absolute;
  left: 50%;
  bottom: 8rpx;
  width: 36rpx;
  height: 6rpx;
  margin-left: -18rpx;
  border-radius: 6rpx;
  background: #8B7CF6;
}

.feed-scroll {
  background: $purple-surface;
}

.empty-panel {
  padding: 120rpx 0;
  text-align: center;
}

.empty-tip {
  font-size: 28rpx;
  color: #999999;
}

/* ===== 活动抢购（图示布局） ===== */
.deal-panel {
  padding: 16rpx 20rpx 40rpx;
}

.discuss-card {
  background: $purple-surface;
  border-radius: 16rpx;
  padding: 22rpx 24rpx 8rpx;
  margin-bottom: 16rpx;
}

.discuss-head {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.discuss-dot {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: rgba(139, 124, 246, 0.28);
  margin-right: 10rpx;
  flex-shrink: 0;
}

.discuss-title {
  flex: 1;
  font-size: 26rpx;
  font-weight: 600;
  color: #444444;
}

.discuss-arrow {
  font-size: 28rpx;
  color: #bbbbbb;
}

.discuss-grid {
  display: flex;
  flex-wrap: wrap;
}

.discuss-tag {
  width: 50%;
  box-sizing: border-box;
  padding: 0 8rpx 18rpx 0;
  font-size: 24rpx;
  color: #777777;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.discuss-tag.hot {
  color: #222222;
  font-weight: 700;
}

.deal-card {
  display: flex;
  align-items: stretch;
  gap: 20rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 6rpx 20rpx rgba(139, 124, 246, 0.08);
}

.deal-cover {
  width: 180rpx;
  height: 180rpx;
  border-radius: 14rpx;
  background: $purple-placeholder;
  flex-shrink: 0;
}

.deal-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}

.deal-top {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}

.deal-badge {
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  background: $purple-surface;
  font-size: 20rpx;
  color: $primary-color;
  font-weight: 600;
}

.deal-title {
  display: block;
  margin-top: 0;
  padding-right: 100rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: #222222;
  line-height: 1.35;
}

.deal-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999999;
  line-height: 1.4;
}

.deal-bottom {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.deal-price {
  font-size: 28rpx;
  font-weight: 700;
  color: $primary-color;
}

.grab-btn {
  padding: 10rpx 28rpx;
  border-radius: 28rpx;
  background: $primary-color;
}

.grab-text {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: 600;
}

/* ===== 活动/发现 社交流 ===== */
.activity-wrap {
  padding: 16rpx 20rpx 40rpx;
}

.hot-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 18rpx 24rpx;
  margin-bottom: 16rpx;
  background: #ffffff;
  border-radius: 40rpx;
  box-shadow: 0 6rpx 20rpx rgba(139, 124, 246, 0.08);
}

.hot-left {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.hot-dot {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: $primary-color;
  flex-shrink: 0;
}

.hot-label {
  font-size: 24rpx;
  color: $text-hint;
  flex-shrink: 0;
}

.hot-text {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  color: $text-secondary;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.hot-join {
  font-size: 22rpx;
  color: $primary-color;
  flex-shrink: 0;
  font-weight: 500;
}

.act-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 6rpx 20rpx rgba(139, 124, 246, 0.08);
}

.act-user {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.act-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: $purple-placeholder;
  flex-shrink: 0;
}

.act-user-info {
  flex: 1;
  min-width: 0;
}

.act-username {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: $text-primary;
}

.act-tags {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #999999;
}

.act-enter {
  flex-shrink: 0;
  font-size: 22rpx;
  color: $primary-color;
  font-weight: 600;
}

.act-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
  line-height: 1.4;
  margin-bottom: 12rpx;
}

.act-desc {
  display: block;
  font-size: 26rpx;
  color: $text-hint;
  line-height: 1.65;
  margin-bottom: 20rpx;
}

.act-imgs {
  display: flex;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.act-img {
  flex: 1;
  height: 200rpx;
  border-radius: 12rpx;
  background: $purple-placeholder;
}

.act-actions {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-top: 8rpx;
  border-top: 1rpx solid #f2f2f2;
}

.act-action {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 16rpx 12rpx;
}

.act-ico {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: $purple-placeholder;
  border: 2rpx solid rgba(139, 124, 246, 0.25);
}

.act-action-text {
  font-size: 24rpx;
  color: $text-hint;
}

/* ===== 动态列表 ===== */
.review-list {
  padding: 16rpx 20rpx 40rpx;
}

.review-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  cursor: pointer;
}

.review-card-hover {
  opacity: 0.92;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.review-body {
  display: flex;
  gap: 16rpx;
  align-items: flex-start;
}

.review-cover {
  width: 200rpx;
  flex-shrink: 0;
  position: relative;
  padding-bottom: 200rpx;
  height: 0;
  border-radius: 12rpx;
  overflow: hidden;
  background: #F2F2F2;
}

.review-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.review-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 200rpx;
}

.review-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}

.review-product {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  font-weight: 700;
  color: #000000;
  line-height: 1.35;
}

.review-cat {
  flex-shrink: 0;
  font-size: 22rpx;
  color: #8B7CF6;
  background: #F3F0FF;
  border-radius: 8rpx;
  padding: 2rpx 12rpx;
  line-height: 1.35;
}

.score-wrap {
  display: flex;
  align-items: flex-start;
  gap: 4rpx;
  flex-shrink: 0;
  padding-top: 0;
  margin-top: 0;
  line-height: 1.35;
}

.score-dot {
  font-size: 18rpx;
  color: #C9C9C9;
  line-height: 1.35;
  transform: translateY(4rpx);
}

.score-num {
  font-size: 24rpx;
  color: #333333;
  font-weight: 600;
  line-height: 1.35;
}

.review-tag {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #8B7CF6;
}

.review-desc {
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #888888;
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.review-stats {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 24rpx;
  margin-top: auto;
  padding-top: 16rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.stat-btn:active {
  opacity: 0.65;
}

.stat-btn:active .stat-icon,
.stat-btn:active .stat-num {
  color: #8B7CF6;
}

.stat-icon {
  font-size: 22rpx;
  color: #BBBBBB;
}

.stat-num {
  font-size: 22rpx;
  color: #999999;
}

.feed {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 20rpx 40rpx;
  align-items: flex-start;
}

.recommend-wrap {
  background: $purple-surface;
}

.hot-circle-section,
.hot-user-section {
  padding: 20rpx 20rpx 0;
}

.hot-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.hot-section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #333;
}

.hot-refresh {
  font-size: 24rpx;
  color: #8b7cf6;
}

.hot-circle-scroll,
.hot-user-scroll {
  white-space: nowrap;
  width: 100%;
}

.hot-circle-card,
.hot-user-card {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  vertical-align: top;
  margin-right: 20rpx;
}

.hot-circle-cover {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  background: #eee;
}

.hot-circle-name {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #333;
  max-width: 120rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-circle-meta {
  margin-top: 4rpx;
  font-size: 20rpx;
  color: #999;
}

.hot-user-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #eee;
}

.hot-user-name {
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #333;
  max-width: 96rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  align-items: stretch;
}

.col .card {
  flex: none;
  width: 100%;
  height: auto;
}

.card {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 6rpx 20rpx rgba(139, 124, 246, 0.08);
}

.card-hover {
  opacity: 0.94;
}

.feature-card {
  padding: 0;
  position: relative;
  width: 100%;
  padding-bottom: 130%;
  background: #F7F0FF;
}

.feature-ad {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.challenge-card {
  padding: 22rpx 20rpx;
}

.challenge-title {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  color: #000000;
  line-height: 1.4;
}

.challenge-sub {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #666666;
}

.challenge-link {
  display: block;
  margin-top: 16rpx;
  font-size: 22rpx;
  color: #8B7CF6;
  font-weight: 600;
}

.product-card {
  padding-bottom: 16rpx;
}

.product-cover {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  background: #E8E8E8;
  overflow: hidden;
}

.product-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.rank-tag {
  position: absolute;
  left: 12rpx;
  bottom: 12rpx;
  background: rgba(139, 124, 246, 0.9);
  color: #FFFFFF;
  font-size: 18rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.product-name {
  display: block;
  margin: 14rpx 16rpx 8rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: #000000;
}

.review-row {
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
  padding: 0 16rpx;
}

.review-badge {
  flex-shrink: 0;
  font-size: 18rpx;
  color: #FFFFFF;
  background: #8B7CF6;
  border-radius: 6rpx;
  padding: 2rpx 8rpx;
  margin-top: 2rpx;
}

.review-text {
  flex: 1;
  font-size: 22rpx;
  color: #666666;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.user-row,
.post-footer {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 14rpx 16rpx 4rpx;
}

.avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #D9D9D9;
  flex-shrink: 0;
}

.avatar.sm {
  width: 32rpx;
  height: 32rpx;
}

.username {
  font-size: 22rpx;
  color: #666666;
}

.views {
  margin-left: auto;
  font-size: 20rpx;
  color: #999999;
}

.post-cover {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  background: #E8E8E8;
  overflow: hidden;
}

.post-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.post-title {
  display: block;
  margin: 14rpx 14rpx 0;
  font-size: 26rpx;
  font-weight: 700;
  color: #000000;
  line-height: 1.4;
}

.post-card {
  padding-bottom: 16rpx;
}

.topic-card {
  padding: 18rpx 16rpx 12rpx;
  background: #FFFFFF;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.topic-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.topic-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #000000;
}

.topic-more {
  font-size: 22rpx;
  color: #999999;
}

.topic-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  margin-bottom: 0;
}

.topic-item:last-child {
  margin-bottom: 0;
}

.topic-thumb {
  width: 64rpx;
  height: 64rpx;
  border-radius: 10rpx;
  background: #F2F2F2;
  flex-shrink: 0;
}

.topic-body {
  flex: 1;
  min-width: 0;
}

.topic-name-row {
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
}

.topic-name {
  font-size: 24rpx;
  color: #000000;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 48%;
  line-height: 1.4;
}

.hot-tag {
  font-size: 16rpx;
  color: #FFFFFF;
  background: #8B7CF6;
  border-radius: 999rpx;
  padding: 2rpx 10rpx;
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1.4;
  margin-top: 2rpx;
}

.topic-meta {
  font-size: 20rpx;
  color: #999999;
  flex-shrink: 0;
  line-height: 1.4;
  margin-top: 2rpx;
  white-space: nowrap;
}

/* Path 式发布菜单 */
.publish-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(15, 10, 30, 0.42);
  z-index: 90;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.22s ease, visibility 0.22s ease;
}

.publish-mask.show {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.publish-fab-wrap {
  position: fixed;
  right: 32rpx;
  bottom: calc(120rpx + env(safe-area-inset-bottom));
  width: 112rpx;
  height: 112rpx;
  z-index: 91;
}

.publish-menu {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 112rpx;
  height: 112rpx;
  pointer-events: none;
}

.publish-item {
  position: absolute;
  right: 8rpx;
  bottom: 8rpx;
  width: 96rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translate(0, 0) scale(0.25);
  transition:
    transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.22s ease,
    visibility 0.22s ease;
}

.publish-item-label {
  position: absolute;
  right: 112rpx;
  top: 50%;
  margin-top: -26rpx;
  padding: 10rpx 24rpx;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  box-shadow: 0 8rpx 28rpx rgba(0, 0, 0, 0.12);
  white-space: nowrap;
  opacity: 0;
  transform: translateX(12rpx);
  transition: opacity 0.2s ease 0.05s, transform 0.2s ease 0.05s;
}

.publish-item-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #fff;
  color: $primary-color;
  font-size: 30rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 36rpx rgba(138, 99, 242, 0.28);
}

.publish-item-icon.article {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  color: #fff;
}

.publish-item-icon.grass {
  background: linear-gradient(135deg, #34D399, #10B981);
  color: #fff;
}

.publish-item-icon.circle {
  background: linear-gradient(135deg, #F472B6, #EC4899);
  color: #fff;
}

.publish-item-icon.feed {
  background: linear-gradient(135deg, #60A5FA, #3B82F6);
  color: #fff;
}

.publish-fab-wrap.open .publish-menu {
  pointer-events: auto;
}

.publish-fab-wrap.open .publish-item {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.publish-fab-wrap.open .publish-item .publish-item-label {
  opacity: 1;
  transform: translateX(0);
}

.publish-fab-wrap.open .publish-item:nth-child(1) {
  transition-delay: 0.02s;
  transform: translate(-216rpx, 0) scale(1);
}

.publish-fab-wrap.open .publish-item:nth-child(2) {
  transition-delay: 0.06s;
  transform: translate(-186rpx, -108rpx) scale(1);
}

.publish-fab-wrap.open .publish-item:nth-child(3) {
  transition-delay: 0.1s;
  transform: translate(-108rpx, -186rpx) scale(1);
}

.publish-fab-wrap.open .publish-item:nth-child(4) {
  transition-delay: 0.14s;
  transform: translate(0, -216rpx) scale(1);
}

.publish-fab-wrap:not(.open) .publish-item:nth-child(1) { transition-delay: 0.12s; }
.publish-fab-wrap:not(.open) .publish-item:nth-child(2) { transition-delay: 0.08s; }
.publish-fab-wrap:not(.open) .publish-item:nth-child(3) { transition-delay: 0.04s; }
.publish-fab-wrap:not(.open) .publish-item:nth-child(4) { transition-delay: 0s; }

.publish-fab {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: linear-gradient(145deg, $primary-light 0%, $primary-color 55%, $accent-pink 100%);
  color: #fff;
  font-size: 60rpx;
  line-height: 112rpx;
  text-align: center;
  box-shadow: 0 16rpx 44rpx rgba(138, 99, 242, 0.42);
  transition: transform 0.28s cubic-bezier(0.34, 1.45, 0.64, 1), background 0.2s ease;
  z-index: 2;
}

.publish-fab-wrap.open .publish-fab {
  transform: rotate(45deg);
  background: linear-gradient(145deg, #9CA3AF, #6B7280);
}
</style>
