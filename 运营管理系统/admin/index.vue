<template>
  <view class="admin-page">
    <!-- 左侧侧边栏 -->
    <view class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <view class="sidebar-header">
        <view class="sidebar-logo">⚙</view>
        <view v-if="!sidebarCollapsed" class="sidebar-title">运营管理系统</view>
        <view class="sidebar-collapse-btn" @click="toggleSidebar">
          <text class="collapse-icon" :class="{ flipped: sidebarCollapsed }">‹</text>
        </view>
      </view>

      <scroll-view scroll-y class="menu-list">
        <view
          v-for="item in menus"
          :key="item.id"
          class="menu-item"
          :class="{ active: currentMenu === item.id }"
          :title="sidebarCollapsed ? item.name : ''"
          @click="onMenuClick(item)"
        >
          <view class="menu-icon" :class="{ active: currentMenu === item.id }" v-html="item.iconSvg"></view>
          <view v-if="!sidebarCollapsed" class="menu-label">{{ item.name }}</view>
        </view>
      </scroll-view>

      <view class="sidebar-toggle" @click="toggleSidebar" :title="sidebarCollapsed ? '展开菜单' : '收起菜单'">
        <text class="toggle-arrow" :class="{ flipped: sidebarCollapsed }">‹</text>
        <text v-if="!sidebarCollapsed" class="toggle-text">收起菜单</text>
      </view>
    </view>

    <!-- 右侧主区域 -->
    <view class="main-area">
      <view class="top-bar">
        <view class="top-bar-left">
          <view class="top-collapse-btn" @click="toggleSidebar">
            <text class="collapse-icon" :class="{ flipped: sidebarCollapsed }">‹</text>
          </view>
          <view class="page-path">
          <text class="home-icon">🏠</text>
          <text class="path-text">首页</text>
          <text class="sep">/</text>
          <template v-if="appView === 'settings'">
            <text class="path-text">设置</text>
            <text class="sep">/</text>
            <text class="current">{{ settingsCurrentName }}</text>
          </template>
          <text v-else class="current">{{ currentCfg.name }}</text>
        </view>
        </view>
        <view class="top-bar-right">
          <view class="settings-btn" :class="{ active: appView === 'settings' }" @click="openSettings" title="设置">
            <text class="settings-btn-icon">⚙</text>
            <text class="settings-btn-text">设置</text>
          </view>
          <view class="admin-user">
            <view class="admin-avatar">
              <image :src="getRoleAvatar('管理员')" mode="aspectFill" />
            </view>
            <text class="admin-name">管理员</text>
          </view>
        </view>
      </view>

      <scroll-view scroll-y class="content-wrap">
        <!-- 系统设置 -->
        <view v-if="appView === 'settings'" class="settings-container">
          <SettingsPanel v-model="settingsMenuId" />
        </view>

        <!-- ============ 商品管理面板 ============ -->
        <view v-else-if="currentMenu === 'product'" class="product-container">
          <!-- 筛选项 -->
          <view class="filter-bar">
            <view class="filter-row">
              <view class="filter-item">
                <text class="filter-label">关键词</text>
                <input class="filter-input" type="text" v-model="filterForm.keyword" placeholder="商品名称/ID/SKU" />
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
                <view class="btn btn-primary" @click="applyProductSearch"><text>🔍 查询</text></view>
                <view class="btn btn-default" @click="resetFilter"><text>↺ 重置</text></view>
              </view>
            </view>
          </view>

          <!-- 操作项 -->
          <view class="action-bar">
            <view class="action-left">
              <view class="btn btn-primary"><text>➕ 新增</text></view>
              <view class="btn btn-info"><text>✏ 编辑</text></view>
              <view class="btn btn-danger" @click="productBatchDelete"><text>🗑 删除</text></view>
              <view class="btn btn-success" @click="productBatchShelve(true)"><text>⬆ 上架</text></view>
              <view class="btn btn-warning" @click="productBatchShelve(false)"><text>⬇ 下架</text></view>
              <view class="btn btn-default" @click="productBatchAudit"><text>✅ 审核</text></view>
            </view>
            <view class="action-right">
              <text class="batch-count">已选 <text class="batch-num">{{ productCheckedCount }}</text> 项</text>
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
                    <checkbox :checked="productIsAllChecked" @change="productToggleCheckAll" color="#8B7CF6" style="transform:scale(0.85);" />
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
                <view class="list-tr list-tbody" v-for="p in displayProductList" :key="p.id">
                  <view class="list-td col-check">
                    <checkbox :checked="!!p._checked" @change="productToggleRowCheck(p)" color="#8B7CF6" style="transform:scale(0.85);" />
                  </view>
                  <view class="list-td col-op">
                    <view class="row-ops">
                      <view class="btn btn-mini btn-info" @click="productRowOp('edit', p)"><text class="op-icon">✏</text><text>编辑</text></view>
                      <view class="btn btn-mini btn-danger" @click="productRowOp('delete', p)"><text class="op-icon">🗑</text><text>删除</text></view>
                      <view
                        class="btn btn-mini"
                        :class="p.status === '已下架' ? 'btn-shelve-up-active' : 'btn-shelve-muted'"
                        @click="productRowOp('shelve-up', p)"
                      ><text class="op-icon">⬆</text><text>上架</text></view>
                      <view
                        class="btn btn-mini"
                        :class="p.status === '已下架' ? 'btn-shelve-muted' : 'btn-shelve-down-active'"
                        @click="productRowOp('shelve-down', p)"
                      ><text class="op-icon">⬇</text><text>下架</text></view>
                      <view
                        class="btn btn-mini"
                        :class="productAuditKey(p) === 'pending' ? 'btn-warning' : 'btn-default'"
                        @click="productRowOp('audit', p)"
                      ><text class="op-icon">✅</text><text>审核</text></view>
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
              <text class="total-text">共 <text class="b">{{ filteredProductList.length }}</text> 条记录，当前第 <text class="b">{{ productPage }}</text> / <text class="b">{{ productMaxPage }}</text> 页</text>
              <view class="pager-wrap">
                <picker :range="pageSizeList" @change="onPageSizeChange">
                  <view class="page-size-select"><text>{{ pageSize }}</text></view>
                </picker>
                <view class="pager">
                  <view class="page-btn" :class="{ disabled: productPage <= 1 }" @click="productPrevPage"><text>‹</text></view>
                  <view class="page-btn active"><text>{{ productPage }}</text></view>
                  <view class="page-btn" :class="{ disabled: productPage >= productMaxPage }" @click="productNextPage"><text>›</text></view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- ============ 商家管理面板 ============ -->
        <view v-else-if="currentMenu === 'merchant'" class="merchant-container">
          <!-- 筛选项 -->
          <view class="filter-bar">
            <view class="filter-row">
              <view class="filter-item">
                <text class="filter-label">关键词</text>
                <input class="filter-input" type="text" v-model="mFilterForm.keyword" placeholder="商家名称/ID/联系人" />
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
                <view class="btn btn-primary" @click="applyMerchantSearch"><text>🔍 查询</text></view>
                <view class="btn btn-default" @click="merchantResetFilter"><text>↺ 重置</text></view>
              </view>
            </view>
          </view>

          <!-- 操作项 -->
          <view class="action-bar">
            <view class="action-left">
              <view class="btn btn-primary" @click="merchantBatchAdd"><text>➕ 新增商家</text></view>
              <view class="btn btn-info" @click="merchantBatchEdit"><text>✏ 编辑</text></view>
              <view class="btn btn-danger" @click="merchantBatchDelete"><text>🗑 删除</text></view>
              <view class="btn btn-success" @click="merchantBatchAudit"><text>✅ 审核</text></view>
              <view class="btn btn-warning" @click="merchantBatchFreeze(true)"><text>❄ 冻结</text></view>
              <view class="btn btn-default" @click="merchantBatchFreeze(false)"><text>🔓 解冻</text></view>
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
                <view class="list-tr list-tbody" v-for="m in displayMerchantList" :key="m.id">
                  <view class="list-td col-check">
                    <checkbox :checked="!!m._checked" @change="merchantToggleRowCheck(m)" color="#8B7CF6" style="transform:scale(0.85);" />
                  </view>
                  <view class="list-td col-m-op">
                    <view class="row-ops">
                      <view class="btn btn-mini btn-info" @click="merchantRowOp('edit', m)"><text class="op-icon">✏</text><text>编辑</text></view>
                      <view class="btn btn-mini btn-danger" @click="merchantRowOp('delete', m)"><text class="op-icon">🗑</text><text>删除</text></view>
                      <view class="btn btn-mini btn-success" @click="merchantRowOp('audit', m)"><text class="op-icon">✅</text><text>审核</text></view>
                      <view class="btn btn-mini btn-warning" @click="merchantRowOp('freeze', m)"><text class="op-icon">❄</text><text>冻结</text></view>
                      <view class="btn btn-mini btn-default" @click="merchantRowOp('unfreeze', m)"><text class="op-icon">🔓</text><text>解冻</text></view>
                      <view class="btn btn-mini btn-default" @click="merchantRowOp('detail', m)"><text class="op-icon">👁</text><text>详情</text></view>
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
              <text class="total-text">共 <text class="b">{{ filteredMerchantList.length }}</text> 条记录，当前第 <text class="b">{{ merchantPage }}</text> / <text class="b">{{ merchantMaxPage }}</text> 页</text>
              <view class="pager-wrap">
                <picker :range="pageSizeList" @change="onPageSizeChange">
                  <view class="page-size-select"><text>{{ pageSize }}</text></view>
                </picker>
                <view class="pager">
                  <view class="page-btn" :class="{ disabled: merchantPage <= 1 }" @click="merchantPrevPage"><text>‹</text></view>
                  <view class="page-btn active"><text>{{ merchantPage }}</text></view>
                  <view class="page-btn" :class="{ disabled: merchantPage >= merchantMaxPage }" @click="merchantNextPage"><text>›</text></view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- ============ 订单管理完整面板 ============ -->
        <view v-else-if="currentMenu === 'order'" class="order-container">
          <!-- 筛选栏：对齐参考图 -->
          <view class="filter-bar">
            <view class="filter-row">
              <view class="filter-item">
                <text class="filter-label">订单组</text>
                <picker :range="filterOrderGroup" @change="(e)=>orderFilterForm.groupIdx=e.detail.value" class="picker-select">
                  <view class="filter-select">{{ filterOrderGroup[orderFilterForm.groupIdx] }} ▾</view>
                </picker>
              </view>
              <view class="filter-item">
                <text class="filter-label">商品名称</text>
                <picker :range="filterOrderProdNames" @change="(e)=>orderFilterForm.prodIdx=e.detail.value" class="picker-select">
                  <view class="filter-select">{{ filterOrderProdNames[orderFilterForm.prodIdx] }} ▾</view>
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
                <picker :range="filterOrderActivity" @change="(e)=>orderFilterForm.actIdx=e.detail.value" class="picker-select">
                  <view class="filter-select">{{ filterOrderActivity[orderFilterForm.actIdx] }} ▾</view>
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
                <picker :range="filterMerchant" @change="(e)=>orderFilterForm.merchantIdx=e.detail.value" class="picker-select">
                  <view class="filter-select">{{ filterMerchant[orderFilterForm.merchantIdx] }} ▾</view>
                </picker>
              </view>
              <view class="filter-item">
                <text class="filter-label">门店</text>
                <picker :range="filterOrderStore" @change="(e)=>orderFilterForm.storeIdx=e.detail.value" class="picker-select">
                  <view class="filter-select">{{ filterOrderStore[orderFilterForm.storeIdx] }} ▾</view>
                </picker>
              </view>
              <view class="filter-item">
                <text class="filter-label">订单状态</text>
                <picker :range="filterOrderStatus" :range-key="'label'" @change="(e)=>orderFilterForm.statusIdx=e.detail.value" class="picker-select">
                  <view class="filter-select">{{ filterOrderStatus[orderFilterForm.statusIdx].label }} ▾</view>
                </picker>
              </view>
              <view class="filter-item">
                <text class="filter-label">下单时间</text>
                <picker :range="filterOrderTime" @change="(e)=>orderFilterForm.timeIdx=e.detail.value" class="picker-select">
                  <view class="filter-select">{{ filterOrderTime[orderFilterForm.timeIdx] }} ▾</view>
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
              <button class="btn btn-primary" @click="orderBatchOp('view')">查看</button>
              <button class="btn btn-default" @click="orderBatchOp('ship')">发货</button>
              <button class="btn btn-default" @click="orderBatchOp('cancel')">取消订单</button>
              <button class="btn btn-default" @click="orderBatchOp('delete')">删除</button>
              <button class="btn btn-default" @click="orderBatchOp('print')">打印</button>
              <button class="btn btn-default" @click="orderBatchOp('export')">导出</button>
              <text class="batch-count">已选 <text>{{ orderCheckedCount }}</text> 项</text>
            </view>
            <view class="action-right order-action-pager">
              <text>共 {{ filteredOrderList.length }} 条，第 {{ orderPage }}/{{ orderMaxPage }} 页</text>
              <text>每页</text>
              <picker :range="pageSizeList" @change="onPageSizeChange" class="picker-select">
                <view class="page-size-select">{{ pageSizeNum || 10 }}</view>
              </picker>
              <button class="page-btn" :disabled="orderPage <= 1" @click="orderPrevPage">上一页</button>
              <button class="page-btn" :disabled="orderPage >= orderMaxPage" @click="orderNextPage">下一页</button>
            </view>
          </view>

          <!-- 列表表格 -->
          <view class="list-wrap">
            <scroll-view scroll-x="true" class="table-scroll-x">
              <view class="list-table-wrap" style="min-width:5200rpx;">
                <view class="list-table order-table">
                  <view class="thead">
                    <view class="tr">
                      <view class="th col-check"><input type="checkbox" :checked="orderCheckAll" @change="orderToggleCheckAll" class="checkbox" /></view>
                      <view class="th col-o-op">操作</view>
                      <view class="th col-o-refund">退款</view>
                      <view class="th col-o-cover">主图</view>
                      <view class="th col-o-id">订单号</view>
                      <view class="th col-o-name">商品名称</view>
                      <view class="th col-o-spec">规格</view>
                      <view class="th col-o-brand">品牌</view>
                      <view class="th col-o-cat1">一级分类</view>
                      <view class="th col-o-cat2">二级分类</view>
                      <view class="th col-o-cat3">三级分类</view>
                      <view class="th col-o-unit">单价</view>
                      <view class="th col-o-qty">数量</view>
                      <view class="th col-o-total">总价</view>
                      <view class="th col-o-act">活动类型</view>
                      <view class="th col-o-discount">优惠价格</view>
                      <view class="th col-o-payamt">实付金额</view>
                      <view class="th col-o-user">用户信息</view>
                      <view class="th col-o-phone">电话</view>
                      <view class="th col-o-addr">地址</view>
                      <view class="th col-o-st">订单状态</view>
                    </view>
                  </view>
                  <view class="tbody">
                    <view class="tr" v-for="o in displayOrderList" :key="o.id">
                      <view class="td col-check"><input type="checkbox" :checked="o._checked" @change="orderToggleRow(o)" class="checkbox" /></view>
                      <view class="td col-o-op">
                        <text class="order-op-link" @click="orderRowOp(orderRowOpLabel(o) === '发货' ? 'ship' : 'detail', o)">{{ orderRowOpLabel(o) }}</text>
                      </view>
                      <view class="td col-o-refund"><text class="product-sku">{{ orderRefundText(o) }}</text></view>
                      <view class="td col-o-cover">
                        <view class="cover-thumb"><image :src="o.prodCover || getProductCover(o.prodSku)" mode="aspectFill" /></view>
                      </view>
                      <view class="td col-o-id"><text class="product-id">{{ o.id }}</text></view>
                      <view class="td col-o-name" style="white-space:normal;line-height:1.4;"><text class="product-name">{{ o.prodName }}</text></view>
                      <view class="td col-o-spec"><text class="product-sku">{{ o.spec || '—' }}</text></view>
                      <view class="td col-o-brand"><text class="merchant-name">{{ o.brand || '—' }}</text></view>
                      <view class="td col-o-cat1"><text class="product-sku">{{ o.cat1 || '护肤' }}</text></view>
                      <view class="td col-o-cat2"><text class="product-sku">{{ o.cat2 || '面部护肤' }}</text></view>
                      <view class="td col-o-cat3"><text class="product-sku">{{ o.cat3 || '—' }}</text></view>
                      <view class="td col-o-unit" style="justify-content:flex-end;"><text class="order-price">{{ fmtPrice(orderUnitPrice(o)) }}</text></view>
                      <view class="td col-o-qty" style="justify-content:center;"><text class="stat-num">{{ o.prodQty || 1 }}</text></view>
                      <view class="td col-o-total" style="justify-content:flex-end;"><text class="order-price">{{ fmtPrice(orderTotalPrice(o)) }}</text></view>
                      <view class="td col-o-act"><text class="product-sku">{{ o.activityType || '无' }}</text></view>
                      <view class="td col-o-discount" style="justify-content:flex-end;"><text class="order-price">{{ fmtPrice(o.discountPrice || 0) }}</text></view>
                      <view class="td col-o-payamt" style="justify-content:flex-end;"><text class="order-price">{{ fmtPrice(o.payAmount != null ? o.payAmount : o.orderAmount) }}</text></view>
                      <view class="td col-o-user">
                        <view class="merchant-info">
                          <view class="merchant-avatar"><image :src="getUserAvatar(o.userId)" mode="aspectFill" /></view>
                          <view>
                            <view class="product-name" style="font-size:13px;">{{ o.userName }}</view>
                            <view class="product-sku">{{ o.userId }}</view>
                          </view>
                        </view>
                      </view>
                      <view class="td col-o-phone"><text class="product-sku">{{ o.receiverPhone }}</text></view>
                      <view class="td col-o-addr" style="white-space:normal;line-height:1.4;min-width:400rpx;"><text>{{ o.address }}</text></view>
                      <view class="td col-o-st"><text class="status-tag" :class="'order-'+o.statusKey">{{ o.status }}</text></view>
                    </view>
                  </view>
                </view>
              </view>
            </scroll-view>
          </view>
        </view>

        <!-- ============ 店铺装修 ============ -->
        <view v-else-if="currentMenu === 'decor'" class="decor-container">
          <DecorPanel />
        </view>

        <!-- ============ 其他模块（空面板占位） ============ -->
        <view v-else class="content-card">
          <view class="card-header">
            <view class="card-title-row">
              <view class="card-title-icon">
                <text>{{ currentCfg.icon }}</text>
              </view>
              <text class="card-title">{{ currentCfg.name }}</text>
            </view>
          </view>
          <view class="card-body">
            <view class="empty-placeholder">
              <text class="empty-icon">{{ currentCfg.icon }}</text>
              <text class="empty-text">{{ currentCfg.name }}</text>
              <text class="empty-tip">（内容为空 - 暂未填充业务数据）</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 审核弹窗 -->
    <view v-if="auditVisible" class="audit-mask" @click="closeAuditModal">
      <view class="audit-box" @click.stop>
        <view class="audit-header">
          <text class="audit-title">{{ auditTitle }}</text>
          <text class="audit-close" @click="closeAuditModal">×</text>
        </view>
        <view class="audit-body">
          <view class="audit-info">
            <text class="audit-info-type">{{ auditTypeLabel }}信息</text>
            <text class="audit-info-name">{{ auditTargetName }}</text>
            <text class="audit-info-meta">ID：{{ auditTargetId }} · 当前：{{ auditCurrentStatus }}</text>
            <text v-if="auditExtra" class="audit-info-extra">{{ auditExtra }}</text>
          </view>
          <view class="audit-field">
            <text class="audit-label">审核结果</text>
            <view class="audit-radios">
              <view
                v-for="opt in auditResultOptions"
                :key="opt.value"
                class="audit-radio"
                :class="{ active: auditForm.result === opt.value }"
                @click="auditForm.result = opt.value"
              >
                <text>{{ opt.label }}</text>
              </view>
            </view>
          </view>
          <view class="audit-field">
            <text class="audit-label">审核备注</text>
            <textarea class="audit-textarea" v-model="auditForm.remark" placeholder="选填，拒绝/驳回时建议填写原因" />
          </view>
        </view>
        <view class="audit-footer">
          <view class="btn btn-default" @click="closeAuditModal"><text>取消</text></view>
          <view class="btn btn-primary" @click="submitAudit"><text>确定</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import { getUserAvatar, getRoleAvatar } from '../common/user-avatar.js'
  import { getProductCover } from '../common/product-image.js'
  import DecorPanel from './decor/DecorPanel.vue'
  import SettingsPanel, { SETTINGS_MENUS } from './settings/SettingsPanel.vue'

  export default {
    components: { DecorPanel, SettingsPanel },
    onLoad() {
      try {
        const saved = uni.getStorageSync('admin_sidebar_collapsed')
        if (saved === '1' || saved === true) this.sidebarCollapsed = true
      } catch (e) {}
    },
    data() {
      const IMG = (p) => 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' + encodeURIComponent(p) + '&image_size=square'
      return {
        sidebarCollapsed: false,
        appView: 'workspace',
        currentMenu: 'product',
        settingsMenuId: 'brand',
        auditVisible: false,
        auditModule: '',
        auditTargetId: '',
        auditTargetName: '',
        auditCurrentStatus: '',
        auditExtra: '',
        auditTypeLabel: '',
        auditTitle: '审核',
        auditResultOptions: [],
        auditForm: { result: 'pass', remark: '' },
        menus: [
          {
            id: 'product', name: '商品管理',
            iconSvg: '<svg viewBox="0 0 24 24"><path class="mi-soft" d="M4.5 8.2 12 4.5l7.5 3.7v7.6L12 19.5 4.5 15.8V8.2z"/><path class="mi-line" d="M4.5 8.2 12 4.5l7.5 3.7v7.6L12 19.5 4.5 15.8V8.2z"/><path class="mi-line" d="M4.5 8.2 12 12l7.5-3.8M12 12v7.5"/></svg>'
          },
          {
            id: 'merchant', name: '商家管理',
            iconSvg: '<svg viewBox="0 0 24 24"><path class="mi-soft" d="M4 10.5h16V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8.5z"/><path class="mi-line" d="M3.5 10.5 5.2 5.8A1 1 0 0 1 6.15 5.2h11.7a1 1 0 0 1 .95.6L20.5 10.5"/><path class="mi-line" d="M4 10.5h16V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8.5z"/><path class="mi-line" d="M9.5 20v-5.2h5V20"/></svg>'
          },
          {
            id: 'order', name: '订单管理',
            iconSvg: '<svg viewBox="0 0 24 24"><path class="mi-soft" d="M7 5.5h10A1.5 1.5 0 0 1 18.5 7v12.5A1.5 1.5 0 0 1 17 21H7a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 7 5.5z"/><path class="mi-line" d="M9 4.8h6a.8.8 0 0 1 .8.8v1.2H8.2V5.6a.8.8 0 0 1 .8-.8z"/><path class="mi-line" d="M8.2 6.8H7A1.5 1.5 0 0 0 5.5 8.3v11.2A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1.5V8.3A1.5 1.5 0 0 0 17 6.8h-1.2"/><path class="mi-line" d="M9 11.5h6M9 15h4.5"/></svg>'
          },
          {
            id: 'review', name: '评价管理',
            iconSvg: '<svg viewBox="0 0 24 24"><path class="mi-soft" d="M12 3.8l2.35 4.76 5.25.76-3.8 3.7.9 5.23L12 15.8l-4.7 2.45.9-5.23-3.8-3.7 5.25-.76L12 3.8z"/><path class="mi-line" d="M12 3.8l2.35 4.76 5.25.76-3.8 3.7.9 5.23L12 15.8l-4.7 2.45.9-5.23-3.8-3.7 5.25-.76L12 3.8z"/></svg>'
          },
          {
            id: 'aftersale', name: '售后管理',
            iconSvg: '<svg viewBox="0 0 24 24"><circle class="mi-soft" cx="12" cy="12" r="8.2"/><path class="mi-line" d="M7.2 9.2A5.6 5.6 0 0 1 16.8 8.4"/><path class="mi-line" d="M16.8 5.6v3.2h-3.2"/><path class="mi-line" d="M16.8 14.8a5.6 5.6 0 0 1-9.6.8"/><path class="mi-line" d="M7.2 18.4v-3.2h3.2"/></svg>'
          },
          {
            id: 'user', name: '用户管理',
            iconSvg: '<svg viewBox="0 0 24 24"><circle class="mi-soft" cx="9.2" cy="8" r="3.2"/><path class="mi-soft" d="M3.5 19.2c0-2.9 2.6-5.2 5.7-5.2h.8c1.5 0 2.9.5 3.9 1.4"/><circle class="mi-line" cx="9.2" cy="8" r="3.2"/><path class="mi-line" d="M3.5 19.2c0-2.9 2.6-5.2 5.7-5.2h.8c3.1 0 5.7 2.3 5.7 5.2"/><path class="mi-line" d="M16.2 8.4a2.6 2.6 0 1 1 0 5.1"/><path class="mi-line" d="M17.4 14.2c2.2.3 3.9 2 3.9 4.1"/></svg>'
          },
          {
            id: 'activity', name: '活动管理',
            iconSvg: '<svg viewBox="0 0 24 24"><path class="mi-soft" d="M6.5 9.5h11v9.2a1.3 1.3 0 0 1-1.3 1.3H7.8a1.3 1.3 0 0 1-1.3-1.3V9.5z"/><path class="mi-line" d="M12 4.5c-1.6 0-2.8 1.2-2.8 2.6 0 1.8 2.8 3.6 2.8 3.6s2.8-1.8 2.8-3.6c0-1.4-1.2-2.6-2.8-2.6z"/><path class="mi-line" d="M6.5 10.5h11"/><path class="mi-line" d="M6.5 9.5h11v9.2a1.3 1.3 0 0 1-1.3 1.3H7.8a1.3 1.3 0 0 1-1.3-1.3V9.5z"/><path class="mi-line" d="M12 10.5v9.5"/></svg>'
          },
          {
            id: 'decor', name: '店铺装修',
            iconSvg: '<svg viewBox="0 0 24 24"><path class="mi-soft" d="M4.5 15.2 15.2 4.5l4.3 4.3L8.8 19.5H4.5v-4.3z"/><path class="mi-line" d="M4.5 15.2 15.2 4.5l4.3 4.3L8.8 19.5H4.5v-4.3z"/><path class="mi-line" d="M13.2 6.5l4.3 4.3"/><path class="mi-line" d="M4.8 20.2h6.2"/></svg>'
          },
          {
            id: 'community', name: '社区管理',
            iconSvg: '<svg viewBox="0 0 24 24"><path class="mi-soft" d="M5 6.5h9.5A2.5 2.5 0 0 1 17 9v4.2a2.5 2.5 0 0 1-2.5 2.5H9.2L5.8 18.5V15.7A2.5 2.5 0 0 1 5 13.2V6.5z"/><path class="mi-line" d="M5 6.5h9.5A2.5 2.5 0 0 1 17 9v4.2a2.5 2.5 0 0 1-2.5 2.5H9.2L5.8 18.5V15.7A2.5 2.5 0 0 1 5 13.2V6.5z"/><path class="mi-line" d="M17.2 8.6H18a2.2 2.2 0 0 1 2.2 2.2v3.4a2.2 2.2 0 0 1-2.2 2.2h-.6l-2 1.8"/></svg>'
          },
          {
            id: 'data', name: '数据中心',
            iconSvg: '<svg viewBox="0 0 24 24"><path class="mi-soft" d="M5 19.5V12h3.2v7.5H5zm5.4 0V8.2h3.2v11.3h-3.2zm5.4 0V4.8H19v14.7h-3.2z"/><path class="mi-line" d="M5 19.5V12h3.2v7.5H5z"/><path class="mi-line" d="M10.4 19.5V8.2h3.2v11.3h-3.2z"/><path class="mi-line" d="M15.8 19.5V4.8H19v14.7h-3.2z"/><path class="mi-line" d="M4 19.5h16"/></svg>'
          },
          {
            id: 'kefu', name: '知识库管理',
            iconSvg: '<svg viewBox="0 0 24 24"><path class="mi-soft" d="M5.5 8.2h9.2A2.8 2.8 0 0 1 17.5 11v4.2a2.8 2.8 0 0 1-2.8 2.8H9.6L6.2 20.5v-2.9A2.8 2.8 0 0 1 5.5 15V8.2z"/><path class="mi-line" d="M5.5 8.2h9.2A2.8 2.8 0 0 1 17.5 11v4.2a2.8 2.8 0 0 1-2.8 2.8H9.6L6.2 20.5v-2.9A2.8 2.8 0 0 1 5.5 15V8.2z"/><circle class="mi-line" cx="9" cy="12.2" r=".9"/><circle class="mi-line" cx="12.2" cy="12.2" r=".9"/><circle class="mi-line" cx="15.4" cy="12.2" r=".9"/><path class="mi-line" d="M17.8 9.2h.7A2.2 2.2 0 0 1 20.7 11.4v3.1a2.2 2.2 0 0 1-2.2 2.2h-.5"/></svg>'
          }
        ],
        // ===== 商品：筛选项选项 =====
        filterCat1: ['全部','护肤','彩妆','个护','香水','家居'],
        filterCat2: ['全部','面部护肤','身体护理','眼部护理','面部彩妆','唇部彩妆'],
        filterCat3: ['全部','洁面','爽肤水','精华','乳液/面霜','面膜','眼霜','粉底','口红'],
        filterBrand: ['全部','SK-II','Lancôme','Estée Lauder','完美日记','花西子','自然堂'],
        filterMerchant: ['全部','阅己美妆旗舰店','优品美妆专营','花语甄选店','海蓝精选','丽人全球购'],
        filterStatus: ['全部','已上架','已下架'],
        filterAudit: ['全部','待审核','审核通过','审核未通过'],
        filterForm: { keyword:'', cat1:'', cat2:'', cat3:'', brand:'', merchant:'', status:'', audit:'' },
        productAppliedFilter: { keyword:'', cat1:'', cat2:'', cat3:'', brand:'', merchant:'', status:'', audit:'' },
        productPage: 1,
        pageSizeList: ['10 条/页','20 条/页','50 条/页'],
        pageSize: '10 条/页',
        // ===== 商品：mock数据 =====
        productList: [
          {
            id: 'SP100001', name: '神仙水精华露 230ml 补水保湿提亮', brand: 'SK-II',
            sku: 'SK2-ESS-230-01', cat1: '护肤', cat2: '面部护肤', cat3: '精华',
            price: 1599.00, stock: 328, merchant: '阅己美妆旗舰店', merchantLetter: '阅',
            cover: IMG('sk2 essence bottle 230ml luxury skincare product photography studio white background clean'),
            fav: 12580, review: 3421, order: 8762, gmv: 12894566.00,
            status: '已上架', auditStatus: '审核通过'
          },
          {
            id: 'SP100002', name: '小黑瓶肌底修护精华液 50ml', brand: 'Lancôme',
            sku: 'LC-GX-50-009', cat1: '护肤', cat2: '面部护肤', cat3: '精华',
            price: 980.00, stock: 12, merchant: '优品美妆专营', merchantLetter: '优',
            cover: IMG('lancome advanced genifique serum 50ml black bottle luxury skincare product photo white background'),
            fav: 8924, review: 2156, order: 5432, gmv: 4894360.00,
            status: '已上架', auditStatus: '审核通过'
          },
          {
            id: 'SP100003', name: '小棕瓶眼霜 15ml 抗蓝光紧致', brand: 'Estée Lauder',
            sku: 'EL-EYE-15-022', cat1: '护肤', cat2: '眼部护理', cat3: '眼霜',
            price: 590.00, stock: 876, merchant: '海蓝精选', merchantLetter: '海',
            cover: IMG('estee lauder advanced night repair eye cream 15ml jar skincare product photography studio'),
            fav: 6712, review: 1680, order: 3980, gmv: 2177640.00,
            status: '已上架', auditStatus: '审核通过'
          },
          {
            id: 'SP100004', name: '羽毛气垫粉底液 自然色 SPF50+', brand: '完美日记',
            sku: 'WM-RJ-01-N', cat1: '彩妆', cat2: '面部彩妆', cat3: '粉底',
            price: 219.00, stock: 2450, merchant: '阅己美妆旗舰店', merchantLetter: '阅',
            cover: IMG('cushion compact foundation bb cream case natural beige cosmetics product photography white background'),
            fav: 15320, review: 5642, order: 18230, gmv: 3624750.00,
            status: '已上架', auditStatus: '审核通过'
          },
          {
            id: 'SP100005', name: '花西子同心锁口红 哑光雾面 M301', brand: '花西子',
            sku: 'HXZ-KS-M301', cat1: '彩妆', cat2: '唇部彩妆', cat3: '口红',
            price: 169.00, stock: 5200, merchant: '花语甄选店', merchantLetter: '花',
            cover: IMG('chinese style red lipstick matte tube carved floral luxury cosmetics product photo studio white'),
            fav: 24180, review: 9287, order: 36720, gmv: 5873280.00,
            status: '已上架', auditStatus: '审核通过'
          },
          {
            id: 'SP100006', name: '自然堂喜马拉雅冰川水 160ml', brand: '自然堂',
            sku: 'ZRT-BS-160-A', cat1: '护肤', cat2: '面部护肤', cat3: '爽肤水',
            price: 118.00, stock: 0, merchant: '丽人全球购', merchantLetter: '丽',
            cover: IMG('chando himalaya glacier toner bottle 160ml skincare product shot transparent bottle blue'),
            fav: 4230, review: 1089, order: 2780, gmv: 310520.00,
            status: '已下架', auditStatus: '待审核'
          },
          {
            id: 'SP100007', name: '氨基酸净透洁面乳 120g 温和不紧绷', brand: '完美日记',
            sku: 'WM-JM-120-03', cat1: '护肤', cat2: '面部护肤', cat3: '洁面',
            price: 69.00, stock: 9800, merchant: '优品美妆专营', merchantLetter: '优',
            cover: IMG('amino acid gentle facial cleanser white tube 120g skincare product photography clean white background'),
            fav: 9456, review: 3012, order: 15400, gmv: 987600.00,
            status: '已上架', auditStatus: '审核通过'
          },
          {
            id: 'SP100008', name: '玻尿酸补水保湿面膜 10片装', brand: '自然堂',
            sku: 'ZRT-MM-10P-B5', cat1: '护肤', cat2: '面部护肤', cat3: '面膜',
            price: 128.00, stock: 360, merchant: '阅己美妆旗舰店', merchantLetter: '阅',
            cover: IMG('hyaluronic acid hydrating sheet mask box packaging 10 pieces korean skincare product photo'),
            fav: 7845, review: 2341, order: 6540, gmv: 794880.00,
            status: '已下架', auditStatus: '待审核'
          }
        ],
        // ===== 商家：筛选项选项 =====
        mFilterType: ['全部','旗舰店','专营店','专卖店','普通店铺','个人店'],
        mFilterAudit: ['全部','待审核','审核通过','审核未通过','已驳回'],
        mFilterOpen: ['全部','营业中','已冻结','已关闭','休息中'],
        mFilterCategory: ['全部','护肤美妆','彩妆香水','个护清洁','家居生活','母婴用品','食品保健','综合百货'],
        mFilterJoin: ['全部','近7天','近30天','近3个月','近半年','1年以上'],
        mFilterRegion: ['全部','上海','北京','广州','深圳','杭州','成都','苏州','南京'],
        mFilterForm: { keyword:'', type:'', audit:'', open:'', category:'', join:'', region:'' },
        merchantAppliedFilter: { keyword:'', type:'', audit:'', open:'', category:'', join:'', region:'' },
        merchantPage: 1,
        // ===== 商家：mock数据（10条，覆盖各种类型/状态/地区） =====
        merchantList: [
          {
            id: 'SJ20240101', name: '阅己美妆旗舰店', type: '旗舰店', typeKey: 'flagship',
            legal: '张明', contact: '张经理', phone: '138****8888',
            category: '护肤美妆', region: '上海', address: '上海市徐汇区漕河泾开发区88号创新大厦A座1201',
            joinTime: '2024-01-15', auditStatus: '审核通过', auditKey: 'pass',
            openStatus: '营业中', openKey: 'open',
            logo: IMG('meili xiuxing flagship beauty store front sign purple white luxury cosmetics boutique'),
            productCount: 1286, orderCount: 98420, gmv: 68523680.00, score: 4.92
          },
          {
            id: 'SJ20240102', name: '优品美妆专营店', type: '专营店', typeKey: 'franchise',
            legal: '李思远', contact: '李主管', phone: '139****6666',
            category: '护肤美妆', region: '杭州', address: '浙江省杭州市西湖区文三路398号东方通信大厦18楼',
            joinTime: '2024-02-08', auditStatus: '审核通过', auditKey: 'pass',
            openStatus: '营业中', openKey: 'open',
            logo: IMG('youpin beauty cosmetics shop storefront blue gold premium boutique sign'),
            productCount: 856, orderCount: 62380, gmv: 38264520.00, score: 4.78
          },
          {
            id: 'SJ20240103', name: '花语甄选店', type: '专卖店', typeKey: 'exclusive',
            legal: '王花花', contact: '王店长', phone: '135****2222',
            category: '彩妆香水', region: '广州', address: '广州市天河区珠江新城花城大道85号高德置地秋广场1505',
            joinTime: '2024-03-12', auditStatus: '待审核', auditKey: 'pending',
            openStatus: '休息中', openKey: 'rest',
            logo: IMG('huayu selection cherry blossom boutique cosmetics shop storefront pink rose elegant'),
            productCount: 328, orderCount: 12560, gmv: 6235800.00, score: 4.65
          },
          {
            id: 'SJ20240104', name: '海蓝精选', type: '普通店铺', typeKey: 'normal',
            legal: '陈海蓝', contact: '陈女士', phone: '137****5555',
            category: '个护清洁', region: '深圳', address: '深圳市南山区科技园南区深南大道9966号威盛科技大厦20楼',
            joinTime: '2024-04-01', auditStatus: '审核通过', auditKey: 'pass',
            openStatus: '已冻结', openKey: 'frozen',
            logo: IMG('hailan ocean selection luxury cosmetics boutique logo blue wave gradient'),
            productCount: 412, orderCount: 8920, gmv: 4521680.00, score: 4.32
          },
          {
            id: 'SJ20240105', name: '丽人全球购', type: '个人店', typeKey: 'personal',
            legal: '刘丽丽', contact: '刘小姐', phone: '136****1111',
            category: '综合百货', region: '北京', address: '北京市朝阳区建国路88号SOHO现代城A座2808',
            joinTime: '2024-04-25', auditStatus: '审核未通过', auditKey: 'fail',
            openStatus: '已关闭', openKey: 'closed',
            logo: IMG('liren global shopping duty free boutique storefront globe green'),
            productCount: 156, orderCount: 3280, gmv: 985620.00, score: 3.85
          },
          {
            id: 'SJ20240106', name: '兰蔻官方授权店', type: '专卖店', typeKey: 'exclusive',
            legal: '赵雅芝', contact: '赵经理', phone: '186****7777',
            category: '护肤美妆', region: '成都', address: '四川省成都市锦江区春熙路西段158号银石广场17楼',
            joinTime: '2024-05-18', auditStatus: '审核通过', auditKey: 'pass',
            openStatus: '营业中', openKey: 'open',
            logo: IMG('lancome official authorized storefront luxury rose red gold elegant sign'),
            productCount: 218, orderCount: 18640, gmv: 18562400.00, score: 4.88
          },
          {
            id: 'SJ20240107', name: '完美日记品牌店', type: '旗舰店', typeKey: 'flagship',
            legal: '黄景瑜', contact: '黄总监', phone: '188****9999',
            category: '彩妆香水', region: '苏州', address: '江苏省苏州市工业园区星海街188号恒宇广场3期22层',
            joinTime: '2024-06-02', auditStatus: '已驳回', auditKey: 'reject',
            openStatus: '已关闭', openKey: 'closed',
            logo: IMG('perfect diary brand cosmetics flagship store sign diamond blue modern'),
            productCount: 456, orderCount: 24860, gmv: 8925680.00, score: 4.71
          },
          {
            id: 'SJ20240108', name: '自然堂生活美学馆', type: '专营店', typeKey: 'franchise',
            legal: '孙自然', contact: '孙店长', phone: '189****3333',
            category: '家居生活', region: '南京', address: '南京市建邺区河西大街89号金鹰世界A座21楼2103',
            joinTime: '2024-06-20', auditStatus: '审核通过', auditKey: 'pass',
            openStatus: '营业中', openKey: 'open',
            logo: IMG('chando lifestyle natural beauty pavilion green leaf organic eco storefront'),
            productCount: 286, orderCount: 9520, gmv: 3652800.00, score: 4.62
          },
          {
            id: 'SJ20240109', name: 'SK-II奢享汇', type: '旗舰店', typeKey: 'flagship',
            legal: '周诗诗', contact: '周经理', phone: '159****0008',
            category: '护肤美妆', region: '上海', address: '上海市静安区南京西路1788号越洋广场36楼',
            joinTime: '2024-07-05', auditStatus: '待审核', auditKey: 'pending',
            openStatus: '营业中', openKey: 'open',
            logo: IMG('sk2 luxury vip storefront japan skincare red drop logo premium boutique'),
            productCount: 98, orderCount: 5280, gmv: 9856420.00, score: 4.95
          },
          {
            id: 'SJ20240110', name: '花西子国风旗舰店', type: '旗舰店', typeKey: 'flagship',
            legal: '吴西子', contact: '吴CEO', phone: '158****6688',
            category: '彩妆香水', region: '杭州', address: '杭州市余杭区文一西路969号阿里巴巴西溪园区B区8号楼',
            joinTime: '2024-07-18', auditStatus: '审核通过', auditKey: 'pass',
            openStatus: '营业中', openKey: 'open',
            logo: IMG('huaxizi chinese traditional oriental flagship store front crane wind chime luxury gold'),
            productCount: 368, orderCount: 42380, gmv: 28654200.00, score: 4.86
          }
        ],
        // ===== 订单：筛选项选项 =====
        filterOrderStatus: [
          { label:'全部', val:'' },
          { label:'待付款', val:'pending' },
          { label:'待发货', val:'await' },
          { label:'已发货', val:'shipped' },
          { label:'已完成', val:'done' },
          { label:'已取消', val:'cancel' },
          { label:'退款中', val:'refunding' },
          { label:'已退款', val:'refunded' }
        ],
        filterPayStatus: [
          { label:'全部', val:'' },
          { label:'已支付', val:'paid' },
          { label:'未支付', val:'unpaid' },
          { label:'已退款', val:'refund' },
          { label:'部分退款', val:'part' }
        ],
        filterDelivery: [
          { label:'全部', val:'' },
          { label:'普通快递', val:'express' },
          { label:'顺丰速运', val:'sf' },
          { label:'到店自提', val:'pickup' },
          { label:'同城配送', val:'same' },
          { label:'无需物流', val:'none' }
        ],
        filterOrderTime: ['全部','近24小时','近7天','近30天','近3个月','近半年','1年以上'],
        filterPayMethod: ['全部','微信支付','支付宝','银行卡','余额支付','货到付款'],
        filterOrderGroup: ['全部','普通订单','拼团订单','秒杀订单','会员订单'],
        filterOrderActivity: ['全部','无','满减','秒杀','新人专享','会员折扣','买赠'],
        filterOrderStore: ['全部','上海旗舰店','杭州体验店','广州天河店','深圳南山店','成都春熙店','北京朝阳店','武汉光谷店','西安高新店','线上直发仓'],
        orderFilterForm: { groupIdx:0, prodIdx:0, paramMin:'', paramMax:'', actIdx:0, payMin:'', payMax:'', merchantIdx:0, storeIdx:0, statusIdx:0, timeIdx:0 },
        orderAppliedFilter: { group:'', prod:'', paramMin:'', paramMax:'', activity:'', payMin:'', payMax:'', merchant:'', store:'', status:'', time:'' },
        orderPage: 1,
        orderCheckAll: false,
        // ===== 订单：mock数据（10条，覆盖各种状态/支付/配送组合） =====
        orderList: [
          {
            id: 'DD2026082600001', orderTime: '2026-08-26 09:18:42', orderGroup: '普通订单',
            userId: 'U20240105', userName: '林予安', userAvatarBg: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)', userAvatarText: '林',
            merchantName: '阅己美妆旗舰店', store: '上海旗舰店',
            prodName: 'SK-II 神仙水精华露 230ml 经典款', prodSku: 'SK2-ESS-230-A', prodQty: 1, prodCover: IMG('sk2 essence bottle 230ml luxury skincare product photography studio white background clean'),
            brand: 'SK-II', spec: '230ml', cat1: '护肤', cat2: '面部护肤', cat3: '精华水',
            unitPrice: 1699.00, totalPrice: 1699.00, activityType: '无', discountPrice: 0, payAmount: 1699.00,
            itemCount: 1, orderAmount: 1699.00,
            payMethod: '微信支付', payMethodKey: 'wechat',
            payStatus: '已支付', payStatusKey: 'paid',
            delivery: '顺丰速运',
            deliveryStatus: '运输中', deliveryStatusKey: 'shipping',
            status: '待发货', statusKey: 'await', refund: '—',
            receiverPhone: '138****6688',
            address: '上海市浦东新区陆家嘴环路1000号恒生银行大厦18楼1805室',
            invoice: true,
            remark: '请尽快发货，生日礼物急用～',
            _checked: false
          },
          {
            id: 'DD2026082500256', orderTime: '2026-08-25 20:45:31',
            userId: 'U20240088', userName: '沈清欢', userAvatarBg: 'linear-gradient(135deg,#DBEAFE,#BFDBFE)', userAvatarText: '沈',
            merchantName: '优品美妆专营店',
            prodName: '兰蔻小黑瓶精华肌底液 100ml 大容量装', prodSku: 'LK-XHP-100B', prodQty: 1, prodCover: IMG('lancome advanced genifique serum 50ml black bottle luxury skincare product photo white background'),
            itemCount: 2, orderAmount: 2586.00,
            payMethod: '支付宝', payMethodKey: 'alipay',
            payStatus: '已支付', payStatusKey: 'paid',
            delivery: '普通快递',
            deliveryStatus: '已签收', deliveryStatusKey: 'signed',
            status: '已完成', statusKey: 'done',
            receiverPhone: '139****9912',
            address: '浙江省杭州市西湖区文三路478号华星时代广场C座2103',
            invoice: true,
            remark: '',
            _checked: false
          },
          {
            id: 'DD2026082600012', orderTime: '2026-08-26 10:32:05', orderGroup: '普通订单',
            userId: 'U20240256', userName: '顾惜月', userAvatarBg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', userAvatarText: '顾',
            merchantName: '花语甄选店', store: '广州天河店',
            prodName: '珂润润浸保湿化妆水 III 150ml', prodSku: 'CRL-HS-150-III', prodQty: 2, prodCover: IMG('curel moist lotion iii 150ml bottle japanese sensitive skincare product photo white background'),
            brand: '珂润', spec: '150ml', cat1: '护肤', cat2: '面部护肤', cat3: '爽肤水',
            unitPrice: 169.00, totalPrice: 338.00, activityType: '新人专享', discountPrice: 40, payAmount: 298.00,
            itemCount: 2, orderAmount: 298.00,
            payMethod: '微信支付', payMethodKey: 'wechat',
            payStatus: '未支付', payStatusKey: 'unpaid',
            delivery: '普通快递',
            deliveryStatus: '待发货', deliveryStatusKey: 'await',
            status: '待付款', statusKey: 'pending', refund: '—',
            receiverPhone: '135****2258',
            address: '广州市天河区珠江新城华夏路10号富力中心写字楼15楼',
            invoice: false,
            remark: '赠送一支小样 谢谢!',
            _checked: false
          },
          {
            id: 'DD2026082400198', orderTime: '2026-08-24 14:22:18',
            userId: 'U20240032', userName: '叶知夏', userAvatarBg: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)', userAvatarText: '叶',
            merchantName: '海蓝精选',
            prodName: '海蓝之谜浓缩修护精华露 50ml', prodSku: 'HLZM-CS-50-A', prodQty: 1, prodCover: IMG('la mer concentrate repair serum 50ml jar luxury skincare product photo marine blue'),
            itemCount: 1, orderAmount: 4280.00,
            payMethod: '银行卡', payMethodKey: 'card',
            payStatus: '已支付', payStatusKey: 'paid',
            delivery: '顺丰速运',
            deliveryStatus: '已签收', deliveryStatusKey: 'signed',
            status: '退款中', statusKey: 'refunding',
            receiverPhone: '137****7788',
            address: '深圳市南山区科技园南区高新南一道飞亚达科技大厦8楼西',
            invoice: true,
            remark: '包装有点压皱，申请退货',
            _checked: false
          },
          {
            id: 'DD2026082300412', orderTime: '2026-08-23 09:05:49',
            userId: 'U20240102', userName: '苏念初', userAvatarBg: 'linear-gradient(135deg,#E0E7FF,#C7D2FE)', userAvatarText: '苏',
            merchantName: '兰蔻官方授权店',
            prodName: '兰蔻菁纯臻颜精萃乳霜 60ml 滋润版', prodSku: 'LK-JC-60-M', prodQty: 1, prodCover: IMG('lancome absolution cream jar 60ml gold luxury skincare product photography studio'),
            itemCount: 3, orderAmount: 6560.00,
            payMethod: '余额支付', payMethodKey: 'balance',
            payStatus: '已支付', payStatusKey: 'paid',
            delivery: '同城配送',
            deliveryStatus: '派送中', deliveryStatusKey: 'delivering',
            status: '已发货', statusKey: 'shipped',
            receiverPhone: '186****3344',
            address: '四川省成都市锦江区春熙路东段1号伊藤洋华堂双楠店6楼',
            invoice: false,
            remark: '今天生日麻烦下午3点前送到',
            _checked: false
          },
          {
            id: 'DD2026082100332', orderTime: '2026-08-21 22:18:37',
            userId: 'U20240501', userName: '温以柔', userAvatarBg: 'linear-gradient(135deg,#F3F4F6,#E5E7EB)', userAvatarText: '温',
            merchantName: '完美日记品牌店',
            prodName: '完美日记探险家十二色眼影盘 玉兔盘', prodSku: 'WM-RJ-12-YT', prodQty: 1, prodCover: IMG('perfect diary explorer 12 color eyeshadow palette jade rabbit palette cosmetics product photo'),
            itemCount: 1, orderAmount: 129.90,
            payMethod: '货到付款', payMethodKey: 'cod',
            payStatus: '未支付', payStatusKey: 'unpaid',
            delivery: '普通快递',
            deliveryStatus: '已签收', deliveryStatusKey: 'signed',
            status: '已取消', statusKey: 'cancel',
            receiverPhone: '188****6677',
            address: '江苏省苏州市工业园区月亮湾路9号建屋紫金东方A座1206',
            invoice: false,
            remark: '不想要了',
            _checked: false
          },
          {
            id: 'DD2026082000068', orderTime: '2026-08-20 11:44:02',
            userId: 'U20240322', userName: '江晚宁', userAvatarBg: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)', userAvatarText: '江',
            merchantName: '自然堂生活美学馆',
            prodName: '自然堂喜马拉雅冰川补水礼盒 4件套', prodSku: 'ZRT-BS-LH-4P', prodQty: 1, prodCover: IMG('chando himalaya glacier hydrating gift set 4 piece skincare box product shot blue'),
            itemCount: 1, orderAmount: 498.00,
            payMethod: '微信支付', payMethodKey: 'wechat',
            payStatus: '已退款', payStatusKey: 'refund',
            delivery: '普通快递',
            deliveryStatus: '已退款', deliveryStatusKey: 'refund',
            status: '已退款', statusKey: 'refunded',
            receiverPhone: '189****2211',
            address: '南京市建邺区庐山路188号新地中心二期C座808',
            invoice: true,
            remark: '过敏 全额退款',
            _checked: false
          },
          {
            id: 'DD2026081900555', orderTime: '2026-08-19 15:58:14',
            userId: 'U20240608', userName: '陆星眠', userAvatarBg: 'linear-gradient(135deg,#FEF9C3,#FDE68A)', userAvatarText: '陆',
            merchantName: 'SK-II奢享汇',
            prodName: 'SK-II 大红瓶面霜 80g 轻盈版', prodSku: 'SK2-DHP-80G-A', prodQty: 1, prodCover: IMG('sk2 rna power radical new age cream 80g jar red luxury skincare product photo'),
            itemCount: 2, orderAmount: 2798.00,
            payMethod: '支付宝', payMethodKey: 'alipay',
            payStatus: '已支付', payStatusKey: 'paid',
            delivery: '无需物流',
            deliveryStatus: '已完成', deliveryStatusKey: 'done',
            status: '已完成', statusKey: 'done',
            receiverPhone: '159****0008',
            address: '上海市静安区南京西路1788号越洋广场36楼SK-II专柜',
            invoice: true,
            remark: '专柜自提，已取货',
            _checked: false
          },
          {
            id: 'DD2026082600089', orderTime: '2026-08-26 11:12:57',
            userId: 'U20240178', userName: '许清禾', userAvatarBg: 'linear-gradient(135deg,#CFFAFE,#A5F3FC)', userAvatarText: '许',
            merchantName: '花西子国风旗舰店',
            prodName: '花西子玉容养肤气垫CC霜 C30 自然色', prodSku: 'HXZ-QD-C30', prodQty: 1, prodCover: IMG('huaxizi jade cushion cc cream compact case chinese luxury cosmetics product photo white'),
            itemCount: 1, orderAmount: 199.00,
            payMethod: '微信支付', payMethodKey: 'wechat',
            payStatus: '部分退款', payStatusKey: 'part',
            delivery: '到店自提',
            deliveryStatus: '待提货', deliveryStatusKey: 'waitpick',
            status: '已发货', statusKey: 'shipped',
            receiverPhone: '158****6688',
            address: '杭州市余杭区文一西路969号阿里巴巴西溪园区B区8号楼花西子专柜',
            invoice: false,
            remark: '退了一盒差价，留一盒',
            _checked: false
          },
          {
            id: 'DD2026081800031', orderTime: '2026-08-18 08:25:06',
            userId: 'U20240901', userName: '程予薇', userAvatarBg: 'linear-gradient(135deg,#F3E8FF,#EDE9FE)', userAvatarText: '程',
            merchantName: '阅己美妆旗舰店',
            prodName: '雅诗兰黛小棕瓶修护精华 75ml', prodSku: 'YSLD-XZP-75-B', prodQty: 1, prodCover: IMG('estee lauder advanced night repair serum 75ml brown bottle skincare product photography studio'),
            itemCount: 4, orderAmount: 5960.00,
            payMethod: '银行卡', payMethodKey: 'card',
            payStatus: '已支付', payStatusKey: 'paid',
            delivery: '顺丰速运',
            deliveryStatus: '已揽件', deliveryStatusKey: 'picked',
            status: '已发货', statusKey: 'shipped',
            receiverPhone: '136****8899',
            address: '北京市朝阳区建国路81号华贸中心写字楼3座2301',
            invoice: true,
            remark: '',
            _checked: false
          }
        ]
      }
    },
    computed: {
      currentCfg() {
        return this.menus.find(m => m.id === this.currentMenu) || this.menus[0]
      },
      settingsCurrentName() {
        const hit = SETTINGS_MENUS.find((m) => m.id === this.settingsMenuId)
        return hit ? hit.name : '系统设置'
      },
      pageSizeNum() {
        return parseInt(this.pageSize, 10) || 10
      },
      // 商品：筛选与分页
      filteredProductList() {
        const f = this.productAppliedFilter
        const kw = (f.keyword || '').trim().toLowerCase()
        return this.productList.filter(p => {
          if (kw) {
            const hit = (p.name || '').toLowerCase().includes(kw)
              || (p.id || '').toLowerCase().includes(kw)
              || (p.sku || '').toLowerCase().includes(kw)
            if (!hit) return false
          }
          if (f.cat1 && p.cat1 !== f.cat1) return false
          if (f.cat2 && p.cat2 !== f.cat2) return false
          if (f.cat3 && p.cat3 !== f.cat3) return false
          if (f.brand && p.brand !== f.brand) return false
          if (f.merchant && p.merchant !== f.merchant) return false
          if (f.status && p.status !== f.status) return false
          if (f.audit && p.auditStatus !== f.audit) return false
          return true
        })
      },
      productMaxPage() {
        return Math.max(1, Math.ceil(this.filteredProductList.length / this.pageSizeNum))
      },
      displayProductList() {
        const start = (this.productPage - 1) * this.pageSizeNum
        return this.filteredProductList.slice(start, start + this.pageSizeNum)
      },
      // 商家：筛选与分页
      filteredMerchantList() {
        const f = this.merchantAppliedFilter
        const kw = (f.keyword || '').trim().toLowerCase()
        return this.merchantList.filter(m => {
          if (kw) {
            const hit = (m.name || '').toLowerCase().includes(kw)
              || (m.id || '').toLowerCase().includes(kw)
              || (m.contact || '').toLowerCase().includes(kw)
            if (!hit) return false
          }
          if (f.type && m.type !== f.type) return false
          if (f.audit && m.auditStatus !== f.audit) return false
          if (f.open && m.openStatus !== f.open) return false
          if (f.category && m.category !== f.category) return false
          if (f.region && m.region !== f.region) return false
          if (!this.withinJoinRange(m.joinTime, f.join)) return false
          return true
        })
      },
      merchantMaxPage() {
        return Math.max(1, Math.ceil(this.filteredMerchantList.length / this.pageSizeNum))
      },
      displayMerchantList() {
        const start = (this.merchantPage - 1) * this.pageSizeNum
        return this.filteredMerchantList.slice(start, start + this.pageSizeNum)
      },
      // 订单：筛选与分页
      filteredOrderList() {
        const f = this.orderAppliedFilter
        const f = this.orderAppliedFilter
        const paramMin = f.paramMin === '' ? null : parseFloat(f.paramMin)
        const paramMax = f.paramMax === '' ? null : parseFloat(f.paramMax)
        const payMin = f.payMin === '' ? null : parseFloat(f.payMin)
        const payMax = f.payMax === '' ? null : parseFloat(f.payMax)
        return this.orderList.filter(o => {
          if (f.group && (o.orderGroup || '普通订单') !== f.group) return false
          if (f.prod && o.prodName !== f.prod) return false
          if (f.activity && (o.activityType || '无') !== f.activity) return false
          if (f.merchant && o.merchantName !== f.merchant) return false
          if (f.store && (o.store || '线上直发仓') !== f.store) return false
          if (f.status && o.status !== f.status) return false
          if (!this.withinOrderTime(o.orderTime, f.time)) return false
          const unit = this.orderUnitPrice(o)
          if (paramMin != null && !isNaN(paramMin) && unit < paramMin) return false
          if (paramMax != null && !isNaN(paramMax) && unit > paramMax) return false
          const pay = Number(o.payAmount != null ? o.payAmount : o.orderAmount) || 0
          if (payMin != null && !isNaN(payMin) && pay < payMin) return false
          if (payMax != null && !isNaN(payMax) && pay > payMax) return false
          return true
        })
      },
      filterOrderProdNames() {
        const names = ['全部']
        this.orderList.forEach(o => { if (o.prodName && names.indexOf(o.prodName) < 0) names.push(o.prodName) })
        return names
      },
      orderMaxPage() {
        return Math.max(1, Math.ceil(this.filteredOrderList.length / this.pageSizeNum))
      },
      displayOrderList() {
        const start = (this.orderPage - 1) * this.pageSizeNum
        return this.filteredOrderList.slice(start, start + this.pageSizeNum)
      },
      // 商品：勾选
      productCheckedCount() {
        return this.productList.filter(p => p._checked).length
      },
      productIsAllChecked() {
        const list = this.displayProductList
        return list.length > 0 && list.every(p => p._checked)
      },
      // 商家：勾选
      merchantCheckedCount() {
        return this.merchantList.filter(m => m._checked).length
      },
      merchantIsAllChecked() {
        const list = this.displayMerchantList
        return list.length > 0 && list.every(m => m._checked)
      },
      // 订单：勾选
      orderCheckedCount() {
        return this.orderList.filter(o => o._checked).length
      },
      orderIsAllChecked() {
        const list = this.displayOrderList
        return list.length > 0 && list.every(o => o._checked)
      }
    },
    methods: {
      getUserAvatar,
      getRoleAvatar,
      getProductCover,
      // ===== 通用：筛选工具 =====
      normFilterVal(v) {
        return (!v || v === '全部') ? '' : v
      },
      withinJoinRange(dateStr, range) {
        if (!range || !dateStr) return true
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        const d = new Date(dateStr.replace(/-/g, '/'))
        const diffDays = Math.floor((today - d) / 86400000)
        if (range === '近7天') return diffDays >= 0 && diffDays <= 7
        if (range === '近30天') return diffDays >= 0 && diffDays <= 30
        if (range === '近3个月') return diffDays >= 0 && diffDays <= 90
        if (range === '近半年') return diffDays >= 0 && diffDays <= 180
        if (range === '1年以上') return diffDays >= 365
        return true
      },
      withinOrderTime(dateStr, range) {
        if (!range || !dateStr) return true
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        const d = new Date(dateStr.replace(/-/g, '/'))
        const diffMs = today - d
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)
        if (range === '近24小时') return diffHours >= 0 && diffHours <= 24
        if (range === '近7天') return diffDays >= 0 && diffDays <= 7
        if (range === '近30天') return diffDays >= 0 && diffDays <= 30
        if (range === '近3个月') return diffDays >= 0 && diffDays <= 90
        if (range === '近半年') return diffDays >= 0 && diffDays <= 180
        if (range === '1年以上') return diffDays >= 365
        return true
      },
      onPageSizeChange(e) {
        this.pageSize = this.pageSizeList[e.detail.value]
        this.productPage = 1
        this.merchantPage = 1
        this.orderPage = 1
      },
      // ===== 通用：封面图生成 =====
      $img(p) {
        return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' + encodeURIComponent(p) + '&image_size=square'
      },
      onMenuClick(item) {
        this.appView = 'workspace'
        this.currentMenu = item.id
      },
      openSettings() {
        this.appView = 'settings'
        this.settingsMenuId = 'brand'
      },
      toggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed
        try {
          uni.setStorageSync('admin_sidebar_collapsed', this.sidebarCollapsed ? '1' : '0')
        } catch (e) {}
      },
      // ===== 商品：筛选与工具方法 =====
      applyProductSearch() {
        const f = this.filterForm
        this.productAppliedFilter = {
          keyword: f.keyword || '',
          cat1: this.normFilterVal(f.cat1),
          cat2: this.normFilterVal(f.cat2),
          cat3: this.normFilterVal(f.cat3),
          brand: this.normFilterVal(f.brand),
          merchant: this.normFilterVal(f.merchant),
          status: this.normFilterVal(f.status),
          audit: this.normFilterVal(f.audit)
        }
        this.productPage = 1
      },
      resetFilter() {
        this.filterForm = { keyword:'', cat1:'', cat2:'', cat3:'', brand:'', merchant:'', status:'', audit:'' }
        this.productAppliedFilter = { keyword:'', cat1:'', cat2:'', cat3:'', brand:'', merchant:'', status:'', audit:'' }
        this.productPage = 1
      },
      productPrevPage() {
        if (this.productPage > 1) this.productPage--
      },
      productNextPage() {
        if (this.productPage < this.productMaxPage) this.productPage++
      },
      fmtPrice(v) {
        const num = Math.round(v * 100) / 100
        return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      },
      fmtInt(v) {
        return Number(v).toLocaleString('zh-CN')
      },
      productToggleCheckAll(e) {
        const checked = e.detail.value && e.detail.value.length > 0
        this.displayProductList.forEach(p => { this.$set(p, '_checked', checked) })
      },
      productToggleRowCheck(p) {
        this.$set(p, '_checked', !p._checked)
      },
      productRowOp(op, p) {
        const name = p.name || p.id
        if (op === 'edit') {
          uni.showToast({ title: '编辑：' + name, icon: 'none' })
        } else if (op === 'delete') {
          uni.showModal({
            title: '确认删除',
            content: '确定删除「' + name + '」吗？',
            success: (res) => {
              if (res.confirm) {
                const idx = this.productList.findIndex(x => x.id === p.id)
                if (idx >= 0) this.productList.splice(idx, 1)
                uni.showToast({ title: '已删除', icon: 'success' })
              }
            }
          })
        } else if (op === 'shelve-up') {
          if (p.status === '已上架') return
          this.syncProductAuditAndShelf(p, 'shelf', true)
          uni.showToast({ title: '已上架（同步审核通过）', icon: 'success' })
        } else if (op === 'shelve-down') {
          if (p.status === '已下架') return
          this.syncProductAuditAndShelf(p, 'shelf', false)
          uni.showToast({ title: '已下架（同步待审核）', icon: 'success' })
        } else if (op === 'audit') {
          this.openAuditModal('product', p)
        }
      },
      productAuditKey(p) {
        if (!p) return 'pending'
        if (p.auditKey) return p.auditKey
        const s = p.auditStatus || '待审核'
        if (s === '审核通过') return 'pass'
        if (s === '审核未通过') return 'fail'
        if (s === '已驳回') return 'reject'
        return 'pending'
      },
      /** driver: audit | shelf；shelfOn 仅 shelf 时用 */
      syncProductAuditAndShelf(p, driver, shelfOn) {
        if (!p) return
        if (driver === 'audit') {
          const on = (p.auditStatus === '审核通过')
          this.$set(p, 'status', on ? '已上架' : '已下架')
          this.$set(p, 'auditKey', this.productAuditKey(p))
        } else if (driver === 'shelf') {
          const on = !!shelfOn
          this.$set(p, 'status', on ? '已上架' : '已下架')
          if (on) {
            this.$set(p, 'auditStatus', '审核通过')
            this.$set(p, 'auditKey', 'pass')
          } else {
            if (p.auditStatus !== '审核未通过') {
              this.$set(p, 'auditStatus', '待审核')
              this.$set(p, 'auditKey', 'pending')
            } else {
              this.$set(p, 'auditKey', 'fail')
            }
          }
        }
      },
      productCheckedIds() {
        return this.productList.filter(p => p._checked).map(p => p.id)
      },
      productBatchShelve(toOn) {
        const ids = this.productCheckedIds()
        if (!ids.length) {
          uni.showToast({ title: toOn ? '请先勾选需要上架的商品' : '请先勾选需要下架的商品', icon: 'none' })
          return
        }
        let ok = 0, skip = 0
        ids.forEach(id => {
          const p = this.productList.find(x => x.id === id)
          if (!p) return
          if (toOn) {
            if (p.status === '已上架') { skip++; return }
            this.syncProductAuditAndShelf(p, 'shelf', true)
            ok++
          } else {
            if (p.status === '已下架') { skip++; return }
            this.syncProductAuditAndShelf(p, 'shelf', false)
            ok++
          }
        })
        if (toOn) {
          uni.showToast({
            title: ok ? ('已上架 ' + ok + ' 件（已同步审核通过）' + (skip ? '，跳过 ' + skip + ' 件' : '')) : '没有可上架商品',
            icon: 'none'
          })
        } else {
          uni.showToast({
            title: ok ? ('已下架 ' + ok + ' 件（已同步待审核）' + (skip ? '，跳过 ' + skip + ' 件' : '')) : '没有可下架商品',
            icon: 'none'
          })
        }
      },
      productBatchDelete() {
        const ids = this.productCheckedIds()
        if (!ids.length) {
          uni.showToast({ title: '请先勾选需要删除的商品', icon: 'none' })
          return
        }
        uni.showModal({
          title: '确认删除',
          content: '确定删除选中的 ' + ids.length + ' 件商品吗？',
          success: (res) => {
            if (!res.confirm) return
            ids.forEach(id => {
              const idx = this.productList.findIndex(x => x.id === id)
              if (idx >= 0) this.productList.splice(idx, 1)
            })
            uni.showToast({ title: '已删除 ' + ids.length + ' 件', icon: 'success' })
          }
        })
      },
      productBatchAudit() {
        const checked = this.productList.filter(p => p._checked)
        if (!checked.length) {
          uni.showToast({ title: '请先勾选需要审核的商品', icon: 'none' })
          return
        }
        this.openAuditModal('product', checked[0])
      },
      openAuditModal(module, item) {
        if (!item) return
        this.auditModule = module
        this.auditTargetId = item.id
        this.auditTargetName = item.name || item.id
        this.auditForm = { result: 'pass', remark: '' }
        if (module === 'product') {
          this.auditTitle = '商品审核'
          this.auditTypeLabel = '商品'
          this.auditCurrentStatus = item.auditStatus || '待审核'
          this.auditExtra = '品牌：' + (item.brand || '—') + ' · 商家：' + (item.merchant || '—')
          this.auditResultOptions = [
            { value: 'pass', label: '审核通过' },
            { value: 'fail', label: '审核未通过' }
          ]
        } else if (module === 'merchant') {
          this.auditTitle = '商家审核'
          this.auditTypeLabel = '商家'
          this.auditCurrentStatus = item.auditStatus || '待审核'
          this.auditExtra = '类型：' + (item.type || '—') + ' · 地区：' + (item.region || '—')
          this.auditResultOptions = [
            { value: 'pass', label: '审核通过' },
            { value: 'fail', label: '审核未通过' },
            { value: 'reject', label: '驳回' }
          ]
        }
        this.auditVisible = true
      },
      closeAuditModal() {
        this.auditVisible = false
        this.auditTargetId = ''
      },
      submitAudit() {
        const result = this.auditForm.result
        const remark = (this.auditForm.remark || '').trim()
        if ((result === 'fail' || result === 'reject') && !remark) {
          uni.showModal({
            title: '提示',
            content: '未填写备注，确定继续提交吗？',
            success: (res) => { if (res.confirm) this.applyAudit(result, remark) }
          })
          return
        }
        this.applyAudit(result, remark)
      },
      applyAudit(result, remark) {
        if (this.auditModule === 'product') {
          const p = this.productList.find(x => x.id === this.auditTargetId)
          if (!p) return
          if (result === 'pass') {
            this.$set(p, 'auditStatus', '审核通过')
            this.$set(p, 'auditKey', 'pass')
            this.syncProductAuditAndShelf(p, 'audit')
          } else {
            this.$set(p, 'auditStatus', '审核未通过')
            this.$set(p, 'auditKey', 'fail')
            this.syncProductAuditAndShelf(p, 'audit')
          }
          if (remark) this.$set(p, 'auditRemark', remark)
        } else if (this.auditModule === 'merchant') {
          const m = this.merchantList.find(x => x.id === this.auditTargetId)
          if (!m) return
          if (result === 'pass') {
            this.$set(m, 'auditStatus', '审核通过')
            this.$set(m, 'auditKey', 'pass')
          } else if (result === 'reject') {
            this.$set(m, 'auditStatus', '已驳回')
            this.$set(m, 'auditKey', 'reject')
          } else {
            this.$set(m, 'auditStatus', '审核未通过')
            this.$set(m, 'auditKey', 'fail')
          }
          if (remark) this.$set(m, 'auditRemark', remark)
        }
        const tip = result === 'pass' ? '审核通过' : (result === 'reject' ? '已驳回' : '审核未通过')
        uni.showToast({ title: tip + '：' + this.auditTargetName, icon: 'none' })
        this.closeAuditModal()
      },
      // ===== 商家：筛选与工具方法 =====
      applyMerchantSearch() {
        const f = this.mFilterForm
        this.merchantAppliedFilter = {
          keyword: f.keyword || '',
          type: this.normFilterVal(f.type),
          audit: this.normFilterVal(f.audit),
          open: this.normFilterVal(f.open),
          category: this.normFilterVal(f.category),
          join: this.normFilterVal(f.join),
          region: this.normFilterVal(f.region)
        }
        this.merchantPage = 1
      },
      merchantResetFilter() {
        this.mFilterForm = { keyword:'', type:'', audit:'', open:'', category:'', join:'', region:'' }
        this.merchantAppliedFilter = { keyword:'', type:'', audit:'', open:'', category:'', join:'', region:'' }
        this.merchantPage = 1
      },
      merchantPrevPage() {
        if (this.merchantPage > 1) this.merchantPage--
      },
      merchantNextPage() {
        if (this.merchantPage < this.merchantMaxPage) this.merchantPage++
      },
      merchantToggleCheckAll(e) {
        const checked = e.detail.value && e.detail.value.length > 0
        this.displayMerchantList.forEach(m => { this.$set(m, '_checked', checked) })
      },
      merchantToggleRowCheck(m) {
        this.$set(m, '_checked', !m._checked)
      },
      merchantRowOp(op, m) {
        const name = m.name || m.id
        if (op === 'detail') {
          uni.showModal({
            title: '商家详情',
            content: 'ID：' + m.id + '\n联系人：' + m.contact + '\n地区：' + m.region,
            showCancel: false
          })
        } else if (op === 'edit') {
          uni.showToast({ title: '编辑：' + name, icon: 'none' })
        } else if (op === 'delete') {
          uni.showModal({
            title: '确认删除',
            content: '确定删除「' + name + '」吗？',
            success: (res) => {
              if (res.confirm) {
                const idx = this.merchantList.findIndex(x => x.id === m.id)
                if (idx >= 0) this.merchantList.splice(idx, 1)
                uni.showToast({ title: '已删除', icon: 'success' })
              }
            }
          })
        } else if (op === 'audit') {
          this.openAuditModal('merchant', m)
        } else if (op === 'freeze') {
          this.$set(m, 'openStatus', '已冻结')
          this.$set(m, 'openKey', 'frozen')
          uni.showToast({ title: '已冻结', icon: 'success' })
        } else if (op === 'unfreeze') {
          this.$set(m, 'openStatus', '营业中')
          this.$set(m, 'openKey', 'open')
          uni.showToast({ title: '已解冻', icon: 'success' })
        }
      },
      merchantCheckedIds() {
        return this.merchantList.filter(m => m._checked).map(m => m.id)
      },
      merchantBatchAdd() {
        uni.showToast({ title: '请在运营预览页新增商家', icon: 'none' })
      },
      merchantBatchEdit() {
        const ids = this.merchantCheckedIds()
        if (!ids.length) {
          uni.showToast({ title: '请先勾选要编辑的商家', icon: 'none' })
          return
        }
        if (ids.length > 1) {
          uni.showToast({ title: '一次只能编辑一家商家', icon: 'none' })
          return
        }
        const m = this.merchantList.find(x => x.id === ids[0])
        if (m) this.merchantRowOp('edit', m)
      },
      merchantBatchDelete() {
        const ids = this.merchantCheckedIds()
        if (!ids.length) {
          uni.showToast({ title: '请先勾选要删除的商家', icon: 'none' })
          return
        }
        uni.showModal({
          title: '确认删除',
          content: '确定删除选中的 ' + ids.length + ' 家商家吗？',
          success: (res) => {
            if (!res.confirm) return
            ids.forEach(id => {
              const idx = this.merchantList.findIndex(x => x.id === id)
              if (idx >= 0) this.merchantList.splice(idx, 1)
            })
            uni.showToast({ title: '已删除', icon: 'success' })
          }
        })
      },
      merchantBatchAudit() {
        const checked = this.merchantList.filter(m => m._checked)
        if (!checked.length) {
          uni.showToast({ title: '请先勾选要审核的商家', icon: 'none' })
          return
        }
        this.openAuditModal('merchant', checked[0])
      },
      merchantBatchFreeze(freeze) {
        const ids = this.merchantCheckedIds()
        if (!ids.length) {
          uni.showToast({ title: freeze ? '请先勾选要冻结的商家' : '请先勾选要解冻的商家', icon: 'none' })
          return
        }
        let ok = 0
        ids.forEach(id => {
          const m = this.merchantList.find(x => x.id === id)
          if (!m) return
          if (freeze) {
            if (m.openKey === 'frozen') return
            this.$set(m, 'openStatus', '已冻结')
            this.$set(m, 'openKey', 'frozen')
            ok++
          } else {
            if (m.openKey === 'open') return
            this.$set(m, 'openStatus', '营业中')
            this.$set(m, 'openKey', 'open')
            ok++
          }
        })
        uni.showToast({ title: freeze ? ('已冻结 ' + ok + ' 家') : ('已解冻 ' + ok + ' 家'), icon: 'none' })
      },
      // ===== 订单：筛选与工具方法 =====
      orderUnitPrice(o) {
        if (o.unitPrice != null) return Number(o.unitPrice) || 0
        const qty = Number(o.prodQty) || 1
        return Math.round(((Number(o.orderAmount) || 0) / qty) * 100) / 100
      },
      orderTotalPrice(o) {
        if (o.totalPrice != null) return Number(o.totalPrice) || 0
        return Math.round(this.orderUnitPrice(o) * (Number(o.prodQty) || 1) * 100) / 100
      },
      orderRefundText(o) {
        if (o.refund) return o.refund
        if (o.statusKey === 'refunding') return '退款中'
        if (o.statusKey === 'refunded') return '已退款'
        if (o.payStatusKey === 'part') return '部分退款'
        return '—'
      },
      orderRowOpLabel(o) {
        if (o.statusKey === 'await' || (o.status || '').indexOf('待发货') >= 0) return '发货'
        return '查看'
      },
      orderBatchOp(action) {
        const list = this.orderList.filter(o => o._checked)
        if (!list.length && action !== 'export') {
          uni.showToast({ title: '请先勾选订单', icon: 'none' })
          return
        }
        if (action === 'view') {
          if (list.length !== 1) { uni.showToast({ title: '请勾选1条查看', icon: 'none' }); return }
          this.orderRowOp('detail', list[0])
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
      },
      applyOrderSearch() {
        const f = this.orderFilterForm
        this.orderAppliedFilter = {
          group: this.normFilterVal(this.filterOrderGroup[f.groupIdx]),
          prod: this.normFilterVal(this.filterOrderProdNames[f.prodIdx]),
          paramMin: f.paramMin || '',
          paramMax: f.paramMax || '',
          activity: this.normFilterVal(this.filterOrderActivity[f.actIdx]),
          payMin: f.payMin || '',
          payMax: f.payMax || '',
          merchant: this.normFilterVal(this.filterMerchant[f.merchantIdx]),
          store: this.normFilterVal(this.filterOrderStore[f.storeIdx]),
          status: this.normFilterVal(this.filterOrderStatus[f.statusIdx]?.label),
          time: this.normFilterVal(this.filterOrderTime[f.timeIdx])
        }
        this.orderPage = 1
      },
      orderResetFilter() {
        this.orderFilterForm = { groupIdx:0, prodIdx:0, paramMin:'', paramMax:'', actIdx:0, payMin:'', payMax:'', merchantIdx:0, storeIdx:0, statusIdx:0, timeIdx:0 }
        this.orderAppliedFilter = { group:'', prod:'', paramMin:'', paramMax:'', activity:'', payMin:'', payMax:'', merchant:'', store:'', status:'', time:'' }
        this.orderPage = 1
      },
      orderPrevPage() {
        if (this.orderPage > 1) this.orderPage--
      },
      orderNextPage() {
        if (this.orderPage < this.orderMaxPage) this.orderPage++
      },
      orderToggleCheckAll(e) {
        const checked = e.detail.value && e.detail.value.length > 0
        this.displayOrderList.forEach(o => { this.$set(o, '_checked', checked) })
        this.orderCheckAll = checked
      },
      orderToggleRow(o) {
        this.$set(o, '_checked', !o._checked)
        this.orderCheckAll = this.displayOrderList.length > 0 && this.displayOrderList.every(x => x._checked)
      },
      orderRowOp(op, o) {
        const name = o.id
        if (op === 'detail') {
          uni.showModal({
            title: '订单详情',
            content: '商品：' + o.prodName + '\n金额：¥' + this.fmtPrice(o.orderAmount) + '\n状态：' + o.status,
            showCancel: false
          })
        } else if (op === 'edit') {
          uni.showToast({ title: '编辑订单：' + name, icon: 'none' })
        } else if (op === 'ship') {
          if (o.statusKey === 'await') {
            this.$set(o, 'status', '已发货')
            this.$set(o, 'statusKey', 'shipped')
            this.$set(o, 'deliveryStatus', '运输中')
            this.$set(o, 'deliveryStatusKey', 'shipping')
            uni.showToast({ title: '已发货', icon: 'success' })
          } else {
            uni.showToast({ title: '当前状态不可发货', icon: 'none' })
          }
        } else if (op === 'print') {
          uni.showToast({ title: '正在打印…', icon: 'none' })
        } else if (op === 'delete') {
          uni.showModal({
            title: '确认删除',
            content: '确定删除订单「' + name + '」吗？',
            success: (res) => {
              if (res.confirm) {
                const idx = this.orderList.findIndex(x => x.id === o.id)
                if (idx >= 0) this.orderList.splice(idx, 1)
                uni.showToast({ title: '已删除', icon: 'success' })
              }
            }
          })
        }
      }
    }
  }
