<template>
  <view class="sub-page">
    <view class="header-bar">
      <view class="back-btn" @click="goBack"><text class="back-arrow">‹</text></view>
      <text class="header-title">商品管理</text>
      <view style="width:56rpx"></view>
    </view>

    <scroll-view scroll-y class="page-body">
      <!-- ============ 商品管理完整内容 ============ -->
      <view class="product-container">
        <!-- 筛选项 -->
        <view class="filter-bar">
          <view class="filter-row">
            <view class="filter-item">
              <text class="filter-label">关键词</text>
              <input class="filter-input" type="text" placeholder="商品名称/ID/SKU" />
            </view>
            <view class="filter-item">
              <text class="filter-label">一级分类</text>
              <picker :range="filterCat1" @change="e=>filterForm.cat1=filterCat1[e.detail.value]">
                <view class="filter-input filter-input-picker">
                  <text :class="{placeholder: !filterForm.cat1}">{{ filterForm.cat1 || '全部' }}</text>
                </view>
              </picker>
            </view>
            <view class="filter-item">
              <text class="filter-label">二级分类</text>
              <picker :range="filterCat2" @change="e=>filterForm.cat2=filterCat2[e.detail.value]">
                <view class="filter-input filter-input-picker">
                  <text :class="{placeholder: !filterForm.cat2}">{{ filterForm.cat2 || '全部' }}</text>
                </view>
              </picker>
            </view>
            <view class="filter-item">
              <text class="filter-label">三级分类</text>
              <picker :range="filterCat3" @change="e=>filterForm.cat3=filterCat3[e.detail.value]">
                <view class="filter-input filter-input-picker">
                  <text :class="{placeholder: !filterForm.cat3}">{{ filterForm.cat3 || '全部' }}</text>
                </view>
              </picker>
            </view>
            <view class="filter-item">
              <text class="filter-label">品牌</text>
              <picker :range="filterBrand" @change="e=>filterForm.brand=filterBrand[e.detail.value]">
                <view class="filter-input filter-input-picker">
                  <text :class="{placeholder: !filterForm.brand}">{{ filterForm.brand || '全部' }}</text>
                </view>
              </picker>
            </view>
            <view class="filter-item">
              <text class="filter-label">所属商家</text>
              <picker :range="filterMerchant" @change="e=>filterForm.merchant=filterMerchant[e.detail.value]">
                <view class="filter-input filter-input-picker">
                  <text :class="{placeholder: !filterForm.merchant}">{{ filterForm.merchant || '全部' }}</text>
                </view>
              </picker>
            </view>
            <view class="filter-item">
              <text class="filter-label">上下架</text>
              <picker :range="filterStatus" @change="e=>filterForm.status=filterStatus[e.detail.value]">
                <view class="filter-input filter-input-picker">
                  <text :class="{placeholder: !filterForm.status}">{{ filterForm.status || '全部' }}</text>
                </view>
              </picker>
            </view>
            <view class="filter-item">
              <text class="filter-label">审核状态</text>
              <picker :range="filterAudit" @change="e=>filterForm.audit=filterAudit[e.detail.value]">
                <view class="filter-input filter-input-picker">
                  <text :class="{placeholder: !filterForm.audit}">{{ filterForm.audit || '全部' }}</text>
                </view>
              </picker>
            </view>
            <view class="filter-actions">
              <view class="btn btn-primary"><text>🔍 查询</text></view>
              <view class="btn btn-default" @click="resetFilter"><text>↺ 重置</text></view>
            </view>
          </view>
        </view>

        <!-- 操作项 -->
        <view class="action-bar">
          <view class="action-left">
            <view class="btn btn-primary"><text>➕ 新增</text></view>
            <view class="btn btn-info"><text>✏ 编辑</text></view>
            <view class="btn btn-danger"><text>🗑 删除</text></view>
            <view class="btn btn-success"><text>⬆ 上架</text></view>
            <view class="btn btn-warning"><text>⬇ 下架</text></view>
            <view class="btn btn-default"><text>✅ 审核</text></view>
          </view>
          <view class="action-right">
            <text class="batch-count">已选 <text class="batch-num">{{ checkedCount }}</text> 项</text>
            <view class="btn btn-default"><text>📤 导出</text></view>
            <view class="btn btn-default"><text>📥 导入</text></view>
          </view>
        </view>

        <!-- 列表项 -->
        <view class="list-wrap">
          <scroll-view scroll-x class="list-scroll">
            <view class="list-table">
              <!-- 表头 -->
              <view class="list-tr list-th">
                <view class="list-td col-check">
                  <checkbox :checked="isAllChecked" @change="toggleCheckAll" color="#8B7CF6" style="transform:scale(0.85);" />
                </view>
                <view class="list-td col-op">操作</view>
                <view class="list-td col-audit">审核状态</view>
                <view class="list-td col-shelf">上下架</view>
                <view class="list-td col-cover">封面</view>
                <view class="list-td col-id">商品ID</view>
                <view class="list-td col-name">商品名称</view>
                <view class="list-td col-brand">品牌</view>
                <view class="list-td col-sku">SKU编码</view>
                <view class="list-td col-cat1">一级分类</view>
                <view class="list-td col-cat2">二级分类</view>
                <view class="list-td col-cat3">三级分类</view>
                <view class="list-td col-price">价格</view>
                <view class="list-td col-stock">库存</view>
                <view class="list-td col-merchant">所属商家</view>
                <view class="list-td col-fav">收藏量</view>
                <view class="list-td col-review">评论量</view>
                <view class="list-td col-order">订单量</view>
                <view class="list-td col-gmv">交易额</view>
              </view>
              <!-- 数据行 -->
              <view class="list-tr list-tbody" v-for="(p, idx) in productList" :key="p.id">
                <view class="list-td col-check">
                  <checkbox :checked="!!p._checked" @change="toggleRowCheck(idx)" color="#8B7CF6" style="transform:scale(0.85);" />
                </view>
                <view class="list-td col-op">
                  <view class="row-ops">
                    <view class="btn btn-mini btn-info"><text class="op-icon">✏</text><text>编辑</text></view>
                    <view class="btn btn-mini btn-danger"><text class="op-icon">🗑</text><text>删除</text></view>
                    <view class="btn btn-mini" :class="p.status === '已下架' ? 'btn-shelve-up-active' : 'btn-shelve-muted'"><text class="op-icon">⬆</text><text>上架</text></view>
                    <view class="btn btn-mini" :class="p.status === '已下架' ? 'btn-shelve-muted' : 'btn-shelve-down-active'"><text class="op-icon">⬇</text><text>下架</text></view>
                    <view class="btn btn-mini" :class="productAuditKey(p) === 'pending' ? 'btn-warning' : 'btn-default'"><text class="op-icon">✅</text><text>审核</text></view>
                  </view>
                </view>
                <view class="list-td col-audit">
                  <text class="status-tag" :class="'audit-' + productAuditKey(p)">{{ p.auditStatus || '待审核' }}</text>
                </view>
                <view class="list-td col-shelf">
                  <text class="status-tag" :class="p.status === '已下架' ? 'shelf-off' : 'shelf-on'">{{ p.status || '已上架' }}</text>
                </view>
                <view class="list-td col-cover">
                  <view class="cover-thumb"><image :src="getProductCover(p.id || p.sku)" mode="aspectFill"></image></view>
                </view>
                <view class="list-td col-id"><text class="product-id">{{ p.id }}</text></view>
                <view class="list-td col-name"><text class="product-name">{{ p.name }}</text></view>
                <view class="list-td col-brand"><text>{{ p.brand }}</text></view>
                <view class="list-td col-sku"><text class="product-sku">{{ p.sku }}</text></view>
                <view class="list-td col-cat1"><text class="cat-tag">{{ p.cat1 }}</text></view>
                <view class="list-td col-cat2"><text class="cat-tag">{{ p.cat2 }}</text></view>
                <view class="list-td col-cat3"><text class="cat-tag">{{ p.cat3 }}</text></view>
                <view class="list-td col-price"><text class="price-num">{{ fmtPrice(p.price) }}</text></view>
                <view class="list-td col-stock">
                  <text v-if="p.stock <= 0" class="stock-out">缺货</text>
                  <text v-else class="stock-num" :class="{ low: p.stock < 50 }">{{ fmtInt(p.stock) }}</text>
                </view>
                <view class="list-td col-merchant">
                  <view class="merchant-info">
                    <view class="merchant-avatar"><text>{{ p.merchantLetter }}</text></view>
                    <text class="merchant-name">{{ p.merchant }}</text>
                  </view>
                </view>
                <view class="list-td col-fav"><text class="stat-num">{{ fmtInt(p.fav) }}</text></view>
                <view class="list-td col-review"><text class="stat-num">{{ fmtInt(p.review) }}</text></view>
                <view class="list-td col-order"><text class="stat-num">{{ fmtInt(p.order) }}</text></view>
                <view class="list-td col-gmv"><text class="gmv-num">{{ fmtPrice(p.gmv) }}</text></view>
              </view>
            </view>
          </scroll-view>

          <!-- 分页 -->
          <view class="pagination">
            <text class="total-text">共 <text class="b">{{ productList.length }}</text> 条记录，当前第 <text class="b">1</text> / <text class="b">1</text> 页</text>
            <view class="pager-wrap">
              <picker :range="pageSizeList" @change="e=>pageSize=pageSizeList[e.detail.value]">
                <view class="page-size-select"><text>{{ pageSize }}</text></view>
              </picker>
              <view class="pager">
                <view class="page-btn disabled"><text>‹</text></view>
                <view class="page-btn active"><text>1</text></view>
                <view class="page-btn disabled"><text>›</text></view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getProductCover } from '../../common/product-image.js'

