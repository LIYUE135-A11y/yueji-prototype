<template>
  <view class="sub-page">
    <view class="header-bar">
      <view class="back-btn" @click="goBack"><text class="back-arrow">‹</text></view>
      <text class="header-title">评价管理</text>
      <view style="width:56rpx"></view>
    </view>

    <scroll-view scroll-y class="page-body">
      <view class="review-container">
        <!-- 分类标签页 -->
        <view class="tab-bar">
          <view
            v-for="t in reviewTabs"
            :key="t"
            class="tab-item"
            :class="{ 'tab-active': activeTab === t }"
            @click="switchTab(t)"
          >
            <text>{{ t }}</text>
          </view>
        </view>

        <!-- 筛选 -->
        <view class="filter-bar">
          <view class="filter-row">
            <view class="filter-item">
              <text class="filter-label">评分</text>
              <picker :range="filterRating" @change="(e)=>reviewFilterForm.ratingIdx=e.detail.value">
                <view class="filter-input filter-input-picker"><text>{{ filterRating[reviewFilterForm.ratingIdx] }}</text></view>
              </picker>
            </view>
            <view class="filter-item">
              <text class="filter-label">热度</text>
              <picker :range="filterHeat" @change="(e)=>reviewFilterForm.heatIdx=e.detail.value">
                <view class="filter-input filter-input-picker"><text>{{ filterHeat[reviewFilterForm.heatIdx] }}</text></view>
              </picker>
            </view>
            <view class="filter-item">
              <text class="filter-label">提交时间</text>
              <picker :range="filterTime" @change="(e)=>reviewFilterForm.timeIdx=e.detail.value">
                <view class="filter-input filter-input-picker"><text>{{ filterTime[reviewFilterForm.timeIdx] }}</text></view>
              </picker>
            </view>
            <view class="filter-item">
              <text class="filter-label">商品名称</text>
              <picker :range="filterProdNames" @change="(e)=>reviewFilterForm.prodIdx=e.detail.value">
                <view class="filter-input filter-input-picker filter-input-wide"><text>{{ filterProdNames[reviewFilterForm.prodIdx] }}</text></view>
              </picker>
            </view>
            <view class="filter-actions">
              <button class="btn btn-primary" @click="applySearch">查询</button>
              <button class="btn btn-default" @click="resetFilter">重置</button>
            </view>
          </view>
        </view>

        <!-- 操作栏 + 分页 -->
        <view class="action-bar">
          <view class="action-left">
            <button class="btn btn-primary" @click="batchOp('view')">查看</button>
            <button class="btn btn-default" @click="batchOp('edit')">编辑</button>
            <button class="btn btn-default" @click="batchOp('import')">导入</button>
            <button class="btn btn-default" @click="batchOp('export')">导出</button>
            <text class="batch-count">已选 <text class="batch-num">{{ checkedCount }}</text> 项</text>
          </view>
          <view class="action-right order-action-pager">
            <text class="total-text">共 {{ filteredReviewList.length }} 条，第 {{ currentPage }}/{{ maxPage }} 页</text>
            <text>每页</text>
            <picker :range="pageSizeList" @change="onPageSizeChange">
              <view class="page-size-select">{{ pageSizeNum }}</view>
            </picker>
            <button class="page-btn" :disabled="currentPage <= 1" @click="prevPage">上一页</button>
            <button class="page-btn" :disabled="currentPage >= maxPage" @click="nextPage">下一页</button>
          </view>
        </view>

        <!-- 列表 -->
        <view class="list-wrap">
          <scroll-view scroll-x class="list-scroll">
            <view class="list-table review-table">
              <view class="list-tr list-th">
                <view class="list-td col-check"><input type="checkbox" :checked="isAllChecked" @change="toggleCheckAll" class="checkbox" /></view>
                <view class="list-td col-r-op">操作</view>
                <view class="list-td col-r-id">ID</view>
                <view class="list-td col-r-content">评论内容</view>
                <view class="list-td col-r-imgs">评论图片</view>
                <view class="list-td col-r-rating">评分等级</view>
                <view class="list-td col-r-time">评论时间</view>
                <view class="list-td col-r-cover">商品图片</view>
                <view class="list-td col-r-name">商品名称</view>
                <view class="list-td col-r-spec">商品规格</view>
                <view class="list-td col-r-price">商品价格</view>
                <view class="list-td col-r-follow">追评</view>
                <view class="list-td col-r-views">浏览量</view>
                <view class="list-td col-r-likes">点赞</view>
                <view class="list-td col-r-user">评论人</view>
              </view>

              <view class="list-tr list-tbody" v-for="r in displayReviewList" :key="r.id">
                <view class="list-td col-check"><input type="checkbox" :checked="r._checked" @change="toggleRowCheck(r)" class="checkbox" /></view>
                <view class="list-td col-r-op"><text class="order-op-link" @click="openDetail(r)">查看</text></view>
                <view class="list-td col-r-id"><text class="product-id">{{ r.id }}</text></view>
                <view class="list-td col-r-content" style="white-space:normal;line-height:1.4;"><text class="review-content">{{ r.content }}</text></view>
                <view class="list-td col-r-imgs">
                  <view v-if="reviewPhotos(r).length" class="review-photos">
                    <image v-for="(p, i) in reviewPhotos(r)" :key="i" :src="p" mode="aspectFill" class="review-photo" />
                  </view>
                  <text v-else class="product-sku">—</text>
                </view>
                <view class="list-td col-r-rating">
                  <view class="rating-cell">
                    <text class="star-text">{{ starStr(r.rating) }}</text>
                    <text class="level-tag" :class="'level-' + r.levelKey">{{ r.level }}</text>
                  </view>
                </view>
                <view class="list-td col-r-time"><text class="product-sku">{{ r.reviewTime }}</text></view>
                <view class="list-td col-r-cover">
                  <view class="cover-thumb"><image :src="getProductCover(r.prodSku)" mode="aspectFill" /></view>
                </view>
                <view class="list-td col-r-name" style="white-space:normal;line-height:1.4;"><text class="product-name">{{ r.prodName }}</text></view>
                <view class="list-td col-r-spec"><text class="product-sku">{{ r.prodSpec }}</text></view>
                <view class="list-td col-r-price" style="justify-content:flex-end;"><text class="order-price">{{ fmtPrice(r.prodPrice) }}</text></view>
                <view class="list-td col-r-follow" style="white-space:normal;line-height:1.4;"><text :class="r.followUp ? 'review-follow' : 'product-sku'">{{ r.followUp || '—' }}</text></view>
                <view class="list-td col-r-views" style="justify-content:flex-end;"><text class="stat-num">{{ fmtNum(r.views) }}</text></view>
                <view class="list-td col-r-likes" style="justify-content:flex-end;"><text class="like-num">♥ {{ fmtNum(r.likes) }}</text></view>
                <view class="list-td col-r-user">
                  <view class="merchant-info">
                    <view class="merchant-avatar"><image :src="getUserAvatar(r.userId)" mode="aspectFill" /></view>
                    <view>
                      <view class="product-name" style="font-size:24rpx;">{{ r.userName }}</view>
                      <view class="product-sku">{{ r.userId }}</view>
                    </view>
                  </view>
                </view>
              </view>

              <view v-if="displayReviewList.length === 0" class="list-tr empty-row">
                <view class="list-td" style="width:100%;justify-content:center;color:#999;">该分类暂无评价数据</view>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </scroll-view>

    <!-- 查看详情弹窗 -->
    <view v-if="detailVisible" class="review-mask" @click="closeDetail">
      <view class="review-modal" @click.stop>
        <view class="review-modal-header">
          <text class="rm-title">评价详情</text>
          <view class="rm-close" @click="closeDetail"><text>×</text></view>
        </view>
        <scroll-view scroll-y class="review-modal-body">
          <template v-if="detailReview">
            <view class="rm-section rm-rating-row">
              <text class="rm-star">{{ starStr(detailReview.rating) }}</text>
              <text class="level-tag" :class="'level-' + detailReview.levelKey">{{ detailReview.level }}</text>
            </view>

            <view class="rm-section">
              <view class="rm-user">
                <view class="merchant-avatar rm-avatar"><image :src="getUserAvatar(detailReview.userId)" mode="aspectFill" /></view>
                <view>
                  <view class="product-name">{{ detailReview.userName }}</view>
                  <view class="product-sku">{{ detailReview.userId }} · {{ detailReview.reviewTime }}</view>
                </view>
              </view>
            </view>

            <view class="rm-section">
              <text class="rm-label">评论内容</text>
              <text class="rm-content">{{ detailReview.content }}</text>
            </view>

            <view class="rm-section" v-if="reviewPhotos(detailReview).length">
              <text class="rm-label">评论图片</text>
              <view class="rm-photos">
                <image v-for="(p, i) in reviewPhotos(detailReview)" :key="i" :src="p" mode="aspectFill" class="rm-photo" />
              </view>
            </view>

            <view class="rm-section" v-if="detailReview.followUp">
              <text class="rm-label">追评</text>
              <text class="rm-content rm-follow">{{ detailReview.followUp }}</text>
            </view>

            <view class="rm-section">
              <text class="rm-label">商品信息</text>
              <view class="rm-product">
                <view class="cover-thumb rm-prod-cover"><image :src="getProductCover(detailReview.prodSku)" mode="aspectFill" /></view>
                <view class="rm-prod-info">
                  <text class="product-name">{{ detailReview.prodName }}</text>
                  <text class="product-sku">规格：{{ detailReview.prodSpec }}</text>
                  <text class="order-price">{{ fmtPrice(detailReview.prodPrice) }}</text>
                </view>
              </view>
            </view>

            <view class="rm-section rm-data-row">
              <view class="rm-data-item">
                <text class="rm-data-num">{{ fmtNum(detailReview.views) }}</text>
                <text class="product-sku">浏览量</text>
              </view>
              <view class="rm-data-item">
                <text class="rm-data-num like-num">♥ {{ fmtNum(detailReview.likes) }}</text>
                <text class="product-sku">点赞</text>
              </view>
            </view>
          </template>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
  import { getUserAvatar } from '../../common/user-avatar.js'
  import { getProductCover, getProductCovers } from '../../common/product-image.js'
  import { normFilterVal, paginateList } from '../../common/list-filter.js'

  function withinReviewTime(dateStr, range) {
    if (!range || range === '全部' || !dateStr) return true
    const today = new Date(); today.setHours(23, 59, 59, 999)
    const d = new Date(String(dateStr).replace(/-/g, '/'))
    const diffMs = today - d
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (range === '近24小时') return diffHours >= 0 && diffHours <= 24
    if (range === '近7天') return diffDays >= 0 && diffDays <= 7
    if (range === '近30天') return diffDays >= 0 && diffDays <= 30
    if (range === '近3个月') return diffDays >= 0 && diffDays <= 90
    if (range === '近半年') return diffDays >= 0 && diffDays <= 180
    return true
  }

  export default {
    data() {
      return {
        reviewTabs: ['商品评价', '话题评价', '动态评价', '种草评价', '文章评价'],
        activeTab: '商品评价',
        pageSizeList: ['10', '20', '50'],
        pageSize: '10',
        currentPage: 1,
        filterRating: ['全部', '5星', '4星', '3星', '2星', '1星'],
        filterHeat: ['全部', '高', '中', '低'],
        filterTime: ['全部', '近24小时', '近7天', '近30天', '近3个月', '近半年'],
        reviewFilterForm: { ratingIdx: 0, heatIdx: 0, timeIdx: 0, prodIdx: 0 },
        appliedFilter: { rating: null, heat: '', time: '', prod: '' },
        detailVisible: false,
        detailReview: null,
        reviewList: [
          { id: 'PJ202608260001', type: '商品评价', content: '神仙水名不虚传，用了两周肤色明显透亮，闭口也少了很多，湿敷效果更好，会回购！', photoCount: 3, rating: 5, level: '好评', levelKey: 'good', reviewTime: '2026-08-26 10:20:11', prodSku: 'sk2-ess-230-01', prodName: 'SK-II 神仙水精华露 230ml', prodSpec: '230ml', prodPrice: 1699, followUp: '用了三个月后来追评，皮肤状态很稳定，值得入手。', views: 1286, likes: 96, heat: '高', userId: 'U20240105', userName: '林予安', _checked: false },
          { id: 'PJ202608250102', type: '商品评价', content: '兰蔻小黑瓶吸收很快，质地清爽不油腻，保湿效果不错，就是价格小贵。', photoCount: 2, rating: 4, level: '好评', levelKey: 'good', reviewTime: '2026-08-25 21:05:33', prodSku: 'lc-gx-50-009', prodName: '兰蔻小黑瓶精华肌底液 50ml', prodSpec: '50ml', prodPrice: 980, followUp: '', views: 862, likes: 45, heat: '中', userId: 'U20240088', userName: '沈清欢', _checked: false },
          { id: 'PJ202608240118', type: '商品评价', content: '小棕瓶眼霜用了没太大感觉，黑眼圈改善不明显，可能要坚持用。', photoCount: 1, rating: 3, level: '中评', levelKey: 'mid', reviewTime: '2026-08-24 15:40:02', prodSku: 'el-eye-15-022', prodName: '雅诗兰黛小棕瓶眼霜 15ml', prodSpec: '15ml', prodPrice: 540, followUp: '坚持一个月后眼周细纹确实淡了一些，加一星。', views: 540, likes: 12, heat: '中', userId: 'U20240256', userName: '顾惜月', _checked: false },
          { id: 'PJ202608230098', type: '商品评价', content: '面霜上脸有点厚重，油皮不太友好，容易闷痘，性价比一般。', photoCount: 0, rating: 2, level: '差评', levelKey: 'bad', reviewTime: '2026-08-23 09:12:45', prodSku: 'wm-rj-01-n', prodName: '海蓝之谜经典面霜 60ml', prodSpec: '60ml', prodPrice: 2680, followUp: '', views: 398, likes: 5, heat: '低', userId: 'U20240032', userName: '叶知夏', _checked: false },
          { id: 'PJ202608220065', type: '商品评价', content: '洁面泡沫很温和，敏感肌用着放心，洗完不紧绷，回购很多次了。', photoCount: 2, rating: 5, level: '好评', levelKey: 'good', reviewTime: '2026-08-22 18:30:20', prodSku: 'crl-jm-150ml', prodName: '珂润润浸保湿洁颜泡沫 150ml', prodSpec: '150ml', prodPrice: 149, followUp: '', views: 986, likes: 66, heat: '高', userId: 'U20240102', userName: '苏念初', _checked: false },
          { id: 'PJ202608210077', type: '商品评价', content: '色修精华质地轻薄，淡化痘印确实有效果，就是香味有点浓。', photoCount: 1, rating: 4, level: '好评', levelKey: 'good', reviewTime: '2026-08-21 11:22:09', prodSku: 'xlk-sx-30ml', prodName: '修丽可色修精华 30ml', prodSpec: '30ml', prodPrice: 780, followUp: '', views: 702, likes: 33, heat: '中', userId: 'U20240608', userName: '陆星眠', _checked: false },
          { id: 'PJ202608200033', type: '商品评价', content: '买给妈妈的，她说很滋润，冬天用刚刚好，物流也很快。', photoCount: 3, rating: 5, level: '好评', levelKey: 'good', reviewTime: '2026-08-20 20:45:18', prodSku: 'lk-jc-60-m', prodName: '兰蔻菁纯臻颜精萃乳霜 60ml', prodSpec: '60ml', prodPrice: 2180, followUp: '妈妈自己回购了，说很好用。', views: 1120, likes: 78, heat: '高', userId: 'U20240901', userName: '程予薇', _checked: false },
          { id: 'PJ202608190044', type: '商品评价', content: '小棕瓶精华保湿还行，但没有宣传的那么神奇，中规中矩吧。', photoCount: 0, rating: 3, level: '中评', levelKey: 'mid', reviewTime: '2026-08-19 14:08:55', prodSku: 'el-xzp-75b', prodName: '雅诗兰黛小棕瓶修护精华 75ml', prodSpec: '75ml', prodPrice: 1490, followUp: '', views: 460, likes: 9, heat: '低', userId: 'U20240208', userName: '宋软软', _checked: false },
          { id: 'PJ202608180021', type: '商品评价', content: '乳液便宜大碗，补水效果在线，夏天用也不油腻，性价比高。', photoCount: 2, rating: 5, level: '好评', levelKey: 'good', reviewTime: '2026-08-18 16:33:27', prodSku: 'loreal-fy-110m', prodName: '欧莱雅复颜玻尿酸水光充盈乳液 110ml', prodSpec: '110ml', prodPrice: 299, followUp: '', views: 890, likes: 52, heat: '高', userId: 'U20240612', userName: '方知予', _checked: false },
          { id: 'PJ202608170056', type: '商品评价', content: '大红瓶修复力不错，用了一段时间皮肤状态好了很多，就是味道不太喜欢。', photoCount: 1, rating: 4, level: '好评', levelKey: 'good', reviewTime: '2026-08-17 19:50:40', prodSku: 'sk2-dhp-80g-a', prodName: 'SK-II 大红瓶面霜 80g', prodSpec: '80g', prodPrice: 1399, followUp: '', views: 620, likes: 28, heat: '中', userId: 'U20240076', userName: '唐小鹿', _checked: false },
          { id: 'PJ202608160089', type: '商品评价', content: '和专柜买的质地不太一样，有点稀，怀疑不是正品。', photoCount: 0, rating: 2, level: '差评', levelKey: 'bad', reviewTime: '2026-08-16 10:15:36', prodSku: 'lc-gx-50-009', prodName: '兰蔻小黑瓶精华肌底液 50ml', prodSpec: '50ml', prodPrice: 980, followUp: '', views: 305, likes: 4, heat: '低', userId: 'U20241102', userName: '周小满', _checked: false },
          { id: 'PJ202608150012', type: '商品评价', content: '敏感期只用这个，泡沫绵密不刺激，已经推荐给闺蜜了。', photoCount: 3, rating: 5, level: '好评', levelKey: 'good', reviewTime: '2026-08-15 22:05:48', prodSku: 'crl-jm-150ml', prodName: '珂润润浸保湿洁颜泡沫 150ml', prodSpec: '150ml', prodPrice: 149, followUp: '空瓶两个了，会一直回购。', views: 1345, likes: 112, heat: '高', userId: 'U20240888', userName: '何以安', _checked: false }
        ]
      }
    },
    computed: {
      filterProdNames() {
        const names = ['全部']
        this.reviewList.forEach(r => { if (r.prodName && names.indexOf(r.prodName) < 0) names.push(r.prodName) })
        return names
      },
      pageSizeNum() { return parseInt(this.pageSize, 10) || 10 },
      filteredReviewList() {
        const f = this.appliedFilter
        return this.reviewList.filter(r => {
          if (r.type !== this.activeTab) return false
          if (f.rating != null && r.rating !== f.rating) return false
          if (f.heat && r.heat !== f.heat) return false
          if (f.prod && r.prodName !== f.prod) return false
          if (!withinReviewTime(r.reviewTime, f.time)) return false
          return true
        })
      },
      maxPage() {
        return Math.max(1, Math.ceil(this.filteredReviewList.length / this.pageSizeNum))
      },
      displayReviewList() {
        return paginateList(this.filteredReviewList, this.currentPage, this.pageSizeNum).items
      },
      checkedCount() { return this.reviewList.filter(r => r._checked).length },
      isAllChecked() {
        const list = this.displayReviewList
        return list.length > 0 && list.every(r => r._checked)
      }
    },
    methods: {
      getUserAvatar,
      getProductCover,
      reviewPhotos(r) {
        const n = r.photoCount || 0
        if (n <= 0) return []
        return getProductCovers(r.prodSku, n)
      },
      starStr(rating) {
        const n = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)))
        return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n)
      },
      fmtPrice(v) {
        const num = Math.round(Number(v || 0) * 100) / 100
        return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      },
      fmtNum(v) { return Number(v || 0).toLocaleString('zh-CN') },
      goBack() {
        uni.navigateBack({ delta: 1, fail: () => { uni.reLaunch({ url: '/admin/index' }) } })
      },
      switchTab(t) {
        this.activeTab = t
        this.currentPage = 1
        this.resetFilter()
      },
      applySearch() {
        const f = this.reviewFilterForm
        const rLabel = this.filterRating[f.ratingIdx]
        this.appliedFilter = {
          rating: rLabel === '全部' ? null : parseInt(rLabel, 10),
          heat: normFilterVal(this.filterHeat[f.heatIdx]),
          time: normFilterVal(this.filterTime[f.timeIdx]),
          prod: normFilterVal(this.filterProdNames[f.prodIdx])
        }
        this.currentPage = 1
      },
      resetFilter() {
        this.reviewFilterForm = { ratingIdx: 0, heatIdx: 0, timeIdx: 0, prodIdx: 0 }
        this.appliedFilter = { rating: null, heat: '', time: '', prod: '' }
        this.currentPage = 1
      },
      onPageSizeChange(e) {
        this.pageSize = this.pageSizeList[e.detail.value]
        this.currentPage = 1
      },
      prevPage() { if (this.currentPage > 1) this.currentPage-- },
      nextPage() { if (this.currentPage < this.maxPage) this.currentPage++ },
      toggleCheckAll(e) {
        const checked = e.detail.value && e.detail.value.length > 0
        this.displayReviewList.forEach(r => { this.$set(r, '_checked', checked) })
      },
      toggleRowCheck(r) { this.$set(r, '_checked', !r._checked) },
      openDetail(r) {
        this.detailReview = r
        this.detailVisible = true
      },
      closeDetail() {
        this.detailVisible = false
        this.detailReview = null
      },
      batchOp(action) {
        const list = this.reviewList.filter(r => r._checked)
        if (action === 'import') {
          uni.showToast({ title: '请选择要导入的评价文件', icon: 'none' })
          return
        }
        if (action === 'export') {
          const exportList = list.length ? list : this.filteredReviewList
          uni.showToast({ title: '已导出 ' + exportList.length + ' 条', icon: 'none' })
          return
        }
        if (!list.length) {
          uni.showToast({ title: '请先勾选评价', icon: 'none' })
          return
        }
        if (action === 'view') {
          if (list.length !== 1) { uni.showToast({ title: '请勾选1条查看', icon: 'none' }); return }
          this.openDetail(list[0])
        } else if (action === 'edit') {
          if (list.length !== 1) { uni.showToast({ title: '请勾选1条编辑', icon: 'none' }); return }
          uni.showToast({ title: '编辑：' + list[0].id, icon: 'none' })
        }
      }
    }
  }