</script>

<style lang="scss">
  @import '../uni.scss';

  .admin-page {
    display: flex;
    width: 100%;
    height: 100vh;
    min-height: 1200rpx;
    background: $purple-bg;
  }

  /* 侧边栏 */
  .sidebar {
    width: $sidebar-width;
    background: #FFFFFF;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    transition: width 0.28s ease;
    overflow: hidden;
    box-shadow: none;
    border-right: 1px solid $purple-border;
    border-radius: 0;

    &.collapsed {
      width: $sidebar-collapsed-width;
    }
  }

  .sidebar-header {
    height: 120rpx;
    min-height: 120rpx;
    display: flex;
    align-items: center;
    padding: 0 24rpx 0 36rpx;
    gap: 20rpx;
    background: $primary-color;
    color: #fff;
    transition: padding 0.28s ease;
    flex-shrink: 0;
  }

  .sidebar.collapsed .sidebar-header {
    padding: 20rpx 0;
    justify-content: center;
    flex-direction: column;
    gap: 12rpx;
    height: auto;
    min-height: 140rpx;
  }

  .sidebar-collapse-btn {
    margin-left: auto;
    width: 56rpx;
    height: 56rpx;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.15);
    flex-shrink: 0;
  }

  .sidebar.collapsed .sidebar-collapse-btn {
    margin-left: 0;
  }

  .collapse-icon {
    font-size: 36rpx;
    font-weight: 700;
    line-height: 1;
    color: #fff;
    display: inline-block;
    transition: transform 0.28s ease;

    &.flipped {
      transform: rotate(180deg);
    }
  }

  .sidebar-logo {
    width: 60rpx;
    height: 60rpx;
    border-radius: 16rpx;
    background: rgba(255, 255, 255, 0.92);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
  }

  .sidebar-title {
    font-size: 30rpx;
    font-weight: 700;
    letter-spacing: 1rpx;
    white-space: nowrap;
  }

  .menu-list {
    flex: 1;
    padding: 24rpx 20rpx;
    height: 0;
  }

  .menu-item {
    display: flex;
    align-items: center;
    padding: 0 28rpx;
    height: 88rpx;
    position: relative;
    transition: all 0.2s ease;
    border-radius: 16rpx;
    margin-bottom: 8rpx;

    &.active {
      background: $primary-color;
      box-shadow: none;
    }

    &.active::before {
      display: none;
    }
  }

  .sidebar.collapsed .menu-item {
    padding: 0;
    justify-content: center;
  }

  .sidebar.collapsed .menu-item.active::before {
    display: none;
  }

  /* 收起时 hover 显示菜单名 tooltip（H5） */
  .sidebar.collapsed .menu-item::after {
    content: attr(title);
    position: absolute;
    left: calc(100% + 12rpx);
    top: 50%;
    transform: translateY(-50%);
    background: #333;
    color: #fff;
    font-size: 22rpx;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    z-index: 99;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
  }

  .sidebar.collapsed .menu-item:hover::after {
    opacity: 1;
  }

  .sidebar.collapsed .menu-label {
    display: none;
  }

  .menu-icon {
    width: 56rpx;
    height: 56rpx;
    min-width: 56rpx;
    min-height: 56rpx;
    border-radius: 16rpx;
    background: $purple-surface;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    margin-right: 24rpx;
    transition: all 0.2s ease;
    box-shadow: none;
    color: $primary-color;

    &.active {
      background: rgba(255, 255, 255, 0.2);
      box-shadow: none;
      color: #fff;
    }

    /deep/ svg,
    ::v-deep svg {
      width: 32rpx;
      height: 32rpx;
      display: block;
    }

    /deep/ .mi-soft,
    ::v-deep .mi-soft {
      fill: currentColor;
      opacity: 0.16;
      stroke: none;
    }

    /deep/ .mi-line,
    ::v-deep .mi-line {
      fill: none;
      stroke: currentColor;
      stroke-width: 1.7;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  }

  .sidebar.collapsed .menu-icon {
    margin-right: 0;
  }

  .menu-label {
    font-size: 26rpx;
    color: #555;
    flex: 1;

    .menu-item.active & {
      color: #fff;
      font-weight: 600;
    }
  }

  /* 收起按钮 */
  .sidebar-toggle {
    height: 80rpx;
    min-height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $purple-surface;
    transition: all 0.2s ease;
    cursor: pointer;
    border-radius: 16rpx;
    margin: 16rpx 20rpx 24rpx;
  }

  .sidebar.collapsed .sidebar-toggle {
    padding: 0;
  }

  .toggle-arrow {
    font-size: 32rpx;
    font-weight: 700;
    display: inline-block;
    transition: transform 0.28s ease;
    line-height: 1;
    color: #888;

    &.flipped {
      transform: rotate(180deg);
    }
  }

  /* 与 header 按钮共用 collapse-icon，此处保留 toggle-arrow 兼容底部按钮 */

  .toggle-text {
    font-size: 24rpx;
    color: #888;
    margin-left: 12rpx;
  }

  /* 主区域 */
  .main-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: transparent;
  }

  .top-bar {
    height: 112rpx;
    min-height: 112rpx;
    background: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 48rpx;
    box-shadow: none;
    border-bottom: 1px solid $purple-border;
    border-radius: 0;
    margin: 0;
  }

  .top-bar-left {
    display: flex;
    align-items: center;
    gap: 24rpx;
    min-width: 0;
    flex: 1;
  }

  .top-bar-right {
    display: flex;
    align-items: center;
    gap: 24rpx;
    flex-shrink: 0;
  }

  .settings-btn {
    display: flex;
    align-items: center;
    gap: 10rpx;
    height: 64rpx;
    padding: 0 22rpx;
    border-radius: 16rpx;
    background: $purple-surface;
    border: 1px solid transparent;
  }

  .settings-btn:active,
  .settings-btn.active {
    background: #F0EBFF;
    border-color: #D8D0F0;
  }

  .settings-btn-icon {
    font-size: 30rpx;
    color: $primary-color;
    line-height: 1;
  }

  .settings-btn-text {
    font-size: 26rpx;
    color: #5B4B8A;
    font-weight: 600;
  }

  .settings-container {
    min-height: 640rpx;
  }

  .top-collapse-btn {
    width: 64rpx;
    height: 64rpx;
    border-radius: 16rpx;
    background: $purple-surface;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: none;

    .collapse-icon {
      color: $primary-color;
      font-size: 40rpx;
    }
  }

  .page-path {
    display: flex;
    align-items: center;
    gap: 16rpx;
    font-size: 26rpx;
    color: #666;
  }

  .home-icon { font-size: 30rpx; }

  .sep { color: #CCC; }

  .current {
    color: #000;
    font-weight: 600;
    font-size: 28rpx;
  }

  .admin-user {
    display: flex;
    align-items: center;
    gap: 20rpx;
  }

  .admin-avatar {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, $primary-color, $primary-light);
    overflow: hidden;
    flex-shrink: 0;
  }

  .admin-avatar image {
    width: 100%;
    height: 100%;
    display: block;
  }

  .admin-name {
    font-size: 26rpx;
    color: #333;
    font-weight: 500;
  }

  /* 内容 */
  .content-wrap {
    flex: 1;
    padding: 40rpx;
    height: 0;
  }

  /* ===== 通用空面板（其他模块） ===== */
  .content-card {
    background: #fff;
    border-radius: 24rpx;
    box-shadow: 0 2rpx 8rpx rgba(45, 42, 58, 0.06);
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }

  .card-header {
    padding: 32rpx 40rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border-bottom: 1px solid $purple-border;
    border-radius: 24rpx 24rpx 0 0;
  }

  .card-title-row {
    display: flex;
    align-items: center;
    gap: 20rpx;
  }

  .card-title-icon {
    width: 64rpx;
    height: 64rpx;
    border-radius: 16rpx;
    background: $primary-color;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36rpx;
    box-shadow: none;
  }

  .card-title {
    font-size: 34rpx;
    font-weight: 700;
    color: #000;
  }

  .card-body {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80rpx 40rpx;
  }

  .empty-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 32rpx;
    padding: 120rpx 40rpx;
  }

  .empty-icon {
    font-size: 144rpx;
    line-height: 1;
    opacity: 0.85;
  }

  .empty-text {
    font-size: 32rpx;
    color: #888;
    font-weight: 500;
  }

  .empty-tip {
    font-size: 24rpx;
    color: #BBB;
    margin-top: -12rpx;
  }

  /* ===== 公共：商品/商家容器 ===== */
  .product-container,
  .merchant-container,
  .decor-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }

  /* 筛选区域 */
  .filter-bar {
    background: #F7F7F9;
    border-radius: 24rpx;
    padding: 28rpx 36rpx 12rpx;
    box-shadow: none;
    border: 1px solid $purple-border;
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
    height: 72rpx;
    line-height: 72rpx;
    padding: 0 28rpx;
    border: 1px solid #E5E1F0;
    border-radius: 16rpx;
    background: #fff;
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
    height: 72rpx;
    line-height: 72rpx;
    padding: 0 32rpx;
    border-radius: 16rpx;
    border: 1px solid #E5E1F0;
    font-size: 24rpx;
    display: inline-flex;
    align-items: center;
    gap: 8rpx;
    background: #fff;
    color: #555;
    white-space: nowrap;
  }

  .btn-primary {
    background: $primary-color;
    color: #fff;
    border-color: $primary-color;
    box-shadow: none;
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
    box-shadow: none;
    border: 1px solid $purple-border;
  }

  .action-left, .action-right {
    display: flex;
    align-items: center;
    gap: 8rpx;
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
    box-shadow: none;
    border: 1px solid $purple-border;
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

  .list-table.merchant-table {
    min-width: 8600rpx;
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

  /* ========== 商品表格列宽 ========== */
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

  /* ========== 商家表格列宽 ========== */
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

  /* 商家类型 tag 颜色 */
  .cat-tag.type-flagship  { background:#FEF3C7; color:#92400E; }
  .cat-tag.type-franchise { background:#DBEAFE; color:#1E40AF; }
  .cat-tag.type-exclusive { background:#FCE7F3; color:#9D174D; }
  .cat-tag.type-normal    { background:#E0E7FF; color:#3730A3; }
  .cat-tag.type-personal  { background:#D1FAE5; color:#065F46; }

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

  /* 评分显示 */
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
  .status-tag.shelf-on  { background:#D1FAE5; color:#065F46; }
  .status-tag.shelf-off { background:#F3F4F6; color:#4B5563; }

  .status-tag.open-open    { background:#D1FAE5; color:#065F46; }
  .status-tag.open-rest    { background:#FEF3C7; color:#92400E; }
  .status-tag.open-frozen  { background:#E0E7FF; color:#3730A3; }
  .status-tag.open-closed  { background:#F3F4F6; color:#4B5563; }

  .merchant-info {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .merchant-avatar {
    width: 44rpx;
    height: 44rpx;
    border-radius: 50%;
    background: #f0f0f0;
    flex-shrink: 0;
    overflow: hidden;
  }
  .merchant-avatar image { width: 100%; height: 100%; display: block; border-radius: 50%; }

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

  .btn-shelve-up-active {
    background: #7C5CF0 !important;
    color: #fff !important;
    border-color: #7C5CF0 !important;
    font-weight: 600;
    box-shadow: 0 4rpx 12rpx rgba(124, 92, 240, 0.28);
  }

  .btn-shelve-down-active {
    background: #fff !important;
    color: #E85D4C !important;
    border-color: #F5C4BE !important;
    font-weight: 600;
  }

  .btn-shelve-muted {
    background: #F3F2F7 !important;
    color: #C0BCCB !important;
    border-color: #E8E6EF !important;
    pointer-events: none;
  }

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

  /* ========== 订单：容器 & 表格列宽 & 状态tag ========== */
  .order-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }
  .order-filter-range { display: flex; align-items: center; gap: 8rpx; }
  .order-filter-range .range-input { width: 140rpx; text-align: center; min-width: 140rpx; }
  .order-filter-range .range-sep { color: #999; font-size: 22rpx; }
  .order-action-pager { font-size: 24rpx; color: #666; gap: 12rpx; }
  .order-op-link { color: $primary-color; font-size: 24rpx; }
  .order-price { color: #EF4444; font-weight: 600; font-size: 24rpx; }
  .order-price::before { content: '¥'; font-size: 20rpx; margin-right: 2rpx; }
  .table-scroll-x { width: 100%; white-space: nowrap; }
  .list-table-wrap { display: inline-block; min-width: 5200rpx; }
  .list-table.order-table .list-tr { min-width: 5200rpx; }

  .col-o-op      { width: 100rpx; min-width: 100rpx; }
  .col-o-refund  { width: 120rpx; }
  .col-o-cover   { width: 100rpx; }
  .col-o-id      { width: 320rpx; }
  .col-o-name    { width: 400rpx; }
  .col-o-spec    { width: 140rpx; }
  .col-o-brand   { width: 180rpx; }
  .col-o-cat1, .col-o-cat2, .col-o-cat3 { width: 140rpx; }
  .col-o-unit, .col-o-total, .col-o-discount, .col-o-payamt { width: 160rpx; justify-content: flex-end; }
  .col-o-qty     { width: 100rpx; justify-content: center; }
  .col-o-act     { width: 140rpx; }
  .col-o-user    { width: 280rpx; }
  .col-o-phone   { width: 200rpx; }
  .col-o-addr    { width: 480rpx; min-width: 400rpx; white-space: normal; line-height: 1.4; }
  .col-o-st      { width: 140rpx; }
  .col-o-addr    { width: 680rpx; min-width: 680rpx; white-space: normal; line-height: 1.4; }
  .col-o-receiv  { width: 160rpx; }
  .col-o-remark  { width: 420rpx; min-width: 420rpx; white-space: normal; line-height: 1.4; }

  /* 支付方式 tag 五色 */
  .pay-method-wechat  { background:#DCFCE7; color:#047857; }
  .pay-method-alipay  { background:#DBEAFE; color:#1E40AF; }
  .pay-method-card    { background:#E0E7FF; color:#3730A3; }
  .pay-method-balance { background:#FEF3C7; color:#92400E; }
  .pay-method-cod     { background:#F3F4F6; color:#4B5563; }

  /* 支付状态 4色 */
  .status-tag.pay-paid    { background:#D1FAE5; color:#065F46; }
  .status-tag.pay-unpaid  { background:#FEE2E2; color:#991B1B; }
  .status-tag.pay-refund  { background:#FEF3C7; color:#92400E; }
  .status-tag.pay-part    { background:#FCE7F3; color:#9D174D; }

  /* 物流状态 6色 */
  .status-tag.deliver-await      { background:#F3F4F6; color:#4B5563; }
  .status-tag.deliver-picked     { background:#E0E7FF; color:#3730A3; }
  .status-tag.deliver-shipping   { background:#DBEAFE; color:#1E40AF; }
  .status-tag.deliver-delivering { background:#FEF3C7; color:#92400E; }
  .status-tag.deliver-signed     { background:#D1FAE5; color:#065F46; }
  .status-tag.deliver-waitpick   { background:#FCE7F3; color:#9D174D; }
  .status-tag.deliver-refund     { background:#E5E7EB; color:#6B7280; }
  .status-tag.deliver-done       { background:#D1FAE5; color:#065F46; }

  /* 订单状态 7色 */
  .status-tag.order-pending   { background:#FEF3C7; color:#92400E; }
  .status-tag.order-await     { background:#FCE7F3; color:#9D174D; }
  .status-tag.order-shipped   { background:#DBEAFE; color:#1E40AF; }
  .status-tag.order-done      { background:#D1FAE5; color:#065F46; }
  .status-tag.order-cancel    { background:#F3F4F6; color:#4B5563; }
  .status-tag.order-refunding { background:#FEE2E2; color:#991B1B; }
  .status-tag.order-refunded  { background:#E5E7EB; color:#6B7280; }

  /* 审核弹窗 */
  .audit-mask {
    position: fixed; left: 0; top: 0; right: 0; bottom: 0;
    background: rgba(20, 16, 40, 0.45); z-index: 1200;
    display: flex; align-items: center; justify-content: center;
  }
  .audit-box {
    width: 680rpx; max-height: 86vh; background: #fff; border-radius: 20rpx;
    display: flex; flex-direction: column; overflow: hidden;
  }
  .audit-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 28rpx 32rpx; border-bottom: 1px solid #F0ECF8;
  }
  .audit-title { font-size: 30rpx; font-weight: 600; color: #111; }
  .audit-close { font-size: 40rpx; color: #999; line-height: 1; padding: 0 8rpx; }
  .audit-body { padding: 24rpx 32rpx; overflow-y: auto; flex: 1; }
  .audit-footer {
    display: flex; justify-content: flex-end; gap: 16rpx;
    padding: 20rpx 32rpx; border-top: 1px solid #F0ECF8;
  }
  .audit-info {
    padding: 20rpx 24rpx; background: #FAFAFC; border: 1px solid #EEEAF5;
    border-radius: 12rpx; margin-bottom: 24rpx;
    display: flex; flex-direction: column; gap: 8rpx;
  }
  .audit-info-type { font-size: 22rpx; color: #999; }
  .audit-info-name { font-size: 28rpx; font-weight: 600; color: #222; }
  .audit-info-meta { font-size: 22rpx; color: #6B5CAD; }
  .audit-info-extra { font-size: 22rpx; color: #888; line-height: 1.5; }
  .audit-field { margin-bottom: 24rpx; }
  .audit-label { font-size: 24rpx; color: #666; display: block; margin-bottom: 12rpx; }
  .audit-radios { display: flex; flex-wrap: wrap; gap: 12rpx; }
  .audit-radio {
    padding: 12rpx 22rpx; border-radius: 999rpx; border: 1px solid #E8E4F4;
    background: #fff; font-size: 24rpx; color: #555;
  }
  .audit-radio.active {
    background: #F0EBFF; border-color: #C4B5FD; color: #6B5CAD; font-weight: 600;
  }
  .audit-textarea {
    width: 100%; min-height: 140rpx; padding: 16rpx; box-sizing: border-box;
    border: 1px solid #E8E4F4; border-radius: 12rpx; font-size: 24rpx; color: #333;
  }
</style>
