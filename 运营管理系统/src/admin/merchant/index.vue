<template>
  <view class="sub-page">
    <view class="header-bar">
      <view class="back-btn" @click="goBack"><text class="back-arrow">‹</text></view>
      <text class="header-title">商家管理</text>
      <view style="width:56rpx"></view>
    </view>

    <scroll-view scroll-y class="page-body">
      <!-- ============ 商家管理完整内容 ============ -->
      <view class="merchant-container">
        <!-- 筛选项 -->
        <view class="filter-bar">
          <view class="filter-row">
            <view class="filter-item">
              <text class="filter-label">关键词</text>
              <input class="filter-input" type="text" placeholder="商家名称/ID/联系人" />
            </view>
            <view class="filter-item">
              <text class="filter-label">商家类型</text>
              <picker :range="mFilterType" @change="e=>mFilterForm.type=mFilterType[e.detail.value]">
                <view class="filter-input filter-input-picker">
                  <text :class="{placeholder: !mFilterForm.type}">{{ mFilterForm.type || '全部' }}</text>
                </view>
              </picker>
            </view>
            <view class="filter-item">
              <text class="filter-label">审核状态</text>
              <picker :range="mFilterAudit" @change="e=>mFilterForm.audit=mFilterAudit[e.detail.value]">
                <view class="filter-input filter-input-picker">
                  <text :class="{placeholder: !mFilterForm.audit}">{{ mFilterForm.audit || '全部' }}</text>
                </view>
              </picker>
            </view>
            <view class="filter-item">
              <text class="filter-label">营业状态</text>
              <picker :range="mFilterOpen" @change="e=>mFilterForm.open=mFilterOpen[e.detail.value]">
                <view class="filter-input filter-input-picker">
                  <text :class="{placeholder: !mFilterForm.open}">{{ mFilterForm.open || '全部' }}</text>
                </view>
              </picker>
            </view>
            <view class="filter-item">
              <text class="filter-label">经营类目</text>
              <picker :range="mFilterCategory" @change="e=>mFilterForm.category=mFilterCategory[e.detail.value]">
                <view class="filter-input filter-input-picker">
                  <text :class="{placeholder: !mFilterForm.category}">{{ mFilterForm.category || '全部' }}</text>
                </view>
              </picker>
            </view>
            <view class="filter-item">
              <text class="filter-label">入驻时间</text>
              <picker :range="mFilterJoin" @change="e=>mFilterForm.join=mFilterJoin[e.detail.value]">
                <view class="filter-input filter-input-picker">
                  <text :class="{placeholder: !mFilterForm.join}">{{ mFilterForm.join || '全部' }}</text>
                </view>
              </picker>
            </view>
            <view class="filter-item">
              <text class="filter-label">所在地区</text>
              <picker :range="mFilterRegion" @change="e=>mFilterForm.region=mFilterRegion[e.detail.value]">
                <view class="filter-input filter-input-picker">
                  <text :class="{placeholder: !mFilterForm.region}">{{ mFilterForm.region || '全部' }}</text>
                </view>
              </picker>
            </view>
            <view class="filter-actions">
              <view class="btn btn-primary"><text>🔍 查询</text></view>
              <view class="btn btn-default" @click="merchantResetFilter"><text>↺ 重置</text></view>
            </view>
          </view>
        </view>

        <!-- 操作项 -->
        <view class="action-bar">
          <view class="action-left">
            <view class="btn btn-primary"><text>➕ 新增商家</text></view>
            <view class="btn btn-info"><text>✏ 编辑</text></view>
            <view class="btn btn-danger"><text>🗑 删除</text></view>
            <view class="btn btn-success"><text>✅ 审核通过</text></view>
            <view class="btn btn-warning"><text>❄ 冻结</text></view>
            <view class="btn btn-default"><text>🔓 解冻</text></view>
          </view>
          <view class="action-right">
            <text class="batch-count">已选 <text class="batch-num">{{ merchantCheckedCount }}</text> 项</text>
            <view class="btn btn-default"><text>📤 导出</text></view>
            <view class="btn btn-default"><text>📥 导入</text></view>
          </view>
        </view>

        <!-- 列表项 -->
        <view class="list-wrap">
          <scroll-view scroll-x class="list-scroll">
            <view class="list-table merchant-table">
              <!-- 表头 -->
              <view class="list-tr list-th">
                <view class="list-td col-check">
                  <checkbox :checked="merchantIsAllChecked" @change="merchantToggleCheckAll" color="#8B7CF6" style="transform:scale(0.85);" />
                </view>
                <view class="list-td col-m-op">操作</view>
                <view class="list-td col-m-logo">店铺logo</view>
                <view class="list-td col-m-id">商家ID</view>
                <view class="list-td col-m-name">商家名称</view>
                <view class="list-td col-m-type">商家类型</view>
                <view class="list-td col-m-legal">法人代表</view>
                <view class="list-td col-m-contact">联系人</view>
                <view class="list-td col-m-phone">联系电话</view>
                <view class="list-td col-m-cat">经营类目</view>
                <view class="list-td col-m-region">所在地区</view>
                <view class="list-td col-m-address">详细地址</view>
                <view class="list-td col-m-join">入驻时间</view>
                <view class="list-td col-m-audit">审核状态</view>
                <view class="list-td col-m-open">营业状态</view>
                <view class="list-td col-m-prod">商品数</view>
                <view class="list-td col-m-order">订单数</view>
                <view class="list-td col-m-gmv">交易额</view>
                <view class="list-td col-m-score">评分</view>
              </view>
              <!-- 数据行 -->
              <view class="list-tr list-tbody" v-for="(m, idx) in merchantList" :key="m.id">
                <view class="list-td col-check">
                  <checkbox :checked="!!m._checked" @change="merchantToggleRowCheck(idx)" color="#8B7CF6" style="transform:scale(0.85);" />
                </view>
                <view class="list-td col-m-op">
                  <view class="row-ops">
                    <view class="btn btn-mini btn-info"><text class="op-icon">✏</text><text>编辑</text></view>
                    <view class="btn btn-mini btn-danger"><text class="op-icon">🗑</text><text>删除</text></view>
                    <view class="btn btn-mini btn-success"><text class="op-icon">✅</text><text>审核</text></view>
                    <view class="btn btn-mini btn-warning"><text class="op-icon">❄</text><text>冻结</text></view>
                    <view class="btn btn-mini btn-default"><text class="op-icon">👁</text><text>详情</text></view>
                  </view>
                </view>
                <view class="list-td col-m-logo">
                  <view class="cover-thumb"><image :src="m.logo" mode="aspectFill"></image></view>
                </view>
                <view class="list-td col-m-id"><text class="product-id">{{ m.id }}</text></view>
                <view class="list-td col-m-name"><text class="product-name">{{ m.name }}</text></view>
                <view class="list-td col-m-type"><text class="cat-tag" :class="'type-'+m.typeKey">{{ m.type }}</text></view>
                <view class="list-td col-m-legal"><text>{{ m.legal }}</text></view>
                <view class="list-td col-m-contact"><text>{{ m.contact }}</text></view>
                <view class="list-td col-m-phone"><text class="product-sku">{{ m.phone }}</text></view>
                <view class="list-td col-m-cat"><text class="cat-tag">{{ m.category }}</text></view>
                <view class="list-td col-m-region"><text>{{ m.region }}</text></view>
                <view class="list-td col-m-address"><text class="product-name" style="font-weight:normal;">{{ m.address }}</text></view>
                <view class="list-td col-m-join"><text class="product-sku">{{ m.joinTime }}</text></view>
                <view class="list-td col-m-audit"><text class="status-tag" :class="'audit-'+m.auditKey">{{ m.auditStatus }}</text></view>
                <view class="list-td col-m-open"><text class="status-tag" :class="'open-'+m.openKey">{{ m.openStatus }}</text></view>
                <view class="list-td col-m-prod"><text class="stat-num">{{ fmtInt(m.productCount) }}</text></view>
                <view class="list-td col-m-order"><text class="stat-num">{{ fmtInt(m.orderCount) }}</text></view>
                <view class="list-td col-m-gmv"><text class="gmv-num">{{ fmtPrice(m.gmv) }}</text></view>
                <view class="list-td col-m-score"><text class="score-num">{{ m.score.toFixed(1) }}</text></view>
              </view>
            </view>
          </scroll-view>

          <!-- 分页 -->
          <view class="pagination">
            <text class="total-text">共 <text class="b">{{ merchantList.length }}</text> 条记录，当前第 <text class="b">1</text> / <text class="b">1</text> 页</text>
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
export default {
  data() {
    const IMG = (p) => 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' + encodeURIComponent(p) + '&image_size=square'
    return {
      // ===== 商家：筛选项选项 =====
      mFilterType: ['全部','旗舰店','专营店','专卖店','普通店铺','个人店'],
      mFilterAudit: ['全部','待审核','审核通过','审核未通过','已驳回'],
      mFilterOpen: ['全部','营业中','已冻结','已关闭','休息中'],
      mFilterCategory: ['全部','护肤美妆','彩妆香水','个护清洁','家居生活','母婴用品','食品保健','综合百货'],
      mFilterJoin: ['全部','近7天','近30天','近3个月','近半年','1年以上'],
      mFilterRegion: ['全部','上海','北京','广州','深圳','杭州','成都','苏州','南京'],
      mFilterForm: { type:'', audit:'', open:'', category:'', join:'', region:'' },
      pageSizeList: ['10 条/页','20 条/页','50 条/页'],
      pageSize: '10 条/页',
      // ===== 商家：mock数据（10条，覆盖各种类型/状态/地区） =====
      merchantList: [
        {
          id: 'SJ20240101', name: '阅己美妆旗舰店', type: '旗舰店', typeKey: 'flagship',
          legal: '张明', contact: '张经理', phone: '138****8888',
          category: '护肤美妆', region: '上海', address: '上海市徐汇区漕河泾开发区88号创新大厦A座1201',
          joinTime: '2024-01-15', auditStatus: '审核通过', auditKey: 'pass',
          openStatus: '营业中', openKey: 'open',
          logo: IMG('flagship cosmetics store facade modern minimalist purple signboard e-commerce shop logo square'),
          productCount: 1286, orderCount: 98420, gmv: 68523680.00, score: 4.92
        },
        {
          id: 'SJ20240102', name: '优品美妆专营店', type: '专营店', typeKey: 'franchise',
          legal: '李思远', contact: '李主管', phone: '139****6666',
          category: '护肤美妆', region: '杭州', address: '浙江省杭州市西湖区文三路398号东方通信大厦18楼',
          joinTime: '2024-02-08', auditStatus: '审核通过', auditKey: 'pass',
          openStatus: '营业中', openKey: 'open',
          logo: IMG('beauty specialty storefront gold and warm elegant shop logo e-commerce square icon'),
          productCount: 856, orderCount: 62380, gmv: 38264520.00, score: 4.78
        },
        {
          id: 'SJ20240103', name: '花语甄选店', type: '专卖店', typeKey: 'exclusive',
          legal: '王花花', contact: '王店长', phone: '135****2222',
          category: '彩妆香水', region: '广州', address: '广州市天河区珠江新城花城大道85号高德置地秋广场1505',
          joinTime: '2024-03-12', auditStatus: '待审核', auditKey: 'pending',
          openStatus: '休息中', openKey: 'rest',
          logo: IMG('cherry blossom perfume exclusive boutique pink floral aesthetic shop logo square'),
          productCount: 328, orderCount: 12560, gmv: 6235800.00, score: 4.65
        },
        {
          id: 'SJ20240104', name: '海蓝精选', type: '普通店铺', typeKey: 'normal',
          legal: '陈海蓝', contact: '陈女士', phone: '137****5555',
          category: '个护清洁', region: '深圳', address: '深圳市南山区科技园南区深南大道9966号威盛科技大厦20楼',
          joinTime: '2024-04-01', auditStatus: '审核通过', auditKey: 'pass',
          openStatus: '已冻结', openKey: 'frozen',
          logo: IMG('ocean wave personal care store teal blue minimalist boutique logo square icon'),
          productCount: 412, orderCount: 8920, gmv: 4521680.00, score: 4.32
        },
        {
          id: 'SJ20240105', name: '丽人全球购', type: '个人店', typeKey: 'personal',
          legal: '刘丽丽', contact: '刘小姐', phone: '136****1111',
          category: '综合百货', region: '北京', address: '北京市朝阳区建国路88号SOHO现代城A座2808',
          joinTime: '2024-04-25', auditStatus: '审核未通过', auditKey: 'fail',
          openStatus: '已关闭', openKey: 'closed',
          logo: IMG('global shopping world map boutique green globe personal shop logo square'),
          productCount: 156, orderCount: 3280, gmv: 985620.00, score: 3.85
        },
        {
          id: 'SJ20240106', name: '兰蔻官方授权店', type: '专卖店', typeKey: 'exclusive',
          legal: '赵雅芝', contact: '赵经理', phone: '186****7777',
          category: '护肤美妆', region: '成都', address: '四川省成都市锦江区春熙路西段158号银石广场17楼',
          joinTime: '2024-05-18', auditStatus: '审核通过', auditKey: 'pass',
          openStatus: '营业中', openKey: 'open',
          logo: IMG('lancome rose luxury cosmetics authorized official store logo red elegant square'),
          productCount: 218, orderCount: 18640, gmv: 18562400.00, score: 4.88
        },
        {
          id: 'SJ20240107', name: '完美日记品牌店', type: '旗舰店', typeKey: 'flagship',
          legal: '黄景瑜', contact: '黄总监', phone: '188****9999',
          category: '彩妆香水', region: '苏州', address: '江苏省苏州市工业园区星海街188号恒宇广场3期22层',
          joinTime: '2024-06-02', auditStatus: '已驳回', auditKey: 'reject',
          openStatus: '已关闭', openKey: 'closed',
          logo: IMG('diamond crystal luxury flagship makeup brand store logo blue gemstone square'),
          productCount: 456, orderCount: 24860, gmv: 8925680.00, score: 4.71
        },
        {
          id: 'SJ20240108', name: '自然堂生活美学馆', type: '专营店', typeKey: 'franchise',
          legal: '孙自然', contact: '孙店长', phone: '189****3333',
          category: '家居生活', region: '南京', address: '南京市建邺区河西大街89号金鹰世界A座21楼2103',
          joinTime: '2024-06-20', auditStatus: '审核通过', auditKey: 'pass',
          openStatus: '营业中', openKey: 'open',
          logo: IMG('green leaf natural lifestyle botanical wellness shop logo minimalist aesthetics square'),
          productCount: 286, orderCount: 9520, gmv: 3652800.00, score: 4.62
        },
        {
          id: 'SJ20240109', name: 'SK-II奢享汇', type: '旗舰店', typeKey: 'flagship',
          legal: '周诗诗', contact: '周经理', phone: '159****0008',
          category: '护肤美妆', region: '上海', address: '上海市静安区南京西路1788号越洋广场36楼',
          joinTime: '2024-07-05', auditStatus: '待审核', auditKey: 'pending',
          openStatus: '营业中', openKey: 'open',
          logo: IMG('water drop sk2 luxury skincare vip flagship store logo purple elegant crystal square'),
          productCount: 98, orderCount: 5280, gmv: 9856420.00, score: 4.95
        },
        {
          id: 'SJ20240110', name: '花西子国风旗舰店', type: '旗舰店', typeKey: 'flagship',
          legal: '吴西子', contact: '吴CEO', phone: '158****6688',
          category: '彩妆香水', region: '杭州', address: '杭州市余杭区文一西路969号阿里巴巴西溪园区B区8号楼',
          joinTime: '2024-07-18', auditStatus: '审核通过', auditKey: 'pass',
          openStatus: '营业中', openKey: 'open',
          logo: IMG('chinese wind chime oriental hanfu style cosmetics flagship logo gold elegant square'),
          productCount: 368, orderCount: 42380, gmv: 28654200.00, score: 4.86
        }
      ]
    }
  },
  computed: {
    merchantCheckedCount() {
      return this.merchantList.filter(m => m._checked).length
    },
    merchantIsAllChecked() {
      return this.merchantList.length > 0 && this.merchantList.every(m => m._checked)
    }
  },
  methods: {
    goBack() {
      uni.navigateBack({ delta: 1, fail: () => { uni.reLaunch({ url: '/admin/index' }) } })
    },
    fmtPrice(v) {
      const num = Math.round(v * 100) / 100
      return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    fmtInt(v) {
      return Number(v).toLocaleString('zh-CN')
    },
    merchantResetFilter() {
      this.mFilterForm = { type:'', audit:'', open:'', category:'', join:'', region:'' }
    },
    merchantToggleCheckAll(e) {
      const checked = e.detail.value && e.detail.value.length > 0
      this.merchantList.forEach(m => { this.$set(m, '_checked', checked) })
    },
    merchantToggleRowCheck(idx) {
      const cur = !!this.merchantList[idx]._checked
      this.$set(this.merchantList[idx], '_checked', !cur)
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

.merchant-container {
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
  min-width: 8600rpx;
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

/* 商家表格列宽 */
.col-check { width: 88rpx; justify-content: center; }
.col-m-op      { width: 460rpx; min-width: 460rpx; }
.col-m-logo    { width: 128rpx; }
.col-m-id      { width: 200rpx; }
.col-m-name    { width: 360rpx; min-width: 360rpx; white-space: normal !important; line-height: 1.4; }
.col-m-type    { width: 160rpx; }
.col-m-legal   { width: 160rpx; }
.col-m-contact { width: 160rpx; }
.col-m-phone   { width: 240rpx; }
.col-m-cat     { width: 200rpx; }
.col-m-region  { width: 140rpx; }
.col-m-address { width: 600rpx; min-width: 600rpx; white-space: normal !important; line-height: 1.4; }
.col-m-join    { width: 220rpx; }
.col-m-audit   { width: 180rpx; }
.col-m-open    { width: 180rpx; }
.col-m-prod    { width: 150rpx; justify-content: flex-end; }
.col-m-order   { width: 150rpx; justify-content: flex-end; }
.col-m-gmv     { width: 220rpx; justify-content: flex-end; }
.col-m-score   { width: 140rpx; justify-content: flex-end; }

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

.cat-tag.type-flagship  { background:#FEF3C7; color:#92400E; }
.cat-tag.type-franchise { background:#DBEAFE; color:#1E40AF; }
.cat-tag.type-exclusive { background:#FCE7F3; color:#9D174D; }
.cat-tag.type-normal    { background:#E0E7FF; color:#3730A3; }
.cat-tag.type-personal  { background:#D1FAE5; color:#065F46; }

.gmv-num {
  color: #27C28B;
  font-weight: 700;
}
.gmv-num::before { content: '¥'; font-size: 22rpx; font-weight: 500; margin-right: 2rpx; }

.stat-num { font-variant-numeric: tabular-nums; }

.score-num {
  color: #F59E0B;
  font-weight: 700;
  font-size: 26rpx;
}

/* 状态标签（审核/营业） */
.status-tag {
  display: inline-block;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 500;
  white-space: nowrap;
}
.status-tag.audit-pass    { background:#D1FAE5; color:#065F46; }
.status-tag.audit-pending { background:#FEF3C7; color:#92400E; }
.status-tag.audit-fail    { background:#FEE2E2; color:#991B1B; }
.status-tag.audit-reject  { background:#FECACA; color:#7F1D1D; }

.status-tag.open-open    { background:#D1FAE5; color:#065F46; }
.status-tag.open-rest    { background:#FEF3C7; color:#92400E; }
.status-tag.open-frozen  { background:#E0E7FF; color:#3730A3; }
.status-tag.open-closed  { background:#F3F4F6; color:#4B5563; }

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