export default {
  data() {
    const IMG = (p) => 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' + encodeURIComponent(p) + '&image_size=square'
    return {
      // 筛选项选项
      filterCat1: ['全部','护肤','彩妆','个护','香水','家居'],
      filterCat2: ['全部','面部护肤','身体护理','眼部护理','面部彩妆','唇部彩妆'],
      filterCat3: ['全部','洁面','爽肤水','精华','乳液/面霜','面膜','眼霜','粉底','口红'],
      filterBrand: ['全部','SK-II','Lancôme','Estée Lauder','完美日记','花西子','自然堂'],
      filterMerchant: ['全部','阅己美妆旗舰店','优品美妆专营','花语甄选店','海蓝精选','丽人全球购'],
      filterStatus: ['全部','已上架','已下架'],
      filterAudit: ['全部','待审核','审核通过','审核未通过'],
      filterForm: { cat1:'', cat2:'', cat3:'', brand:'', merchant:'', status:'', audit:'' },
      pageSizeList: ['10 条/页','20 条/页','50 条/页'],
      pageSize: '10 条/页',
      // 商品mock数据
      productList: [
        {
          id: 'SP100001', name: '神仙水精华露 230ml 补水保湿提亮', brand: 'SK-II',
          sku: 'SK2-ESS-230-01', cat1: '护肤', cat2: '面部护肤', cat3: '精华',
          price: 1599.00, stock: 328, merchant: '阅己美妆旗舰店', merchantLetter: '阅',
          cover: IMG('sk2 essence bottle 230ml luxury skincare product photography studio white background clean'),
          fav: 12580, review: 3421, order: 8762, gmv: 12894566.00, status: '已上架', auditStatus: '审核通过'
        },
        {
          id: 'SP100002', name: '小黑瓶肌底修护精华液 50ml', brand: 'Lancôme',
          sku: 'LC-GX-50-009', cat1: '护肤', cat2: '面部护肤', cat3: '精华',
          price: 980.00, stock: 12, merchant: '优品美妆专营', merchantLetter: '优',
          cover: IMG('lancome advanced genifique serum 50ml black bottle luxury skincare product photo white background'),
          fav: 8924, review: 2156, order: 5432, gmv: 4894360.00, status: '已上架', auditStatus: '审核通过'
        },
        {
          id: 'SP100003', name: '小棕瓶眼霜 15ml 抗蓝光紧致', brand: 'Estée Lauder',
          sku: 'EL-EYE-15-022', cat1: '护肤', cat2: '眼部护理', cat3: '眼霜',
          price: 590.00, stock: 876, merchant: '海蓝精选', merchantLetter: '海',
          cover: IMG('estee lauder advanced night repair eye cream 15ml jar skincare product photography studio'),
          fav: 6712, review: 1680, order: 3980, gmv: 2177640.00, status: '已上架', auditStatus: '审核通过'
        },
        {
          id: 'SP100004', name: '羽毛气垫粉底液 自然色 SPF50+', brand: '完美日记',
          sku: 'WM-RJ-01-N', cat1: '彩妆', cat2: '面部彩妆', cat3: '粉底',
          price: 219.00, stock: 2450, merchant: '阅己美妆旗舰店', merchantLetter: '阅',
          cover: IMG('cushion compact foundation bb cream case natural beige cosmetics product photography white background'),
          fav: 15320, review: 5642, order: 18230, gmv: 3624750.00, status: '已上架', auditStatus: '审核通过'
        },
        {
          id: 'SP100005', name: '花西子同心锁口红 哑光雾面 M301', brand: '花西子',
          sku: 'HXZ-KS-M301', cat1: '彩妆', cat2: '唇部彩妆', cat3: '口红',
          price: 169.00, stock: 5200, merchant: '花语甄选店', merchantLetter: '花',
          cover: IMG('chinese style red lipstick matte tube carved floral luxury cosmetics product photo studio white'),
          fav: 24180, review: 9287, order: 36720, gmv: 5873280.00, status: '已上架', auditStatus: '审核通过'
        },
        {
          id: 'SP100006', name: '自然堂喜马拉雅冰川水 160ml', brand: '自然堂',
          sku: 'ZRT-BS-160-A', cat1: '护肤', cat2: '面部护肤', cat3: '爽肤水',
          price: 118.00, stock: 0, merchant: '丽人全球购', merchantLetter: '丽',
          cover: IMG('chando himalaya glacier toner bottle 160ml skincare product shot transparent bottle blue'),
          fav: 4230, review: 1089, order: 2780, gmv: 310520.00, status: '已下架', auditStatus: '审核通过'
        },
        {
          id: 'SP100007', name: '氨基酸净透洁面乳 120g 温和不紧绷', brand: '完美日记',
          sku: 'WM-JM-120-03', cat1: '护肤', cat2: '面部护肤', cat3: '洁面',
          price: 69.00, stock: 9800, merchant: '优品美妆专营', merchantLetter: '优',
          cover: IMG('amino acid gentle facial cleanser white tube 120g skincare product photography clean white background'),
          fav: 9456, review: 3012, order: 15400, gmv: 987600.00, status: '已下架', auditStatus: '待审核'
        },
        {
          id: 'SP100008', name: '玻尿酸补水保湿面膜 10片装', brand: '自然堂',
          sku: 'ZRT-MM-10P-B5', cat1: '护肤', cat2: '面部护肤', cat3: '面膜',
          price: 128.00, stock: 360, merchant: '阅己美妆旗舰店', merchantLetter: '阅',
          cover: IMG('hyaluronic acid hydrating sheet mask box packaging 10 pieces korean skincare product photo'),
          fav: 7845, review: 2341, order: 6540, gmv: 794880.00, status: '已下架', auditStatus: '待审核'
        }
      ]
    }
  },
  computed: {
    checkedCount() {
      return this.productList.filter(p => p._checked).length
    },
    isAllChecked() {
      return this.productList.length > 0 && this.productList.every(p => p._checked)
    }
  },
  methods: {
    getProductCover,
    productAuditKey(p) {
      if (!p) return 'pending'
      if (p.auditKey) return p.auditKey
      const s = p.auditStatus || '待审核'
      if (s === '审核通过') return 'pass'
      if (s === '审核未通过') return 'fail'
      if (s === '已驳回') return 'reject'
      return 'pending'
    },
    goBack() {
      uni.navigateBack({ delta: 1, fail: () => { uni.reLaunch({ url: '/admin/index' }) } })
    },
    resetFilter() {
      this.filterForm = { cat1:'', cat2:'', cat3:'', brand:'', merchant:'', status:'', audit:'' }
    },
    fmtPrice(v) {
      const num = Math.round(Number(v || 0) * 100) / 100
      return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    fmtInt(v) {
      return Number(v || 0).toLocaleString('zh-CN')
    },
    toggleCheckAll(e) {
      const checked = e.detail.value && e.detail.value.length > 0
      this.productList.forEach(p => { this.$set(p, '_checked', checked) })
    },
    toggleRowCheck(idx) {
      const cur = !!this.productList[idx]._checked
      this.$set(this.productList[idx], '_checked', !cur)
    }
  }
}
</script>

<style lang="scss">
@import '../../uni.scss';

.sub-page { min-height: 100vh; background: $purple-surface; display: flex; flex-direction: column; }

.header-bar {
  height: 88rpx; min-height: 88rpx;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  display: flex; align-items: center; justify-content: space-between; padding: 0 28rpx;
  box-shadow: 0 4rpx 16rpx rgba($primary-color, 0.25);
  flex-shrink: 0;
}
.back-btn { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; }
.back-arrow { font-size: 56rpx; font-weight: 300; color: #fff; line-height: 1; }
.header-title { font-size: 32rpx; font-weight: 700; color: #fff; letter-spacing: 1rpx; }

.page-body { flex: 1; padding: 40rpx; height: 0; }

/* ===== 商品管理模块专用样式 ===== */
.product-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* 筛选区域 */
.filter-bar {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx 32rpx 8rpx;
  box-shadow: 0 4rpx 20rpx rgba($primary-color, 0.06);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24rpx 28rpx;
  margin-bottom: 20rpx;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex-shrink: 0;
}

.filter-label {
  font-size: 24rpx;
  color: #666;
  white-space: nowrap;
  min-width: 110rpx;
}

.filter-input {
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 20rpx;
  border: 0;
  border-radius: 12rpx;
  background: $purple-surface;
  font-size: 24rpx;
  color: #333;
  width: 320rpx;
}

.filter-input-picker {
  display: flex;
  align-items: center;
}

.filter-input-picker .placeholder {
  color: #999;
}

.filter-actions {
  display: flex;
  gap: 16rpx;
  margin-left: auto;
  padding-bottom: 12rpx;
}

.btn {
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 28rpx;
  border-radius: 12rpx;
  border: 0;
  font-size: 24rpx;
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  background: #fff;
  color: #555;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 6rpx 16rpx rgba($primary-color, 0.28);
  font-weight: 500;
}

.btn-default {
  background: #fff;
  color: #555;
  border-color: #E0DAEE;
}

.btn-danger {
  background: #fff;
  color: #FF5B6B;
  border-color: #FFD4D9;
}

.btn-success {
  background: #fff;
  color: #27C28B;
  border-color: #C7F0DD;
}

.btn-warning {
  background: #fff;
  color: #F39C12;
  border-color: #FCE3BA;
}

.btn-info {
  background: #fff;
  color: #3B82F6;
  border-color: #C7DBFB;
}

/* 操作栏 */
.action-bar {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba($primary-color, 0.06);
}

.action-left, .action-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.batch-count {
  font-size: 24rpx;
  color: #888;
  margin-right: 8rpx;
}

.batch-count .batch-num {
  color: $primary-color;
  font-weight: 600;
}

/* 列表区域 */
.list-wrap {
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba($primary-color, 0.06);
  overflow: hidden;
  flex: 1;
}

.list-scroll {
  width: 100%;
  white-space: nowrap;
}

.list-table {
  display: inline-block;
  min-width: 4800rpx;
  font-size: 24rpx;
  vertical-align: top;
}

.list-tr {
  display: flex;
  width: 100%;
  align-items: stretch;
}

.list-th {
  background: #FAF8FF;
  position: sticky;
  top: 0;
  z-index: 2;
}

.list-th .list-td {
  color: #555;
  font-weight: 600;
}

.list-td {
  padding: 22rpx 24rpx;
  color: #333;
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
}

.list-tbody .list-td {
}

.list-tbody:last-child .list-td {
}

.col-check { width: 88rpx; justify-content: center; }
.col-op    { width: 440rpx; min-width: 440rpx; }
.col-cover { width: 128rpx; }
.col-id    { width: 180rpx; }
.col-name  { width: 420rpx; min-width: 420rpx; white-space: normal !important; line-height: 1.4; }
.col-brand { width: 160rpx; }
.col-sku   { width: 260rpx; }
.col-cat1, .col-cat2, .col-cat3 { width: 180rpx; }
.col-price { width: 200rpx; justify-content: flex-end; }
.col-stock { width: 160rpx; justify-content: flex-end; }
.col-merchant { width: 260rpx; }
.col-audit { width: 180rpx; }
.col-shelf { width: 160rpx; }
.col-fav, .col-review, .col-order { width: 170rpx; justify-content: flex-end; }
.col-gmv   { width: 220rpx; justify-content: flex-end; }

.status-tag {
  display: inline-block;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 500;
  white-space: nowrap;
}
.status-tag.audit-pass    { background:#D1FAE5; color:#065F46; }
.status-tag.audit-pending { background:#FEF3C7; color:#92400E; }
.status-tag.audit-fail    { background:#FEE2E2; color:#991B1B; }
.status-tag.audit-reject  { background:#FECACA; color:#7F1D1D; }
.status-tag.shelf-on  { background:#D1FAE5; color:#065F46; }
.status-tag.shelf-off { background:#F3F4F6; color:#4B5563; }

.btn-shelve-up-active {
  background: #16A34A !important;
  color: #fff !important;
  border-color: #16A34A !important;
}
.btn-shelve-down-active {
  background: #D97706 !important;
  color: #fff !important;
  border-color: #D97706 !important;
}
.btn-shelve-muted {
  background: #F3F4F6 !important;
  color: #9CA3AF !important;
  border-color: #E5E7EB !important;
}

.cover-thumb {
  width: 88rpx;
  height: 88rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08);
  overflow: hidden;
  background: #F7F5FC;
  flex-shrink: 0;
}
.cover-thumb image { width: 100%; height: 100%; display: block; border-radius: 16rpx; }

.product-name {
  font-weight: 500;
  color: #222;
  line-height: 1.4;
  white-space: normal;
  word-break: break-all;
}

.product-sku {
  font-family: Consolas, Menlo, monospace;
  font-size: 22rpx;
  color: #888;
}

.product-id {
  font-family: Consolas, Menlo, monospace;
  font-size: 22rpx;
  color: #666;
}

.cat-tag {
  display: inline-block;
  padding: 6rpx 16rpx;
  background: #F0ECFA;
  color: #6D5BD0;
  border-radius: 20rpx;
  font-size: 22rpx;
  white-space: nowrap;
  max-width: 160rpx;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price-num {
  color: #FF5B6B;
  font-weight: 700;
  font-size: 26rpx;
}

.price-num::before { content: '¥'; font-size: 22rpx; font-weight: 500; margin-right: 2rpx; }

.stock-num.low { color: #FF5B6B; font-weight: 600; }
.stock-out { color: #FF5B6B; font-weight: 600; font-size: 24rpx; }

.gmv-num {
  color: #27C28B;
  font-weight: 700;
}
.gmv-num::before { content: '¥'; font-size: 22rpx; font-weight: 500; margin-right: 2rpx; }

.stat-num { font-variant-numeric: tabular-nums; }

.merchant-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.merchant-avatar {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: 700;
  flex-shrink: 0;
}

.merchant-name {
  font-size: 24rpx;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180rpx;
}

.row-ops {
  display: flex;
  gap: 8rpx;
  flex-wrap: nowrap;
}

.btn-mini {
  height: 48rpx;
  line-height: 48rpx;
  padding: 0 14rpx;
  font-size: 22rpx;
  border-radius: 8rpx;
}

.btn-mini .op-icon { font-size: 22rpx; margin-right: 2rpx; }

/* 分页 */
.pagination {
  background: #fff;
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.total-text { font-size: 24rpx; color: #888; }
.total-text .b { color: $primary-color; font-weight: 600; }

.pager-wrap { display:flex; align-items:center; gap:24rpx; }

.pager { display: flex; gap: 10rpx; align-items: center; }

.page-btn {
  min-width: 60rpx;
  height: 60rpx;
  line-height: 60rpx;
  padding: 0 16rpx;
  border-radius: 12rpx;
  border: 0;
  background: $purple-surface;
  font-size: 22rpx;
  color: #555;
  text-align: center;
}

.page-btn.active {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  color: #fff;
  border-color: transparent;
  font-weight: 600;
}

.page-btn.disabled {
  opacity: 0.5;
}

.page-size-select {
  height: 60rpx;
  line-height: 60rpx;
  padding: 0 16rpx;
  border-radius: 12rpx;
  border: 0;
  background: $purple-surface;
  font-size: 22rpx;
  color: #555;
}
</style>