</script>

<style lang="scss">
@import '../../uni.scss';

.sub-page { min-height: 100vh; background: $purple-surface; display: flex; flex-direction: column; }
.header-bar { height: 88rpx; min-height: 88rpx; background: linear-gradient(135deg, $primary-color, $primary-light); display: flex; align-items: center; justify-content: space-between; padding: 0 28rpx; box-shadow: 0 4rpx 16rpx rgba($primary-color, 0.25); flex-shrink: 0; }
.back-btn { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; }
.back-arrow { font-size: 56rpx; font-weight: 300; color: #fff; line-height: 1; }
.header-title { font-size: 32rpx; font-weight: 700; color: #fff; letter-spacing: 1rpx; }
.page-body { flex: 1; padding: 40rpx; height: 0; }

.review-container { width: 100%; display: flex; flex-direction: column; gap: 24rpx; }

/* 分类标签 */
.tab-bar { display: flex; gap: 16rpx; flex-wrap: wrap; }
.tab-item {
  height: 64rpx; line-height: 64rpx; padding: 0 32rpx; border-radius: 999rpx;
  background: #fff; color: #666; font-size: 24rpx; box-shadow: 0 4rpx 16rpx rgba($primary-color, 0.06);
}
.tab-active {
  background: linear-gradient(135deg, $primary-color, $primary-light); color: #fff; font-weight: 600;
  box-shadow: 0 6rpx 16rpx rgba($primary-color, 0.28);
}

.filter-bar { background: #fff; border-radius: 24rpx; padding: 24rpx 32rpx 8rpx; box-shadow: 0 4rpx 20rpx rgba($primary-color, 0.06); }
.filter-row { display: flex; flex-wrap: wrap; align-items: center; gap: 24rpx 28rpx; margin-bottom: 20rpx; }
.filter-item { display: flex; align-items: center; gap: 10rpx; flex-shrink: 0; }
.filter-label { font-size: 24rpx; color: #666; white-space: nowrap; }
.filter-input { height: 64rpx; line-height: 64rpx; padding: 0 20rpx; border: 0; border-radius: 12rpx; background: $purple-surface; font-size: 24rpx; color: #333; width: 220rpx; }
.filter-input-picker { display: flex; align-items: center; }
.filter-input-wide { width: 380rpx; }
.filter-actions { display: flex; gap: 16rpx; margin-left: auto; padding-bottom: 12rpx; }

.btn { height: 64rpx; line-height: 64rpx; padding: 0 28rpx; border-radius: 999rpx; border: 1px solid #E0DAEE; font-size: 24rpx; display: inline-flex; align-items: center; background: #fff; color: #555; white-space: nowrap; }
.btn-primary { background: linear-gradient(135deg, $primary-color, $primary-light); color: #fff; font-weight: 500; border: 0; box-shadow: 0 6rpx 16rpx rgba($primary-color, 0.28); }
.btn-default { background: #fff; color: #555; }

.action-bar { background: #fff; border-radius: 24rpx; padding: 24rpx 32rpx; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20rpx; box-shadow: 0 4rpx 20rpx rgba($primary-color, 0.06); }
.action-left, .action-right { display: flex; align-items: center; gap: 16rpx; flex-wrap: wrap; }
.batch-count { font-size: 24rpx; color: #888; margin-left: 8rpx; }
.batch-count .batch-num { color: $primary-color; font-weight: 600; }
.order-action-pager { font-size: 24rpx; color: #666; }
.page-size-select { height: 56rpx; line-height: 56rpx; padding: 0 16rpx; border-radius: 12rpx; background: $purple-surface; font-size: 22rpx; }
.page-btn { height: 56rpx; line-height: 56rpx; padding: 0 20rpx; border-radius: 12rpx; border: 1px solid #E0DAEE; background: #fff; font-size: 22rpx; color: #555; }
.page-btn[disabled] { opacity: 0.45; }

.list-wrap { background: #fff; border-radius: 24rpx; box-shadow: 0 4rpx 20rpx rgba($primary-color, 0.06); overflow: hidden; }
.list-scroll { width: 100%; white-space: nowrap; }
.list-table { display: inline-block; min-width: 3600rpx; font-size: 24rpx; vertical-align: top; }
.list-tr { display: flex; width: 100%; align-items: stretch; }
.list-th { background: #FAF8FF; }
.list-th .list-td { color: #555; font-weight: 600; }
.list-td { padding: 22rpx 20rpx; color: #333; display: inline-flex; align-items: center; box-sizing: border-box; flex-shrink: 0; white-space: nowrap; overflow: hidden; }
.list-tbody:nth-child(even) { background: #FCFBFF; }
.empty-row { justify-content: center; }

.col-check { width: 80rpx; justify-content: center; }
.col-r-op { width: 100rpx; }
.col-r-id { width: 250rpx; }
.col-r-content { width: 440rpx; }
.col-r-imgs { width: 210rpx; }
.col-r-rating { width: 180rpx; }
.col-r-time { width: 230rpx; }
.col-r-cover { width: 100rpx; justify-content: center; }
.col-r-name { width: 340rpx; }
.col-r-spec { width: 140rpx; }
.col-r-price { width: 150rpx; }
.col-r-follow { width: 280rpx; }
.col-r-views { width: 140rpx; }
.col-r-likes { width: 120rpx; }
.col-r-user { width: 240rpx; }

.cover-thumb { width: 72rpx; height: 72rpx; border-radius: 12rpx; overflow: hidden; background: #F5F3FF; flex-shrink: 0; }
.cover-thumb image { width: 100%; height: 100%; }
.merchant-info { display: flex; align-items: center; gap: 12rpx; }
.merchant-avatar { width: 48rpx; height: 48rpx; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
.merchant-avatar image { width: 100%; height: 100%; }
.product-name { font-weight: 500; color: #333; }
.product-id { font-size: 22rpx; color: #6B5CAD; font-family: monospace; }
.product-sku { font-size: 22rpx; color: #999; }
.order-op-link { color: $primary-color; font-size: 24rpx; }
.order-price { color: #EF4444; font-weight: 600; font-size: 24rpx; }
.order-price::before { content: '¥'; font-size: 20rpx; margin-right: 2rpx; }
.stat-num { font-weight: 600; }
.review-content { font-size: 24rpx; color: #444; }
.review-follow { font-size: 24rpx; color: #7C5CF0; }
.like-num { color: #F472B6; font-weight: 600; }

.review-photos { display: flex; gap: 6rpx; }
.review-photo { width: 56rpx; height: 56rpx; border-radius: 10rpx; flex-shrink: 0; background: #F5F3FF; }

.rating-cell { display: flex; flex-direction: column; align-items: flex-start; gap: 4rpx; }
.star-text { font-size: 22rpx; color: #F59E0B; letter-spacing: 1rpx; line-height: 1; }
.level-tag { display: inline-block; padding: 2rpx 10rpx; border-radius: 8rpx; font-size: 20rpx; font-weight: 500; }
.level-good { background: #D1FAE5; color: #065F46; }
.level-mid { background: #FEF3C7; color: #92400E; }
.level-bad { background: #FEE2E2; color: #991B1B; }

/* 查看详情弹窗 */
.review-mask {
  position: fixed; left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(20, 12, 48, 0.5); z-index: 999;
  display: flex; align-items: center; justify-content: center; padding: 40rpx;
}
.review-modal {
  width: 100%; max-width: 680rpx; background: #fff; border-radius: 28rpx;
  overflow: hidden; box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.25);
  display: flex; flex-direction: column; max-height: 82vh;
}
.review-modal-header {
  height: 96rpx; padding: 0 32rpx; display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(135deg, $primary-color, $primary-light); flex-shrink: 0;
}
.rm-title { font-size: 32rpx; font-weight: 700; color: #fff; }
.rm-close { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; font-size: 48rpx; color: #fff; line-height: 1; }
.review-modal-body { padding: 32rpx; max-height: calc(82vh - 96rpx); }
.rm-section { padding-bottom: 28rpx; margin-bottom: 24rpx; border-bottom: 1px solid $purple-border; }
.rm-section:last-child { border-bottom: 0; margin-bottom: 0; }
.rm-rating-row { display: flex; align-items: center; gap: 16rpx; }
.rm-star { font-size: 34rpx; color: #F59E0B; letter-spacing: 2rpx; }
.rm-user { display: flex; align-items: center; gap: 16rpx; }
.rm-avatar { width: 72rpx; height: 72rpx; }
.rm-label { display: block; font-size: 24rpx; color: #999; margin-bottom: 12rpx; }
.rm-content { font-size: 28rpx; color: #333; line-height: 1.6; white-space: normal; }
.rm-follow { color: #7C5CF0; background: #F5F3FF; padding: 16rpx 20rpx; border-radius: 12rpx; display: block; }
.rm-photos { display: flex; flex-wrap: wrap; gap: 12rpx; }
.rm-photo { width: 160rpx; height: 160rpx; border-radius: 12rpx; background: #F5F3FF; }
.rm-product { display: flex; align-items: center; gap: 20rpx; }
.rm-prod-cover { width: 96rpx; height: 96rpx; }
.rm-prod-info { display: flex; flex-direction: column; gap: 8rpx; }
.rm-data-row { display: flex; gap: 48rpx; }
.rm-data-item { display: flex; flex-direction: column; gap: 4rpx; align-items: center; }
.rm-data-num { font-size: 34rpx; font-weight: 700; color: #333; }
</style>
