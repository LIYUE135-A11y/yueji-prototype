<template>
  <view class="sub-page">
    <view class="header-bar">
      <view class="back-btn" @click="goBack"><text class="back-arrow">‹</text></view>
      <text class="header-title">订单管理</text>
      <view style="width:56rpx"></view>
    </view>

    <scroll-view scroll-y class="page-body">
      <view class="order-container">
        <!-- 筛选：对齐参考图 -->
        <view class="filter-bar">
          <view class="filter-row">
            <view class="filter-item">
              <text class="filter-label">订单组</text>
              <picker :range="filterOrderGroup" @change="(e)=>orderFilterForm.groupIdx=e.detail.value">
                <view class="filter-input filter-input-picker"><text>{{ filterOrderGroup[orderFilterForm.groupIdx] }}</text></view>
              </picker>
            </view>
            <view class="filter-item">
              <text class="filter-label">商品名称</text>
              <picker :range="filterProdNames" @change="(e)=>orderFilterForm.prodIdx=e.detail.value">
                <view class="filter-input filter-input-picker"><text>{{ filterProdNames[orderFilterForm.prodIdx] }}</text></view>
              </picker>
            </view>
            <view class="filter-item">
              <text class="filter-label">参数</text>
              <view class="order-filter-range">
                <input class="filter-input range-input" type="digit" v-model="orderFilterForm.paramMin" placeholder="最小" />
                <text class="range-sep">—</text>
                <input class="filter-input range-input" type="digit" v-model="orderFilterForm.paramMax" placeholder="最大" />
              </view>
            </view>
            <view class="filter-item">
              <text class="filter-label">活动类型</text>
              <picker :range="filterActivity" @change="(e)=>orderFilterForm.actIdx=e.detail.value">
                <view class="filter-input filter-input-picker"><text>{{ filterActivity[orderFilterForm.actIdx] }}</text></view>
              </picker>
            </view>
            <view class="filter-item">
              <text class="filter-label">实付金额</text>
              <view class="order-filter-range">
                <input class="filter-input range-input" type="digit" v-model="orderFilterForm.payMin" placeholder="最小" />
                <text class="range-sep">—</text>
                <input class="filter-input range-input" type="digit" v-model="orderFilterForm.payMax" placeholder="最大" />
              </view>
            </view>
            <view class="filter-item">
              <text class="filter-label">商户名称</text>
              <picker :range="filterMerchant" @change="(e)=>orderFilterForm.merchantIdx=e.detail.value">
                <view class="filter-input filter-input-picker"><text>{{ filterMerchant[orderFilterForm.merchantIdx] }}</text></view>
              </picker>
            </view>
            <view class="filter-item">
              <text class="filter-label">门店</text>
              <picker :range="filterStore" @change="(e)=>orderFilterForm.storeIdx=e.detail.value">
                <view class="filter-input filter-input-picker"><text>{{ filterStore[orderFilterForm.storeIdx] }}</text></view>
              </picker>
            </view>
            <view class="filter-item">
              <text class="filter-label">订单状态</text>
              <picker :range="filterOrderStatus" :range-key="'label'" @change="(e)=>orderFilterForm.statusIdx=e.detail.value">
                <view class="filter-input filter-input-picker"><text>{{ filterOrderStatus[orderFilterForm.statusIdx].label }}</text></view>
              </picker>
            </view>
            <view class="filter-item">
              <text class="filter-label">下单时间</text>
              <picker :range="filterOrderTime" @change="(e)=>orderFilterForm.timeIdx=e.detail.value">
                <view class="filter-input filter-input-picker"><text>{{ filterOrderTime[orderFilterForm.timeIdx] }}</text></view>
              </picker>
            </view>
            <view class="filter-actions">
              <button class="btn btn-primary" @click="applyOrderSearch">查询</button>
              <button class="btn btn-default" @click="orderResetFilter">重置</button>
            </view>
          </view>
        </view>

        <!-- 操作栏 + 分页 -->
        <view class="action-bar">
          <view class="action-left">
            <button class="btn btn-primary" @click="batchOp('view')">查看</button>
            <button class="btn btn-default" @click="batchOp('ship')">发货</button>
            <button class="btn btn-default" @click="batchOp('cancel')">取消订单</button>
            <button class="btn btn-default" @click="batchOp('delete')">删除</button>
            <button class="btn btn-default" @click="batchOp('print')">打印</button>
            <button class="btn btn-default" @click="batchOp('export')">导出</button>
            <text class="batch-count">已选 <text class="batch-num">{{ checkedCount }}</text> 项</text>
          </view>
          <view class="action-right order-action-pager">
            <text class="total-text">共 {{ filteredOrderList.length }} 条，第 {{ currentPage }}/{{ maxPage }} 页</text>
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
            <view class="list-table order-table">
              <view class="list-tr list-th">
                <view class="list-td col-check"><input type="checkbox" :checked="isAllChecked" @change="toggleCheckAll" class="checkbox" /></view>
                <view class="list-td col-o-op">操作</view>
                <view class="list-td col-o-refund">退款</view>
                <view class="list-td col-o-cover">主图</view>
                <view class="list-td col-o-id">订单号</view>
                <view class="list-td col-o-name">商品名称</view>
                <view class="list-td col-o-spec">规格</view>
                <view class="list-td col-o-brand">品牌</view>
                <view class="list-td col-o-cat1">一级分类</view>
                <view class="list-td col-o-cat2">二级分类</view>
                <view class="list-td col-o-cat3">三级分类</view>
                <view class="list-td col-o-unit">单价</view>
                <view class="list-td col-o-qty">数量</view>
                <view class="list-td col-o-total">总价</view>
                <view class="list-td col-o-act">活动类型</view>
                <view class="list-td col-o-discount">优惠价格</view>
                <view class="list-td col-o-payamt">实付金额</view>
                <view class="list-td col-o-user">用户信息</view>
                <view class="list-td col-o-phone">电话</view>
                <view class="list-td col-o-addr">地址</view>
                <view class="list-td col-o-st">订单状态</view>
              </view>

              <view class="list-tr list-tbody" v-for="o in displayOrderList" :key="o.id">
                <view class="list-td col-check"><input type="checkbox" :checked="o._checked" @change="toggleRowCheck(o)" class="checkbox" /></view>
                <view class="list-td col-o-op">
                  <text class="order-op-link" @click="rowOp(o)">{{ rowOpLabel(o) }}</text>
                </view>
                <view class="list-td col-o-refund"><text class="product-sku">{{ o.refund || '—' }}</text></view>
                <view class="list-td col-o-cover">
                  <view class="cover-thumb"><image :src="o.prodCover || getProductCover(o.prodSku)" mode="aspectFill" /></view>
                </view>
                <view class="list-td col-o-id"><text class="product-id">{{ o.id }}</text></view>
                <view class="list-td col-o-name" style="white-space:normal;line-height:1.4;"><text class="product-name">{{ o.prodName }}</text></view>
                <view class="list-td col-o-spec"><text class="product-sku">{{ o.spec || '—' }}</text></view>
                <view class="list-td col-o-brand"><text class="merchant-name">{{ o.brand || '—' }}</text></view>
                <view class="list-td col-o-cat1"><text class="product-sku">{{ o.cat1 || '—' }}</text></view>
                <view class="list-td col-o-cat2"><text class="product-sku">{{ o.cat2 || '—' }}</text></view>
                <view class="list-td col-o-cat3"><text class="product-sku">{{ o.cat3 || '—' }}</text></view>
                <view class="list-td col-o-unit" style="justify-content:flex-end;"><text class="order-price">{{ fmtPrice(o.unitPrice) }}</text></view>
                <view class="list-td col-o-qty" style="justify-content:center;"><text class="stat-num">{{ o.prodQty || 1 }}</text></view>
                <view class="list-td col-o-total" style="justify-content:flex-end;"><text class="order-price">{{ fmtPrice(o.totalPrice) }}</text></view>
                <view class="list-td col-o-act"><text class="product-sku">{{ o.activityType || '无' }}</text></view>
                <view class="list-td col-o-discount" style="justify-content:flex-end;"><text class="order-price">{{ fmtPrice(o.discountPrice || 0) }}</text></view>
                <view class="list-td col-o-payamt" style="justify-content:flex-end;"><text class="order-price">{{ fmtPrice(o.payAmount) }}</text></view>
                <view class="list-td col-o-user">
                  <view class="merchant-info">
                    <view class="merchant-avatar"><image :src="getUserAvatar(o.userId)" mode="aspectFill" /></view>
                    <view>
                      <view class="product-name" style="font-size:24rpx;">{{ o.userName }}</view>
                      <view class="product-sku">{{ o.userId }}</view>
                    </view>
                  </view>
                </view>
                <view class="list-td col-o-phone"><text class="product-sku">{{ o.receiverPhone }}</text></view>
                <view class="list-td col-o-addr" style="white-space:normal;line-height:1.4;"><text>{{ o.address }}</text></view>
                <view class="list-td col-o-st"><text class="status-tag" :class="'order-'+o.statusKey">{{ o.status }}</text></view>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </scroll-view>

    <!-- 订单详情弹窗 -->
    <view v-if="detailVisible" class="pm-mask" @click="closeDetail">
      <view class="pm-dialog" @click.stop>
        <view class="pm-header">
          <text class="pm-title">订单详情</text>
          <view class="pm-close" @click="closeDetail"><text>×</text></view>
        </view>
        <scroll-view scroll-y class="pm-body">
          <view v-if="detailOrder" class="od-body">
            <view class="od-section">
              <text class="od-section-title">基本信息</text>
              <view class="od-grid">
                <view class="od-pair" v-for="it in basicInfoItems" :key="it.label" :class="{ 'od-pair--wide': it.wide }">
                  <text class="od-th">{{ it.label }}</text>
                  <text class="od-td">{{ it.value }}</text>
                </view>
              </view>
            </view>

            <view class="od-section">
              <text class="od-section-title">发票信息</text>
              <view class="od-table">
                <view class="od-row od-row--head">
                  <text class="od-cell">发票类型</text>
                  <text class="od-cell">发票抬头</text>
                  <text class="od-cell">发票内容</text>
                  <text class="od-cell">收票人信息</text>
                </view>
                <view class="od-row">
                  <text class="od-cell">{{ detailOrder.invoice.type }}</text>
                  <text class="od-cell">{{ detailOrder.invoice.title }}</text>
                  <text class="od-cell">{{ detailOrder.invoice.content }}</text>
                  <text class="od-cell">{{ detailOrder.invoice.receiver }}</text>
                </view>
              </view>
            </view>

            <view class="od-section">
              <text class="od-section-title">买家信息</text>
              <view class="od-table">
                <view class="od-row od-row--head">
                  <text class="od-cell">买家昵称</text>
                  <text class="od-cell">收货人</text>
                  <text class="od-cell">手机号码</text>
                  <text class="od-cell">邮政编码</text>
                  <text class="od-cell od-cell--addr">收货地址</text>
                </view>
                <view class="od-row">
                  <text class="od-cell">{{ detailOrder.userName }}</text>
                  <text class="od-cell">{{ detailOrder.receiverName }}</text>
                  <text class="od-cell">{{ detailOrder.receiverPhone }}</text>
                  <text class="od-cell">{{ detailOrder.zip }}</text>
                  <text class="od-cell od-cell--addr">{{ detailOrder.address }}</text>
                </view>
              </view>
            </view>

            <view class="od-section">
              <text class="od-section-title">商品信息</text>
              <scroll-view scroll-x class="od-product-scroll">
                <view class="od-product-table">
                  <view class="od-row od-row--head">
                    <text class="od-pcell od-pc-img">商品图片</text>
                    <text class="od-pcell od-pc-name">商品名称</text>
                    <text class="od-pcell od-pc-price">价格/货号</text>
                    <text class="od-pcell od-pc-spec">规格</text>
                    <text class="od-pcell od-pc-qty">数量</text>
                    <text class="od-pcell od-pc-act">活动类型</text>
                    <text class="od-pcell od-pc-num">原价</text>
                    <text class="od-pcell od-pc-num">优惠价格</text>
                    <text class="od-pcell od-pc-qty">库存</text>
                    <text class="od-pcell od-pc-num">小计</text>
                  </view>
                  <view class="od-row">
                    <view class="od-pcell od-pc-img"><view class="cover-thumb"><image :src="detailOrder.prodCover" mode="aspectFill" /></view></view>
                    <text class="od-pcell od-pc-name od-left">{{ detailOrder.prodName }}</text>
                    <view class="od-pcell od-pc-price od-price-cell">
                      <text class="od-money">{{ fmtMoney(detailOrder.unitPrice) }}</text>
                      <text class="od-sub">{{ detailOrder.prodSku }}</text>
                    </view>
                    <text class="od-pcell od-pc-spec">{{ detailOrder.spec }}</text>
                    <text class="od-pcell od-pc-qty">{{ detailOrder.prodQty }}</text>
                    <text class="od-pcell od-pc-act">{{ detailOrder.activityType }}</text>
                    <text class="od-pcell od-pc-num">{{ fmtMoney(detailOrder.totalPrice) }}</text>
                    <text class="od-pcell od-pc-num">{{ discountText(detailOrder.discountPrice) }}</text>
                    <text class="od-pcell od-pc-qty">{{ detailOrder.stock }}</text>
                    <text class="od-pcell od-pc-num od-money">{{ fmtMoney(detailOrder.payAmount) }}</text>
                  </view>
                </view>
              </scroll-view>
              <view class="od-total"><text class="od-total-label">合计</text><text class="od-total-num">{{ fmtMoney(detailOrder.payAmount) }}</text></view>
            </view>

            <view class="od-section">
              <text class="od-section-title">费用信息</text>
              <view class="od-grid">
                <view class="od-pair" v-for="it in costItems" :key="it.label" :class="{ 'od-pair--red': it.red }">
                  <text class="od-th">{{ it.label }}</text>
                  <text class="od-td">{{ it.value }}</text>
                </view>
              </view>
            </view>

            <view class="od-section">
              <text class="od-section-title">操作信息</text>
              <scroll-view scroll-x class="od-product-scroll">
                <view class="od-op-table">
                  <view class="od-row od-row--head">
                    <text class="od-ocell od-oc-operator">操作者</text>
                    <text class="od-ocell od-oc-time">操作时间</text>
                    <text class="od-ocell od-oc-status">订单状态</text>
                    <text class="od-ocell od-oc-status">付款状态</text>
                    <text class="od-ocell od-oc-status">发货状态</text>
                    <text class="od-ocell od-oc-remark">备注</text>
                  </view>
                  <view class="od-row" v-for="(log, i) in detailOrder.opLogs" :key="i">
                    <text class="od-ocell od-oc-operator">{{ log.operator }}</text>
                    <text class="od-ocell od-oc-time">{{ log.time }}</text>
                    <text class="od-ocell od-oc-status">{{ log.orderStatus }}</text>
                    <text class="od-ocell od-oc-status">{{ log.payStatus }}</text>
                    <text class="od-ocell od-oc-status">{{ log.shipStatus }}</text>
                    <text class="od-ocell od-oc-remark od-left">{{ log.remark }}</text>
                  </view>
                </view>
              </scroll-view>
            </view>
          </view>
        </scroll-view>
        <view class="pm-footer">
          <button class="btn btn-primary pm-btn" @click="closeDetail">关闭</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import { getUserAvatar } from '../../common/user-avatar.js'
  import { getProductCover } from '../../common/product-image.js'
  import { normFilterVal, paginateList } from '../../common/list-filter.js'

  const IMG = (p) => 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' + encodeURIComponent(p) + '&image_size=square'

  function withinOrderTime(dateStr, range) {
    if (!range || range === '全部' || !dateStr) return true
    const today = new Date(); today.setHours(23, 59, 59, 999)
    const d = new Date(String(dateStr).replace(/-/g, '/'))
    const diffDays = Math.floor((today - d) / 86400000)
    const diffHours = Math.floor((today - d) / 3600000)
    if (range === '近24小时') return diffHours >= 0 && diffHours <= 24
    if (range === '近7天') return diffDays >= 0 && diffDays <= 7
    if (range === '近30天') return diffDays >= 0 && diffDays <= 30
    if (range === '近3个月') return diffDays >= 0 && diffDays <= 90
    if (range === '近半年') return diffDays >= 0 && diffDays <= 180
    if (range === '1年以上') return diffDays >= 365
    return true
  }

  function pad2(n) { return n < 10 ? '0' + n : '' + n }
  function addTime(dateStr, minutes) {
    if (!dateStr) return ''
    const d = new Date(String(dateStr).replace(/-/g, '/'))
    if (isNaN(d.getTime())) return ''
    d.setTime(d.getTime() + minutes * 60000)
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds())
  }
  function zipOf(address) {
    const s = address || ''
    const map = [['上海', '200000'], ['北京', '100000'], ['杭州', '310000'], ['广州', '510000'], ['深圳', '518000'], ['成都', '610000'], ['武汉', '430000'], ['西安', '710000']]
    for (let i = 0; i < map.length; i++) { if (s.indexOf(map[i][0]) >= 0) return map[i][1] }
    return '100000'
  }

  export default {
    data() {
      return {
        pageSizeList: ['10', '20', '50'],
        pageSize: '10',
        currentPage: 1,
        detailVisible: false,
        detailOrder: null,
        filterOrderGroup: ['全部', '普通订单', '拼团订单', '秒杀订单', '会员订单'],
        filterActivity: ['全部', '无', '满减', '秒杀', '新人专享', '会员折扣', '买赠'],
        filterOrderStatus: [
          { label: '全部', val: '' },
          { label: '待付款', val: 'pending' },
          { label: '待发货', val: 'await' },
          { label: '已发货', val: 'shipped' },
          { label: '待收货', val: 'receive' },
          { label: '已完成', val: 'done' },
          { label: '已取消', val: 'cancel' },
          { label: '退款中', val: 'refunding' },
          { label: '已退款', val: 'refunded' }
        ],
        filterOrderTime: ['全部', '近24小时', '近7天', '近30天', '近3个月', '近半年', '1年以上'],
        filterMerchant: ['全部', '阅己美妆旗舰店', '优品美妆专营店', '花语甄选店', '海蓝精选', '兰蔻官方授权店', '自然堂生活美学馆', 'SK-II奢享汇', '欧莱雅集团官方店', '修丽可官方旗舰店', '珂润敏感肌护理店', '雅诗兰黛集团官方店'],
        filterStore: ['全部', '上海旗舰店', '杭州体验店', '广州天河店', '深圳南山店', '成都春熙店', '北京朝阳店', '武汉光谷店', '西安高新店', '线上直发仓'],
        orderFilterForm: { groupIdx: 0, prodIdx: 0, paramMin: '', paramMax: '', actIdx: 0, payMin: '', payMax: '', merchantIdx: 0, storeIdx: 0, statusIdx: 0, timeIdx: 0 },
        appliedFilter: { group: '', prod: '', paramMin: '', paramMax: '', activity: '', payMin: '', payMax: '', merchant: '', store: '', status: '', time: '' },
        orderList: [
          { id: 'DD2026082600001', orderGroup: '普通订单', orderTime: '2026-08-26 09:18:42', userId: 'U20240105', userName: '林予安', merchantName: '阅己美妆旗舰店', store: '上海旗舰店', prodName: 'SK-II 神仙水精华露 230ml 经典款', prodSku: 'SK2-ESS-230-A', brand: 'SK-II', spec: '230ml', cat1: '护肤', cat2: '面部护肤', cat3: '精华水', unitPrice: 1699, prodQty: 1, totalPrice: 1699, activityType: '无', discountPrice: 0, payAmount: 1699, prodCover: IMG('sk2 essence bottle 230ml luxury skincare product photography studio white background clean'), status: '待发货', statusKey: 'await', refund: '—', receiverPhone: '138****6688', address: '上海市浦东新区陆家嘴环路1000号恒生银行大厦18楼1805室', _checked: false },
          { id: 'DD2026082500256', orderGroup: '会员订单', orderTime: '2026-08-25 20:45:31', userId: 'U20240088', userName: '沈清欢', merchantName: '优品美妆专营店', store: '杭州体验店', prodName: '兰蔻小黑瓶精华肌底液 100ml', prodSku: 'LK-XHP-100B', brand: 'Lancôme', spec: '100ml', cat1: '护肤', cat2: '面部护肤', cat3: '精华', unitPrice: 1293, prodQty: 2, totalPrice: 2586, activityType: '会员折扣', discountPrice: 200, payAmount: 2386, prodCover: IMG('lancome advanced genifique serum 50ml black bottle luxury skincare product photo white background'), status: '已完成', statusKey: 'done', refund: '—', receiverPhone: '139****9912', address: '浙江省杭州市西湖区文三路478号华星时代广场C座2103', _checked: false },
          { id: 'DD2026082600012', orderGroup: '普通订单', orderTime: '2026-08-26 10:32:05', userId: 'U20240256', userName: '顾惜月', merchantName: '花语甄选店', store: '广州天河店', prodName: '珂润润浸保湿化妆水 III 150ml', prodSku: 'CRL-HS-150-III', brand: '珂润', spec: '150ml', cat1: '护肤', cat2: '面部护肤', cat3: '爽肤水', unitPrice: 169, prodQty: 2, totalPrice: 338, activityType: '新人专享', discountPrice: 40, payAmount: 298, prodCover: IMG('curel moist lotion iii 150ml bottle japanese sensitive skincare product photo white background'), status: '待付款', statusKey: 'pending', refund: '—', receiverPhone: '135****2258', address: '广州市天河区珠江新城华夏路10号富力中心写字楼15楼', _checked: false },
          { id: 'DD2026082400198', orderGroup: '普通订单', orderTime: '2026-08-24 14:22:18', userId: 'U20240032', userName: '叶知夏', merchantName: '海蓝精选', store: '深圳南山店', prodName: '海蓝之谜浓缩修护精华露 50ml', prodSku: 'HLZM-CS-50-A', brand: '海蓝之谜', spec: '50ml', cat1: '护肤', cat2: '面部护肤', cat3: '精华', unitPrice: 4280, prodQty: 1, totalPrice: 4280, activityType: '无', discountPrice: 0, payAmount: 4280, prodCover: IMG('la mer concentrate repair serum 50ml jar luxury skincare product photo marine blue'), status: '退款中', statusKey: 'refunding', refund: '退款中', receiverPhone: '137****7788', address: '深圳市南山区科技园南区高新南一道飞亚达科技大厦8楼西', _checked: false },
          { id: 'DD2026082300412', orderGroup: '拼团订单', orderTime: '2026-08-23 09:05:49', userId: 'U20240102', userName: '苏念初', merchantName: '兰蔻官方授权店', store: '成都春熙店', prodName: '兰蔻菁纯臻颜精萃乳霜 60ml 滋润版', prodSku: 'LK-JC-60-M', brand: 'Lancôme', spec: '60ml', cat1: '护肤', cat2: '面部护肤', cat3: '面霜', unitPrice: 2180, prodQty: 3, totalPrice: 6540, activityType: '满减', discountPrice: 200, payAmount: 6340, prodCover: IMG('lancome absolution cream jar 60ml gold luxury skincare product photography studio'), status: '已发货', statusKey: 'shipped', refund: '—', receiverPhone: '186****3344', address: '四川省成都市锦江区春熙路东段1号伊藤洋华堂双楠店6楼', _checked: false },
          { id: 'DD2026081900555', orderGroup: '秒杀订单', orderTime: '2026-08-19 15:58:14', userId: 'U20240608', userName: '陆星眠', merchantName: 'SK-II奢享汇', store: '上海旗舰店', prodName: 'SK-II 大红瓶面霜 80g 轻盈版', prodSku: 'SK2-DHP-80G-A', brand: 'SK-II', spec: '80g', cat1: '护肤', cat2: '面部护肤', cat3: '面霜', unitPrice: 1399, prodQty: 2, totalPrice: 2798, activityType: '秒杀', discountPrice: 300, payAmount: 2498, prodCover: IMG('sk2 rna power radical new age cream 80g jar red luxury skincare product photo'), status: '已完成', statusKey: 'done', refund: '—', receiverPhone: '159****0008', address: '上海市静安区南京西路1788号越洋广场36楼SK-II专柜', _checked: false },
          { id: 'DD2026081800031', orderGroup: '会员订单', orderTime: '2026-08-18 08:25:06', userId: 'U20240901', userName: '程予薇', merchantName: '阅己美妆旗舰店', store: '北京朝阳店', prodName: '雅诗兰黛小棕瓶修护精华 75ml', prodSku: 'YSLD-XZP-75-B', brand: '雅诗兰黛', spec: '75ml', cat1: '护肤', cat2: '面部护肤', cat3: '精华', unitPrice: 1490, prodQty: 4, totalPrice: 5960, activityType: '会员折扣', discountPrice: 400, payAmount: 5560, prodCover: IMG('estee lauder advanced night repair serum 75ml brown bottle skincare product photography studio'), status: '已发货', statusKey: 'shipped', refund: '—', receiverPhone: '136****8899', address: '北京市朝阳区建国路81号华贸中心写字楼3座2301', _checked: false },
          { id: 'DD2026081700112', orderGroup: '普通订单', orderTime: '2026-08-17 21:36:48', userId: 'U20240208', userName: '宋软软', merchantName: '欧莱雅集团官方店', store: '线上直发仓', prodName: "L'Oréal Paris 复颜玻尿酸水光充盈乳液 110ml", prodSku: 'LOREAL-FY-110M', brand: "L'Oréal Paris", spec: '110ml', cat1: '护肤', cat2: '面部护肤', cat3: '乳液', unitPrice: 299, prodQty: 2, totalPrice: 598, activityType: '满减', discountPrice: 50, payAmount: 548, prodCover: IMG('loreal paris hyaluronic acid moisturizing emulsion 110ml bottle skincare product photo white'), status: '待发货', statusKey: 'await', refund: '—', receiverPhone: '189****4422', address: '上海市浦东新区张江高科技园区碧波路888号', _checked: false },
          { id: 'DD2026081600078', orderGroup: '普通订单', orderTime: '2026-08-16 10:18:03', userId: 'U20240612', userName: '方知予', merchantName: '修丽可官方旗舰店', store: '武汉光谷店', prodName: '修丽可色修精华 30ml 淡化痘印', prodSku: 'XLK-SX-30ML', brand: '修丽可', spec: '30ml', cat1: '护肤', cat2: '面部护肤', cat3: '精华', unitPrice: 780, prodQty: 1, totalPrice: 780, activityType: '无', discountPrice: 0, payAmount: 780, prodCover: IMG('skinceuticals phyto corrective serum 30ml bottle professional medical skincare product photo white background'), status: '待收货', statusKey: 'receive', refund: '—', receiverPhone: '139****5577', address: '武汉市江汉区解放大道634号新世界国贸大厦2座21楼', _checked: false },
          { id: 'DD2026081500234', orderGroup: '普通订单', orderTime: '2026-08-15 16:42:51', userId: 'U20240076', userName: '唐小鹿', merchantName: '珂润敏感肌护理店', store: '西安高新店', prodName: 'Curel 润浸保湿洁颜泡沫 150ml', prodSku: 'CRL-JM-150ML', brand: '珂润', spec: '150ml', cat1: '护肤', cat2: '面部护肤', cat3: '洁面', unitPrice: 149, prodQty: 3, totalPrice: 447, activityType: '买赠', discountPrice: 0, payAmount: 447, prodCover: IMG('curel moist facial cleansing foam pump 150ml bottle japanese skincare product photo white background'), status: '待付款', statusKey: 'pending', refund: '—', receiverPhone: '157****3344', address: '西安市雁塔区高新路56号西安软件园秦风阁B座5层', _checked: false }
        ]
      }
    },
    computed: {
      filterProdNames() {
        const names = ['全部']
        this.orderList.forEach(o => { if (o.prodName && names.indexOf(o.prodName) < 0) names.push(o.prodName) })
        return names
      },
      pageSizeNum() { return parseInt(this.pageSize, 10) || 10 },
      filteredOrderList() {
        const f = this.appliedFilter
        const paramMin = f.paramMin === '' ? null : parseFloat(f.paramMin)
        const paramMax = f.paramMax === '' ? null : parseFloat(f.paramMax)
        const payMin = f.payMin === '' ? null : parseFloat(f.payMin)
        const payMax = f.payMax === '' ? null : parseFloat(f.payMax)
        return this.orderList.filter(o => {
          if (f.group && o.orderGroup !== f.group) return false
          if (f.prod && o.prodName !== f.prod) return false
          if (f.activity && o.activityType !== f.activity) return false
          if (f.merchant && o.merchantName !== f.merchant) return false
          if (f.store && o.store !== f.store) return false
          if (f.status && o.status !== f.status) return false
          if (!withinOrderTime(o.orderTime, f.time)) return false
          const unit = Number(o.unitPrice) || 0
          if (paramMin != null && !isNaN(paramMin) && unit < paramMin) return false
          if (paramMax != null && !isNaN(paramMax) && unit > paramMax) return false
          const pay = Number(o.payAmount) || 0
          if (payMin != null && !isNaN(payMin) && pay < payMin) return false
          if (payMax != null && !isNaN(payMax) && pay > payMax) return false
          return true
        })
      },
      maxPage() {
        return Math.max(1, Math.ceil(this.filteredOrderList.length / this.pageSizeNum))
      },
      displayOrderList() {
        return paginateList(this.filteredOrderList, this.currentPage, this.pageSizeNum).items
      },
      checkedCount() { return this.orderList.filter(o => o._checked).length },
      isAllChecked() {
        const list = this.displayOrderList
        return list.length > 0 && list.every(o => o._checked)
      },
      basicInfoItems() {
        const d = this.detailOrder
        if (!d) return []
        return [
          { label: '订单编号', value: d.id },
          { label: '创建时间', value: d.orderTime },
          { label: '付款时间', value: d.payTime || '-' },
          { label: '成交时间', value: d.dealTime || '-' },
          { label: '支付方式', value: d.payMethod },
          { label: '订单状态', value: d.status },
          { label: '配送方式', value: d.deliveryMethod },
          { label: '物流单号', value: d.logisticsNo || '-' },
          { label: '自动确认收货时间', value: d.autoConfirm || '-' },
          { label: '订单可得积分', value: d.points },
          { label: '订单备注', value: d.remark, wide: true }
        ]
      },
      costItems() {
        const d = this.detailOrder
        if (!d) return []
        const discount = Number(d.discountPrice) || 0
        const neg = (v) => (v > 0 ? '-' + this.fmtMoney(v) : this.fmtMoney(0))
        return [
          { label: '商品合计', value: this.fmtMoney(d.totalPrice) },
          { label: '运费', value: this.fmtMoney(0) },
          { label: '优惠券', value: this.fmtMoney(0) },
          { label: '优惠折扣', value: neg(discount) },
          { label: '活动类型', value: d.activityType },
          { label: '活动优惠', value: this.fmtMoney(discount) },
          { label: '折扣金额', value: neg(discount) },
          { label: '订单总金额', value: this.fmtMoney(d.payAmount), red: true },
          { label: '应付款金额', value: this.fmtMoney(d.payAmount), red: true }
        ]
      }
    },
    methods: {
      getUserAvatar,
      getProductCover,
      goBack() {
        uni.navigateBack({ delta: 1, fail: () => { uni.reLaunch({ url: '/admin/index' }) } })
      },
      applyOrderSearch() {
        const f = this.orderFilterForm
        this.appliedFilter = {
          group: normFilterVal(this.filterOrderGroup[f.groupIdx]),
          prod: normFilterVal(this.filterProdNames[f.prodIdx]),
          paramMin: f.paramMin || '',
          paramMax: f.paramMax || '',
          activity: normFilterVal(this.filterActivity[f.actIdx]),
          payMin: f.payMin || '',
          payMax: f.payMax || '',
          merchant: normFilterVal(this.filterMerchant[f.merchantIdx]),
          store: normFilterVal(this.filterStore[f.storeIdx]),
          status: normFilterVal(this.filterOrderStatus[f.statusIdx]?.label),
          time: normFilterVal(this.filterOrderTime[f.timeIdx])
        }
        this.currentPage = 1
      },
      orderResetFilter() {
        this.orderFilterForm = { groupIdx: 0, prodIdx: 0, paramMin: '', paramMax: '', actIdx: 0, payMin: '', payMax: '', merchantIdx: 0, storeIdx: 0, statusIdx: 0, timeIdx: 0 }
        this.appliedFilter = { group: '', prod: '', paramMin: '', paramMax: '', activity: '', payMin: '', payMax: '', merchant: '', store: '', status: '', time: '' }
        this.currentPage = 1
      },
      onPageSizeChange(e) {
        this.pageSize = this.pageSizeList[e.detail.value]
        this.currentPage = 1
      },
      prevPage() { if (this.currentPage > 1) this.currentPage-- },
      nextPage() { if (this.currentPage < this.maxPage) this.currentPage++ },
      fmtPrice(v) {
        const num = Math.round(Number(v || 0) * 100) / 100
        return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      },
      fmtMoney(v) {
        return '¥' + this.fmtPrice(v)
      },
      discountText(v) {
        const n = Number(v) || 0
        return n > 0 ? ('-¥' + this.fmtPrice(n)) : '¥0.00'
      },
      buildDetail(o) {
        const shipped = ['shipped', 'receive', 'done', 'refunding', 'refunded'].indexOf(o.statusKey) >= 0
        const paid = o.statusKey !== 'pending'
        const done = o.statusKey === 'done'
        const logisticsNo = shipped ? ('SF' + String(o.id).replace(/\D/g, '').slice(-10)) : ''
        return {
          ...o,
          payTime: paid ? addTime(o.orderTime, 17) : '',
          dealTime: done ? addTime(o.orderTime, 3 * 1440 + 37) : '',
          payMethod: '微信支付',
          deliveryMethod: '快递配送',
          logisticsNo,
          autoConfirm: shipped ? addTime(o.orderTime, 7 * 1440) : '',
          points: Math.floor(Number(o.payAmount) || 0),
          remark: '无',
          receiverName: o.userName,
          zip: zipOf(o.address),
          invoice: { type: '电子普通发票', title: o.userName, content: '商品明细', receiver: o.receiverPhone },
          stock: 100 + (parseInt(String(o.id).replace(/\D/g, '').slice(-4), 10) % 500),
          opLogs: this.buildOpLogs(o)
        }
      },
      buildOpLogs(o) {
        const shipped = ['shipped', 'receive', 'done', 'refunding', 'refunded'].indexOf(o.statusKey) >= 0
        const logisticsNo = 'SF' + String(o.id).replace(/\D/g, '').slice(-10)
        const logs = [{ operator: '系统', time: o.orderTime, orderStatus: '待付款', payStatus: '未付款', shipStatus: '未发货', remark: '订单创建成功' }]
        if (o.statusKey !== 'pending') {
          logs.push({ operator: o.userName, time: addTime(o.orderTime, 17), orderStatus: '待发货', payStatus: '已付款', shipStatus: '未发货', remark: '买家已付款' })
        }
        if (shipped) {
          logs.push({ operator: o.merchantName, time: addTime(o.orderTime, 1440 + 5), orderStatus: '待收货', payStatus: '已付款', shipStatus: '已发货', remark: '物流单号 ' + logisticsNo })
        }
        if (o.statusKey === 'done') {
          logs.push({ operator: o.userName, time: addTime(o.orderTime, 3 * 1440 + 37), orderStatus: '已完成', payStatus: '已付款', shipStatus: '已发货', remark: '买家已确认收货' })
        } else if (o.statusKey === 'cancel') {
          logs.push({ operator: o.userName, time: addTime(o.orderTime, 12), orderStatus: '已取消', payStatus: '未付款', shipStatus: '未发货', remark: '订单已取消' })
        } else if (o.statusKey === 'refunding') {
          logs.push({ operator: o.userName, time: addTime(o.orderTime, 2 * 1440), orderStatus: '退款中', payStatus: '已付款', shipStatus: '已发货', remark: '买家申请退款' })
        }
        return logs
      },
      openDetail(o) {
        this.detailOrder = this.buildDetail(o)
        this.detailVisible = true
      },
      closeDetail() {
        this.detailVisible = false
        this.detailOrder = null
      },
      toggleCheckAll(e) {
        const checked = e.detail.value && e.detail.value.length > 0
        this.displayOrderList.forEach(o => { this.$set(o, '_checked', checked) })
      },
      toggleRowCheck(o) { this.$set(o, '_checked', !o._checked) },
      rowOpLabel(o) {
        if (o.statusKey === 'await' || (o.status || '').indexOf('待发货') >= 0) return '发货'
        return '查看'
      },
      rowOp(o) {
        if (this.rowOpLabel(o) === '发货') {
          this.$set(o, 'status', '已发货')
          this.$set(o, 'statusKey', 'shipped')
          uni.showToast({ title: '已发货', icon: 'success' })
        } else {
          this.openDetail(o)
        }
      },
      batchOp(action) {
        const list = this.orderList.filter(o => o._checked)
        if (!list.length && action !== 'export') {
          uni.showToast({ title: '请先勾选订单', icon: 'none' })
          return
        }
        if (action === 'view') {
          if (list.length !== 1) { uni.showToast({ title: '请勾选1条查看', icon: 'none' }); return }
          this.openDetail(list[0])
          return
        }
        if (action === 'ship') {
          let n = 0
          list.forEach(o => {
            if (o.statusKey === 'await') {
              this.$set(o, 'status', '已发货')
              this.$set(o, 'statusKey', 'shipped')
              n++
            }
          })
          uni.showToast({ title: n ? ('已发货 ' + n + ' 单') : '无可发货项', icon: 'none' })
          return
        }
        if (action === 'cancel') {
          list.forEach(o => { this.$set(o, 'status', '已取消'); this.$set(o, 'statusKey', 'cancel') })
          uni.showToast({ title: '已取消 ' + list.length + ' 单', icon: 'none' })
          return
        }
        if (action === 'delete') {
          const ids = list.map(o => o.id)
          this.orderList = this.orderList.filter(o => ids.indexOf(o.id) < 0)
          uni.showToast({ title: '已删除 ' + list.length + ' 单', icon: 'none' })
          return
        }
        if (action === 'print') {
          uni.showToast({ title: '已发送打印任务', icon: 'none' })
          return
        }
        if (action === 'export') {
          const exportList = list.length ? list : this.filteredOrderList
          uni.showToast({ title: '已导出 ' + exportList.length + ' 条', icon: 'none' })
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

.order-container { width: 100%; display: flex; flex-direction: column; gap: 24rpx; }
.filter-bar { background:#fff; border-radius:24rpx; padding:24rpx 32rpx 8rpx; box-shadow:0 4rpx 20rpx rgba($primary-color, 0.06); }
.filter-row { display:flex; flex-wrap:wrap; align-items:center; gap:24rpx 28rpx; margin-bottom:20rpx; }
.filter-item { display:flex; align-items:center; gap:10rpx; flex-shrink:0; }
.filter-label { font-size:24rpx; color:#666; white-space:nowrap; }
.filter-input { height:64rpx; line-height:64rpx; padding:0 20rpx; border:0; border-radius:12rpx; background:$purple-surface; font-size:24rpx; color:#333; width:280rpx; }
.filter-input-picker { display:flex; align-items:center; }
.order-filter-range { display:flex; align-items:center; gap:8rpx; }
.range-input { width:140rpx; text-align:center; }
.range-sep { color:#999; font-size:22rpx; }
.filter-actions { display:flex; gap:16rpx; margin-left:auto; padding-bottom:12rpx; }

.btn { height:64rpx; line-height:64rpx; padding:0 28rpx; border-radius:999rpx; border:1px solid #E0DAEE; font-size:24rpx; display:inline-flex; align-items:center; background:#fff; color:#555; white-space:nowrap; }
.btn-primary { background:linear-gradient(135deg, $primary-color, $primary-light); color:#fff; font-weight:500; border:0; box-shadow:0 6rpx 16rpx rgba($primary-color, 0.28); }
.btn-default { background:#fff; color:#555; }

.action-bar { background:#fff; border-radius:24rpx; padding:24rpx 32rpx; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:20rpx; box-shadow:0 4rpx 20rpx rgba($primary-color, 0.06); }
.action-left, .action-right { display:flex; align-items:center; gap:16rpx; flex-wrap:wrap; }
.batch-count { font-size:24rpx; color:#888; margin-left:8rpx; }
.batch-count .batch-num { color:$primary-color; font-weight:600; }
.order-action-pager { font-size:24rpx; color:#666; }
.page-size-select { height:56rpx; line-height:56rpx; padding:0 16rpx; border-radius:12rpx; background:$purple-surface; font-size:22rpx; }
.page-btn { height:56rpx; line-height:56rpx; padding:0 20rpx; border-radius:12rpx; border:1px solid #E0DAEE; background:#fff; font-size:22rpx; color:#555; }
.page-btn[disabled] { opacity:0.45; }

.list-wrap { background:#fff; border-radius:24rpx; box-shadow:0 4rpx 20rpx rgba($primary-color, 0.06); overflow:hidden; }
.list-scroll { width:100%; white-space:nowrap; }
.list-table { display:inline-block; min-width:5200rpx; font-size:24rpx; vertical-align:top; }
.list-tr { display:flex; width:100%; align-items:stretch; }
.list-th { background:#FAF8FF; }
.list-th .list-td { color:#555; font-weight:600; }
.list-td { padding:22rpx 20rpx; color:#333; display:inline-flex; align-items:center; box-sizing:border-box; flex-shrink:0; white-space:nowrap; overflow:hidden; }
.list-tbody:nth-child(even) { background:#FCFBFF; }

.col-check { width:80rpx; justify-content:center; }
.col-o-op { width:100rpx; }
.col-o-refund { width:120rpx; }
.col-o-cover { width:100rpx; justify-content:center; }
.col-o-id { width:320rpx; }
.col-o-name { width:400rpx; }
.col-o-spec { width:140rpx; }
.col-o-brand { width:180rpx; }
.col-o-cat1, .col-o-cat2, .col-o-cat3 { width:140rpx; }
.col-o-unit, .col-o-total, .col-o-discount, .col-o-payamt { width:160rpx; }
.col-o-qty { width:100rpx; }
.col-o-act { width:140rpx; }
.col-o-user { width:280rpx; }
.col-o-phone { width:200rpx; }
.col-o-addr { width:480rpx; }
.col-o-st { width:140rpx; }

.cover-thumb { width:72rpx; height:72rpx; border-radius:12rpx; overflow:hidden; background:#F5F3FF; }
.cover-thumb image { width:100%; height:100%; }
.merchant-info { display:flex; align-items:center; gap:12rpx; }
.merchant-avatar { width:48rpx; height:48rpx; border-radius:50%; overflow:hidden; flex-shrink:0; }
.merchant-avatar image { width:100%; height:100%; }
.product-name { font-weight:500; color:#333; }
.product-id { font-size:22rpx; color:#6B5CAD; font-family:monospace; }
.product-sku { font-size:22rpx; color:#999; }
.merchant-name { font-size:24rpx; color:#444; }
.order-op-link { color:$primary-color; font-size:24rpx; }
.order-price { color:#EF4444; font-weight:600; font-size:24rpx; }
.order-price::before { content:'¥'; font-size:20rpx; margin-right:2rpx; }
.stat-num { font-weight:600; }

.status-tag { display:inline-block; padding:4rpx 14rpx; border-radius:8rpx; font-size:22rpx; font-weight:500; }
.status-tag.order-pending { background:#FEF3C7; color:#92400E; }
.status-tag.order-await { background:#FCE7F3; color:#9D174D; }
.status-tag.order-shipped, .status-tag.order-receive { background:#DBEAFE; color:#1E40AF; }
.status-tag.order-done { background:#D1FAE5; color:#065F46; }
.status-tag.order-cancel { background:#F3F4F6; color:#4B5563; }
.status-tag.order-refunding { background:#FEE2E2; color:#991B1B; }
.status-tag.order-refunded { background:#E5E7EB; color:#6B7280; }

/* ===== 订单详情弹窗 ===== */
.pm-mask { position: fixed; left: 0; top: 0; right: 0; bottom: 0; background: rgba(20, 12, 48, 0.55); z-index: 999; display: flex; align-items: center; justify-content: center; padding: 60rpx 40rpx; }
.pm-dialog { width: 100%; max-width: 1400rpx; background: #fff; border-radius: 28rpx; overflow: hidden; box-shadow: 0 24rpx 80rpx rgba(0, 0, 0, 0.28); display: flex; flex-direction: column; max-height: 88vh; }
.pm-header { height: 96rpx; padding: 0 32rpx; display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, $primary-color, $primary-light); flex-shrink: 0; }
.pm-title { font-size: 32rpx; font-weight: 700; color: #fff; letter-spacing: 1rpx; }
.pm-close { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; font-size: 48rpx; color: #fff; line-height: 1; }
.pm-body { padding: 32rpx 36rpx; flex: 1; height: 0; }
.pm-footer { height: 116rpx; padding: 0 36rpx; display: flex; align-items: center; justify-content: flex-end; border-top: 1px solid $purple-border; flex-shrink: 0; }
.pm-btn { width: 220rpx; }

.od-body { display: flex; flex-direction: column; }
.od-section { padding-bottom: 28rpx; margin-bottom: 24rpx; border-bottom: 1px solid $purple-border; }
.od-section:last-child { border-bottom: 0; margin-bottom: 0; padding-bottom: 0; }
.od-section-title { display: flex; align-items: center; font-size: 28rpx; font-weight: 700; color: #333; margin-bottom: 20rpx; }
.od-section-title::before { content: ''; width: 8rpx; height: 28rpx; border-radius: 4rpx; background: linear-gradient(180deg, $primary-color, $primary-light); margin-right: 14rpx; }

/* 键值网格（基本信息 / 费用信息） */
.od-grid { display: flex; flex-wrap: wrap; border: 1px solid $purple-border; border-radius: 16rpx; overflow: hidden; }
.od-pair { display: flex; flex: 0 0 33.333%; box-sizing: border-box; border-bottom: 1px solid $purple-border; min-height: 84rpx; }
.od-pair--wide { flex: 0 0 66.666%; }
.od-th { flex: 0 0 190rpx; width: 190rpx; padding: 20rpx 16rpx; background: #FAF8FF; color: #888; font-size: 22rpx; box-sizing: border-box; border-right: 1px solid $purple-border; white-space: nowrap; }
.od-td { flex: 1; padding: 20rpx 16rpx; color: #333; font-size: 24rpx; box-sizing: border-box; white-space: normal; word-break: break-all; }
.od-pair--red .od-td { color: #EF4444; font-weight: 600; }

/* 普通表格（发票 / 买家） */
.od-table { border: 1px solid $purple-border; border-radius: 16rpx; overflow: hidden; }
.od-row { display: flex; align-items: stretch; border-bottom: 1px solid $purple-border; }
.od-row:last-child { border-bottom: 0; }
.od-row--head { background: #FAF8FF; }
.od-cell { flex: 1; padding: 20rpx 16rpx; font-size: 24rpx; color: #333; box-sizing: border-box; border-right: 1px solid $purple-border; white-space: normal; word-break: break-all; }
.od-cell:last-child { border-right: 0; }
.od-row--head .od-cell { color: #666; font-weight: 600; font-size: 22rpx; }
.od-cell--addr { flex: 2; }

/* 商品信息表 */
.od-product-scroll { width: 100%; white-space: nowrap; }
.od-product-table { min-width: 1480rpx; border: 1px solid $purple-border; border-radius: 16rpx; overflow: hidden; }
.od-pcell { flex-shrink: 0; padding: 20rpx 16rpx; font-size: 24rpx; color: #333; box-sizing: border-box; border-right: 1px solid $purple-border; display: flex; align-items: center; white-space: normal; word-break: break-all; }
.od-pcell:last-child { border-right: 0; }
.od-row--head .od-pcell { color: #666; font-weight: 600; font-size: 22rpx; }
.od-pc-img { width: 120rpx; justify-content: center; }
.od-pc-name { width: 340rpx; }
.od-pc-price { width: 190rpx; }
.od-pc-spec { width: 130rpx; }
.od-pc-qty { width: 90rpx; justify-content: center; }
.od-pc-act { width: 130rpx; }
.od-pc-num { width: 150rpx; justify-content: flex-end; }
.od-price-cell { flex-direction: column; align-items: flex-start; justify-content: center; }
.od-sub { font-size: 20rpx; color: #999; }
.od-money { color: #EF4444; font-weight: 600; }
.od-left { text-align: left; }
.od-total { display: flex; justify-content: flex-end; align-items: center; gap: 12rpx; padding: 20rpx 24rpx 4rpx; }
.od-total-label { font-size: 24rpx; color: #666; }
.od-total-num { font-size: 30rpx; font-weight: 700; color: #EF4444; }

/* 操作信息表 */
.od-op-table { min-width: 1320rpx; border: 1px solid $purple-border; border-radius: 16rpx; overflow: hidden; }
.od-ocell { flex-shrink: 0; padding: 20rpx 16rpx; font-size: 24rpx; color: #333; box-sizing: border-box; border-right: 1px solid $purple-border; white-space: normal; word-break: break-all; }
.od-ocell:last-child { border-right: 0; }
.od-row--head .od-ocell { color: #666; font-weight: 600; font-size: 22rpx; }
.od-oc-operator { width: 240rpx; }
.od-oc-time { width: 280rpx; }
.od-oc-status { width: 150rpx; }
.od-oc-remark { width: 340rpx; }
</style>
