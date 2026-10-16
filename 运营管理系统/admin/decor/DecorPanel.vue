<template>
  <view class="decor-panel">
    <view class="decor-page-header">
      <text class="decor-page-title">店铺装修</text>
      <text class="decor-page-sub">运营管理 · 工作台</text>
    </view>

    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-item"
        :class="{ active: currentTab === tab.id }"
        @click="currentTab = tab.id"
      >
        <text>{{ tab.name }}</text>
      </view>
    </view>

    <!-- 幻灯片管理 -->
    <view v-if="currentTab === 'slide'" class="tab-body">
      <view class="filter-bar">
        <view class="filter-row">
          <view class="filter-item">
            <text class="filter-label">广告名称</text>
            <input class="filter-input" v-model="filterForm.name" placeholder="请输入广告名称" />
          </view>
          <view class="filter-item">
            <text class="filter-label">投放状态</text>
            <picker :range="statusOptions" @change="e => filterForm.status = statusOptions[e.detail.value]">
              <view class="filter-input filter-picker">
                <text :class="{ placeholder: !filterForm.status || filterForm.status === '全部' }">
                  {{ filterForm.status || '请选择' }}
                </text>
              </view>
            </picker>
          </view>
          <view class="filter-item">
            <text class="filter-label">起止时间</text>
            <view class="date-range">
              <picker mode="date" @change="e => filterForm.dateStart = e.detail.value">
                <view class="filter-input filter-date">{{ filterForm.dateStart || '开始日期' }}</view>
              </picker>
              <text class="range-sep">—</text>
              <picker mode="date" @change="e => filterForm.dateEnd = e.detail.value">
                <view class="filter-input filter-date">{{ filterForm.dateEnd || '结束日期' }}</view>
              </picker>
            </view>
          </view>
          <view class="filter-actions">
            <view class="btn btn-primary" @click="applySearch"><text>查询</text></view>
            <view class="btn btn-default" @click="resetFilter"><text>重置</text></view>
          </view>
        </view>
        <view v-if="filterExpanded" class="filter-row filter-row-extra">
          <view class="filter-item">
            <text class="filter-label">广告位置</text>
            <picker :range="positionOptions" @change="e => filterForm.position = positionOptions[e.detail.value]">
              <view class="filter-input filter-picker">
                <text :class="{ placeholder: !filterForm.position || filterForm.position === '全部' }">
                  {{ filterForm.position || '请选择' }}
                </text>
              </view>
            </picker>
          </view>
        </view>
        <view class="filter-more" @click="filterExpanded = !filterExpanded">
          <text>{{ filterExpanded ? '收起筛选' : '查看更多' }}</text>
          <text class="more-arrow" :class="{ up: filterExpanded }">▾</text>
        </view>
      </view>

      <view class="action-bar">
        <view class="action-left">
          <view class="btn btn-primary" @click="onAdd"><text>添加广告</text></view>
          <view class="btn btn-default" @click="onBatchEdit"><text>编辑</text></view>
          <view class="btn btn-default" @click="onBatchDelete"><text>删除</text></view>
        </view>
        <view class="action-right">
          <text class="total-hint">共 {{ filteredAdList.length }} 条</text>
        </view>
      </view>

      <view class="list-wrap">
        <scroll-view scroll-x class="list-scroll">
          <view class="list-table decor-table">
            <view class="list-tr list-th">
              <view class="list-td col-check">
                <checkbox :checked="isAllChecked" @change="toggleCheckAll" color="#8B7CF6" style="transform:scale(0.85);" />
              </view>
              <view class="list-td col-d-op">操作</view>
              <view class="list-td col-d-id">ID</view>
              <view class="list-td col-d-pos">广告位置</view>
              <view class="list-td col-d-name">广告名称</view>
              <view class="list-td col-d-cover">广告图片</view>
              <view class="list-td col-d-status">广告状态</view>
              <view class="list-td col-d-link">广告链接</view>
            </view>
            <view class="list-tr list-tbody" v-for="ad in displayAdList" :key="ad.id">
              <view class="list-td col-check">
                <checkbox :checked="!!ad._checked" @change="toggleRow(ad)" color="#8B7CF6" style="transform:scale(0.85);" />
              </view>
              <view class="list-td col-d-op">
                <view class="row-ops">
                  <text class="op-link" @click="onEdit(ad)">编辑</text>
                  <text class="op-sep">|</text>
                  <text class="op-link danger" @click="onDelete(ad)">删除</text>
                </view>
              </view>
              <view class="list-td col-d-id"><text class="mono">{{ ad.id }}</text></view>
              <view class="list-td col-d-pos"><text>{{ ad.position }}</text></view>
              <view class="list-td col-d-name"><text class="name-text">{{ ad.name }}</text></view>
              <view class="list-td col-d-cover">
                <view class="cover-thumb"><image :src="getAdCover(ad.id)" mode="aspectFill" /></view>
              </view>
              <view class="list-td col-d-status">
                <text class="ad-status" :class="'ad-' + ad.statusKey">{{ ad.status }}</text>
              </view>
              <view class="list-td col-d-link"><text class="link-text">{{ ad.link }}</text></view>
            </view>
          </view>
        </scroll-view>

        <view class="pagination">
          <text class="total-text">共 <text class="b">{{ filteredAdList.length }}</text> 条 · 第 <text class="b">{{ adPage }}</text> / <text class="b">{{ adMaxPage }}</text> 页</text>
          <view class="pager-wrap">
            <picker :range="pageSizeList" @change="onPageSizeChange">
              <view class="page-size-select"><text>{{ pageSize }}</text></view>
            </picker>
            <view class="pager">
              <view class="page-btn" :class="{ disabled: adPage <= 1 }" @click="prevPage"><text>上一页</text></view>
              <view class="page-btn" :class="{ disabled: adPage >= adMaxPage }" @click="nextPage"><text>下一页</text></view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 自定义页面 -->
    <view v-else-if="currentTab === 'page'" class="tab-body">
      <view class="filter-bar">
        <view class="filter-row">
          <view class="filter-item">
            <text class="filter-label">页面名称</text>
            <input class="filter-input" v-model="pageFilter.name" placeholder="请输入页面名称" />
          </view>
          <view class="filter-item">
            <text class="filter-label">页面类型</text>
            <picker :range="pageTypeOptions" @change="e => pageFilter.type = pageTypeOptions[e.detail.value]">
              <view class="filter-input filter-picker">
                <text :class="{ placeholder: !pageFilter.type || pageFilter.type === '全部' }">{{ pageFilter.type || '请选择' }}</text>
              </view>
            </picker>
          </view>
          <view class="filter-item">
            <text class="filter-label">发布状态</text>
            <picker :range="pageStatusOptions" @change="e => pageFilter.status = pageStatusOptions[e.detail.value]">
              <view class="filter-input filter-picker">
                <text :class="{ placeholder: !pageFilter.status || pageFilter.status === '全部' }">{{ pageFilter.status || '请选择' }}</text>
              </view>
            </picker>
          </view>
          <view class="filter-actions">
            <view class="btn btn-primary" @click="applyPageSearch"><text>查询</text></view>
            <view class="btn btn-default" @click="resetPageFilter"><text>重置</text></view>
          </view>
        </view>
      </view>
      <view class="action-bar">
        <view class="action-left">
          <view class="btn btn-primary" @click="onPageAdd"><text>新建页面</text></view>
          <view class="btn btn-gen" @click="onPageGen"><text class="gen-spark">✦</text><text>AI 自动生成</text></view>
          <view class="btn btn-default" @click="onPageBatchEdit"><text>编辑</text></view>
          <view class="btn btn-default" @click="onPageBatchDelete"><text>删除</text></view>
        </view>
        <view class="action-right"><text class="total-hint">共 {{ filteredPageList.length }} 条</text></view>
      </view>
      <view class="list-wrap">
        <scroll-view scroll-x class="list-scroll">
          <view class="list-table decor-table page-table">
            <view class="list-tr list-th">
              <view class="list-td col-check"><checkbox :checked="isAllPageChecked" @change="togglePageCheckAll" color="#8B7CF6" style="transform:scale(0.85);" /></view>
              <view class="list-td col-p-op">操作</view>
              <view class="list-td col-p-id">ID</view>
              <view class="list-td col-p-name">页面名称</view>
              <view class="list-td col-p-type">页面类型</view>
              <view class="list-td col-p-cover">封面预览</view>
              <view class="list-td col-p-path">页面路径</view>
              <view class="list-td col-p-status">发布状态</view>
              <view class="list-td col-p-time">更新时间</view>
            </view>
            <view
              class="list-tr list-tbody"
              v-for="pg in displayPageList"
              :key="pg.id"
              :id="'page-row-' + pg.id"
              :class="{ 'row-highlight': pageHighlightId === pg.id }"
            >
              <view class="list-td col-check"><checkbox :checked="!!pg._checked" @change="togglePageRow(pg)" color="#8B7CF6" style="transform:scale(0.85);" /></view>
              <view class="list-td col-p-op">
                <view class="row-ops">
                  <text class="op-link" @click="onPagePreview(pg)">预览</text>
                  <text class="op-sep">|</text>
                  <text class="op-link" @click="onPageEdit(pg)">编辑</text>
                  <text class="op-sep">|</text>
                  <text class="op-link danger" @click="onPageDelete(pg)">删除</text>
                </view>
              </view>
              <view class="list-td col-p-id"><text class="mono">{{ pg.id }}</text></view>
              <view class="list-td col-p-name"><text class="name-text">{{ pg.name }}</text></view>
              <view class="list-td col-p-type"><text class="type-tag">{{ pg.type }}</text></view>
              <view class="list-td col-p-cover"><view class="cover-thumb"><image :src="getPageCover(pg.id)" mode="aspectFill" /></view></view>
              <view class="list-td col-p-path"><text class="link-text">{{ pg.path }}</text></view>
              <view class="list-td col-p-status"><text class="ad-status" :class="'pg-' + pg.statusKey">{{ pg.status }}</text></view>
              <view class="list-td col-p-time"><text class="time-text">{{ pg.updateTime }}</text></view>
            </view>
          </view>
        </scroll-view>
        <view class="pagination">
          <text class="total-text">共 <text class="b">{{ filteredPageList.length }}</text> 条 · 第 <text class="b">{{ pagePageNum }}</text> / <text class="b">{{ pageMaxPage }}</text> 页</text>
          <view class="pager-wrap">
            <picker :range="pageSizeList" @change="onPagePageSizeChange">
              <view class="page-size-select"><text>{{ pageSize }}</text></view>
            </picker>
            <view class="pager">
              <view class="page-btn" :class="{ disabled: pagePageNum <= 1 }" @click="pagePrev"><text>上一页</text></view>
              <view class="page-btn" :class="{ disabled: pagePageNum >= pageMaxPage }" @click="pageNext"><text>下一页</text></view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 功能入口 -->
    <view v-else-if="currentTab === 'entry'" class="tab-body entry-tab-body">
      <view class="entry-layout">
        <view class="entry-subnav">
          <view
            v-for="sub in entrySubMenus"
            :key="sub.id"
            class="entry-sub-item"
            :class="{ active: entryScope === sub.id }"
            @click="switchEntryScope(sub.id)"
          >
            <text>{{ sub.name }}</text>
          </view>
        </view>
        <view class="entry-main">
          <view class="filter-bar">
            <view class="filter-row">
              <view class="filter-item">
                <text class="filter-label">入口名称</text>
                <input class="filter-input" v-model="entryFilter.name" placeholder="请输入入口名称" />
              </view>
              <view class="filter-item">
                <text class="filter-label">展示位置</text>
                <picker :range="currentEntryPosOptions" @change="e => entryFilter.position = currentEntryPosOptions[e.detail.value]">
                  <view class="filter-input filter-picker">
                    <text :class="{ placeholder: !entryFilter.position || entryFilter.position === '全部' }">{{ entryFilter.position || '请选择' }}</text>
                  </view>
                </picker>
              </view>
              <view class="filter-item">
                <text class="filter-label">显示状态</text>
                <picker :range="entryShowOptions" @change="e => entryFilter.visible = entryShowOptions[e.detail.value]">
                  <view class="filter-input filter-picker">
                    <text :class="{ placeholder: !entryFilter.visible || entryFilter.visible === '全部' }">{{ entryFilter.visible || '请选择' }}</text>
                  </view>
                </picker>
              </view>
              <view class="filter-actions">
                <view class="btn btn-primary" @click="applyEntrySearch"><text>查询</text></view>
                <view class="btn btn-default" @click="resetEntryFilter"><text>重置</text></view>
              </view>
            </view>
          </view>
          <view class="action-bar">
            <view class="action-left">
              <view class="btn btn-primary" @click="onEntryAdd"><text>添加入口</text></view>
              <view class="btn btn-default" @click="onEntryBatchEdit"><text>编辑</text></view>
              <view class="btn btn-default" @click="onEntrySort"><text>调整排序</text></view>
              <view class="btn btn-default" @click="onEntryBatchDelete"><text>删除</text></view>
            </view>
            <view class="action-right"><text class="total-hint">共 {{ filteredEntryList.length }} 条</text></view>
          </view>
          <view class="list-wrap">
            <scroll-view scroll-x class="list-scroll">
              <view class="list-table decor-table entry-table">
                <view class="list-tr list-th">
                  <view class="list-td col-check"><checkbox :checked="isAllEntryChecked" @change="toggleEntryCheckAll" color="#8B7CF6" style="transform:scale(0.85);" /></view>
                  <view class="list-td col-e-op">操作</view>
                  <view class="list-td col-e-id">ID</view>
                  <view class="list-td col-e-name">入口名称</view>
                  <view class="list-td col-e-icon">入口图标</view>
                  <view class="list-td col-e-pos">展示位置</view>
                  <view class="list-td col-e-path">跳转路径</view>
                  <view class="list-td col-e-sort">排序</view>
                  <view class="list-td col-e-status">显示状态</view>
                </view>
                <view class="list-tr list-tbody" v-for="en in displayEntryList" :key="en.id">
                  <view class="list-td col-check"><checkbox :checked="!!en._checked" @change="toggleEntryRow(en)" color="#8B7CF6" style="transform:scale(0.85);" /></view>
                  <view class="list-td col-e-op">
                    <view class="row-ops">
                      <text class="op-link" @click="onEntryEdit(en)">编辑</text>
                      <text class="op-sep">|</text>
                      <text class="op-link" :class="{ disabled: !canEntryMoveUp(en) }" @click="onEntryMove(en, 'up')">上移</text>
                      <text class="op-sep">|</text>
                      <text class="op-link" :class="{ disabled: !canEntryMoveDown(en) }" @click="onEntryMove(en, 'down')">下移</text>
                      <text class="op-sep">|</text>
                      <text class="op-link" @click="onEntryToggle(en)">{{ en.visible ? '隐藏' : '显示' }}</text>
                      <text class="op-sep">|</text>
                      <text class="op-link danger" @click="onEntryDelete(en)">删除</text>
                    </view>
                  </view>
                  <view class="list-td col-e-id"><text class="mono">{{ en.id }}</text></view>
                  <view class="list-td col-e-name"><text class="name-text">{{ en.name }}</text></view>
                  <view class="list-td col-e-icon">
                    <view class="entry-icon-wrap"><image :src="getEntryIcon(en)" mode="aspectFit" /></view>
                  </view>
                  <view class="list-td col-e-pos"><text>{{ en.position }}</text></view>
                  <view class="list-td col-e-path"><text class="link-text">{{ entryPathDisplay(en) }}</text></view>
                  <view class="list-td col-e-sort"><text class="sort-num">{{ en.sort }}</text></view>
                  <view class="list-td col-e-status">
                    <text class="ad-status" :class="en.visible ? 'en-show' : 'en-hide'">{{ en.visible ? '显示' : '隐藏' }}</text>
                  </view>
                </view>
              </view>
            </scroll-view>
            <view class="pagination">
              <text class="total-text">共 <text class="b">{{ filteredEntryList.length }}</text> 条 · 第 <text class="b">{{ entryPageNum }}</text> / <text class="b">{{ entryMaxPage }}</text> 页</text>
              <view class="pager-wrap">
                <picker :range="pageSizeList" @change="onEntryPageSizeChange">
                  <view class="page-size-select"><text>{{ pageSize }}</text></view>
                </picker>
                <view class="pager">
                  <view class="page-btn" :class="{ disabled: entryPageNum <= 1 }" @click="entryPrev"><text>上一页</text></view>
                  <view class="page-btn" :class="{ disabled: entryPageNum >= entryMaxPage }" @click="entryNext"><text>下一页</text></view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 幻灯片 · 添加/编辑广告弹窗 -->
    <view v-if="adFormVisible" class="entry-modal-mask" @click="closeAdForm">
      <view class="entry-modal-box" @click.stop>
        <view class="entry-modal-header">
          <text class="entry-modal-title">{{ adFormMode === 'edit' ? '编辑广告' : '添加广告' }}</text>
          <text class="entry-modal-close" @click="closeAdForm">×</text>
        </view>
        <view class="entry-modal-body">
          <view class="modal-form">
            <view class="modal-form-row">
              <text class="modal-form-label">ID</text>
              <view class="modal-form-field"><input class="modal-form-input readonly" v-model="adForm.id" disabled /></view>
            </view>
            <view class="modal-form-row">
              <text class="modal-form-label">广告名称</text>
              <view class="modal-form-field"><input class="modal-form-input" v-model="adForm.name" placeholder="请输入广告名称" /></view>
            </view>
            <view class="modal-form-row">
              <text class="modal-form-label">广告位置</text>
              <view class="modal-form-field">
                <picker :range="adFormPosOptions" @change="e => adForm.position = adFormPosOptions[e.detail.value]">
                  <view class="modal-form-input modal-form-picker"><text>{{ adForm.position || '请选择' }}</text></view>
                </picker>
              </view>
            </view>
            <view class="modal-form-row">
              <text class="modal-form-label">广告状态</text>
              <view class="modal-form-field">
                <picker :range="adFormStatusOptions" @change="e => adForm.status = adFormStatusOptions[e.detail.value]">
                  <view class="modal-form-input modal-form-picker"><text>{{ adForm.status || '请选择' }}</text></view>
                </picker>
              </view>
            </view>
            <view class="modal-form-row">
              <text class="modal-form-label">广告链接</text>
              <view class="modal-form-field"><input class="modal-form-input" v-model="adForm.link" placeholder="请输入广告链接" /></view>
            </view>
            <view class="modal-form-row">
              <text class="modal-form-label">开始日期</text>
              <view class="modal-form-field">
                <picker mode="date" :value="adForm.startTime" @change="e => adForm.startTime = e.detail.value">
                  <view class="modal-form-input modal-form-picker"><text>{{ adForm.startTime || '请选择' }}</text></view>
                </picker>
              </view>
            </view>
            <view class="modal-form-row">
              <text class="modal-form-label">结束日期</text>
              <view class="modal-form-field">
                <picker mode="date" :value="adForm.endTime" @change="e => adForm.endTime = e.detail.value">
                  <view class="modal-form-input modal-form-picker"><text>{{ adForm.endTime || '请选择' }}</text></view>
                </picker>
              </view>
            </view>
          </view>
        </view>
        <view class="entry-modal-footer">
          <view class="btn btn-default" @click="closeAdForm"><text>取消</text></view>
          <view class="btn btn-primary" @click="submitAdForm"><text>确定</text></view>
        </view>
      </view>
    </view>

    <!-- 功能入口 添加/编辑弹窗 -->
    <view v-if="entryFormVisible" class="entry-modal-mask" @click="closeEntryForm">
      <view class="entry-modal-box" @click.stop>
        <view class="entry-modal-header">
          <text class="entry-modal-title">{{ entryFormMode === 'edit' ? '编辑功能入口' : '添加入口' }}</text>
          <text class="entry-modal-close" @click="closeEntryForm">×</text>
        </view>
        <view class="entry-modal-body">
          <view class="modal-form">
            <view class="modal-form-row">
              <text class="modal-form-label">ID</text>
              <view class="modal-form-field"><input class="modal-form-input readonly" v-model="entryForm.id" disabled /></view>
            </view>
            <view class="modal-form-row modal-form-row-top">
              <text class="modal-form-label">上传图标</text>
              <view class="modal-form-field">
                <view class="entry-icon-upload">
                  <view class="entry-icon-upload-preview"><image :src="entryFormIconPreview" mode="aspectFit" /></view>
                  <view class="btn btn-default btn-mini" @click="chooseEntryIcon"><text>上传图标</text></view>
                  <text class="entry-icon-upload-tip">支持 PNG / JPG / SVG</text>
                </view>
              </view>
            </view>
            <view class="modal-form-row">
              <text class="modal-form-label">入口名称</text>
              <view class="modal-form-field"><input class="modal-form-input" v-model="entryForm.name" placeholder="请输入入口名称" /></view>
            </view>
            <view class="modal-form-row">
              <text class="modal-form-label">展示位置</text>
              <view class="modal-form-field">
                <view class="modal-form-inline">
                  <picker :range="entryFormPosOptions" @change="e => entryForm.position = entryFormPosOptions[e.detail.value]">
                    <view class="modal-form-input modal-form-picker modal-form-grow"><text>{{ entryForm.position }}</text></view>
                  </picker>
                  <view v-if="entryScope === 'home'" class="btn btn-default btn-mini" @click="onEntryPosPreview"><text>预览</text></view>
                </view>
              </view>
            </view>
            <view class="modal-form-row">
              <text class="modal-form-label">跳转路径</text>
              <view class="modal-form-field">
                <view class="modal-form-inline">
                  <picker :range="entryLinkTypeOptions" @change="onEntryLinkTypeChange">
                    <view class="modal-form-input modal-form-picker modal-form-link-type"><text>{{ entryForm.path || '请选择' }}</text></view>
                  </picker>
                  <picker
                    v-if="entryForm.path === '选择指定商品'"
                    :range="entryProductLinkLabels"
                    @change="onEntryProductLinkChange"
                  >
                    <view class="modal-form-input modal-form-picker modal-form-grow">
                      <text>{{ entryLinkTargetDisplay || '请选择商品链接' }}</text>
                    </view>
                  </picker>
                  <picker
                    v-else-if="entryForm.path === '指定活动'"
                    :range="entryActivityLinkLabels"
                    @change="onEntryActivityLinkChange"
                  >
                    <view class="modal-form-input modal-form-picker modal-form-grow">
                      <text>{{ entryLinkTargetDisplay || '请选择活动链接' }}</text>
                    </view>
                  </picker>
                  <picker
                    v-else-if="entryForm.path === '自定页面'"
                    :range="entryPageLinkLabels"
                    @change="onEntryPageLinkChange"
                  >
                    <view class="modal-form-input modal-form-picker modal-form-grow">
                      <text>{{ entryLinkTargetDisplay || '请选择页面链接' }}</text>
                    </view>
                  </picker>
                  <input
                    v-else-if="entryForm.path === '跳转网址'"
                    class="modal-form-input modal-form-grow"
                    v-model="entryForm.linkUrl"
                    placeholder="请输入链接地址"
                  />
                </view>
              </view>
            </view>
            <view class="modal-form-row">
              <text class="modal-form-label">排序</text>
              <view class="modal-form-field"><input class="modal-form-input" type="number" v-model="entryForm.sort" /></view>
            </view>
            <view class="modal-form-row">
              <text class="modal-form-label">显示状态</text>
              <view class="modal-form-field">
                <picker :range="entryFormVisibleOptions" @change="e => entryForm.visible = entryFormVisibleValues[e.detail.value]">
                  <view class="modal-form-input modal-form-picker"><text>{{ entryForm.visible ? '显示' : '隐藏' }}</text></view>
                </picker>
              </view>
            </view>
          </view>
        </view>
        <view class="entry-modal-footer">
          <view class="btn btn-default" @click="closeEntryForm"><text>取消</text></view>
          <view class="btn btn-primary" @click="submitEntryForm"><text>确定</text></view>
        </view>
      </view>
    </view>

    <!-- 自定义页面 AI 自动生成弹窗 -->
    <view v-if="pageGenVisible" class="entry-modal-mask" @click="closePageGenForm">
      <view class="entry-modal-box page-gen-box" @click.stop>
        <view class="entry-modal-header">
          <text class="entry-modal-title">AI 自动生成页面内容</text>
          <text class="entry-modal-close" @click="closePageGenForm">×</text>
        </view>
        <view class="entry-modal-body">
          <view class="page-gen-tip">
            <text class="page-gen-tip-icon">✦</text>
            <text class="page-gen-tip-text">输入主题关键词，AI 会按所选页面类型与风格自动生成模块化页面内容（保存为草稿）。</text>
          </view>
          <view class="modal-form">
            <view class="modal-form-row">
              <text class="modal-form-label">页面主题</text>
              <view class="modal-form-field">
                <input class="modal-form-input" v-model="pageGenForm.name" placeholder="如：夏季护肤、618大促、新品上市" maxlength="20" />
              </view>
            </view>
            <view class="modal-form-row">
              <text class="modal-form-label">页面类型</text>
              <view class="modal-form-field">
                <picker :range="pageGenTypeOptions" @change="e => onPageGenTypeChange(e.detail.value)">
                  <view class="modal-form-input modal-form-picker"><text>{{ pageGenForm.type }}</text></view>
                </picker>
              </view>
            </view>
            <view class="modal-form-row">
              <text class="modal-form-label">内容风格</text>
              <view class="modal-form-field">
                <picker :range="pageGenToneOptions" @change="e => onPageGenToneChange(e.detail.value)">
                  <view class="modal-form-input modal-form-picker"><text>{{ pageGenForm.tone }}</text></view>
                </picker>
              </view>
            </view>
            <view class="modal-form-row modal-form-row-top">
              <text class="modal-form-label">内容模块</text>
              <view class="modal-form-field">
                <view class="page-gen-options">
                  <view
                    v-for="opt in pageGenOptionList()"
                    :key="opt.key"
                    class="page-gen-opt"
                    :class="{ active: pageGenForm.options[opt.key] }"
                    @click="onPageGenToggleOption(opt.key)"
                  >
                    <text class="page-gen-opt-check">{{ pageGenForm.options[opt.key] ? '✓' : '' }}</text>
                    <text class="page-gen-opt-label">{{ opt.label }}</text>
                  </view>
                  <view v-if="!pageGenOptionList().length" class="page-gen-empty"><text>该类型无可选附加模块</text></view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="entry-modal-footer">
          <view class="btn btn-default" @click="closePageGenForm"><text>取消</text></view>
          <view class="btn btn-primary" :class="{ 'btn-loading': pageGenLoading }" @click="submitPageGen">
            <text>{{ pageGenLoading ? '生成中…' : '开始生成' }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 自定义页面 路径页预览弹窗 -->
    <view v-if="pageContentVisible" class="entry-modal-mask" @click="closePageContent">
      <view class="entry-modal-box page-path-preview-box" @click.stop>
        <view class="entry-modal-header">
          <text class="entry-modal-title">页面路径预览</text>
          <text class="entry-modal-close" @click="closePageContent">×</text>
        </view>
        <view class="entry-modal-body page-path-preview-body">
          <view class="page-path-preview-meta">
            <view class="page-path-preview-meta-row">
              <text class="page-path-preview-label">页面名称</text>
              <text class="page-path-preview-value">{{ pageContentData.name }}</text>
            </view>
            <view class="page-path-preview-meta-row">
              <text class="page-path-preview-label">页面路径</text>
              <text class="page-path-preview-value mono path">{{ pageContentData.path || '—' }}</text>
            </view>
            <view class="page-path-preview-meta-row">
              <text class="page-path-preview-label">页面类型</text>
              <text class="page-path-preview-value"><text class="type-tag">{{ pageContentData.type }}</text></text>
            </view>
          </view>
          <view class="page-path-phone-wrap">
            <view class="page-path-phone">
              <view class="page-path-phone-notch"></view>
              <view class="page-path-phone-nav">
                <text class="page-path-phone-back">‹</text>
                <text class="page-path-phone-title">{{ pageContentData.name || '专题页' }}</text>
                <text class="page-path-phone-share">↑</text>
              </view>
              <scroll-view scroll-y class="page-path-phone-scroll" :show-scrollbar="false">
                <view v-if="!(pageContentData.modules || []).length" class="page-path-phone-empty">
                  <text>该路径页面暂无内容</text>
                  <text class="page-path-phone-empty-tip">可通过「新建页面」或「AI 自动生成」添加内容</text>
                </view>
                <view
                  v-for="(m, i) in pageContentData.modules"
                  :key="i"
                  class="pp-mod"
                >
                  <view v-if="m.type === 'banner' || m.type === 'hero'" class="pp-banner">
                    <image v-if="m.image" class="pp-banner-img" :src="m.image" mode="aspectFill" />
                    <view v-else class="pp-banner-fallback"></view>
                    <view class="pp-banner-mask">
                      <text class="pp-banner-title">{{ m.title }}</text>
                      <text v-if="m.subtitle || m.text" class="pp-banner-sub">{{ m.subtitle || m.text }}</text>
                    </view>
                  </view>
                  <view v-else-if="m.type === 'grid'" class="pp-card">
                    <text class="pp-card-title">{{ m.title }}</text>
                    <view class="pp-grid">
                      <view v-for="(it, j) in (m.items || [])" :key="j" class="pp-grid-item">
                        <view class="pp-grid-thumb"></view>
                        <text class="pp-grid-name">{{ it }}</text>
                      </view>
                    </view>
                  </view>
                  <view v-else-if="m.type === 'story'" class="pp-card">
                    <text class="pp-card-title">{{ m.title }}</text>
                    <text v-for="(p, j) in (m.paragraphs || [])" :key="j" class="pp-para">{{ p }}</text>
                  </view>
                  <view v-else-if="m.type === 'coupon'" class="pp-coupon">
                    <view class="pp-coupon-left"><text>{{ m.coupon || '券' }}</text></view>
                    <view class="pp-coupon-right">
                      <text class="pp-card-title">{{ m.title }}</text>
                      <text class="pp-card-sub">{{ m.subtitle }}</text>
                    </view>
                  </view>
                  <view v-else class="pp-card">
                    <text class="pp-card-title">{{ m.title || m.name || pageModuleTypeLabel(m.type) }}</text>
                    <text v-if="m.subtitle || m.text" class="pp-card-sub">{{ m.subtitle || m.text }}</text>
                    <view v-if="m.items && m.items.length" class="pp-tag-row">
                      <text v-for="(it, j) in m.items" :key="j" class="pp-tag">{{ it }}</text>
                    </view>
                    <view v-if="m.cats && m.cats.length" class="pp-tag-row">
                      <text v-for="(c, j) in m.cats" :key="'c'+j" class="pp-tag">{{ c }}</text>
                    </view>
                    <text v-if="m.cta" class="pp-cta">{{ m.cta }}</text>
                  </view>
                </view>
                <view class="pp-end"><text>— 已经到底啦 —</text></view>
              </scroll-view>
            </view>
          </view>
        </view>
        <view class="entry-modal-footer">
          <view class="btn btn-default" @click="closePageContent"><text>关闭</text></view>
        </view>
      </view>
    </view>

    <!-- 自定义页面 新建页面弹窗 -->
    <view v-if="pageAddVisible" class="entry-modal-mask" @click="closePageAddForm">
      <view class="entry-modal-box page-add-box" @click.stop>
        <view class="entry-modal-header">
          <text class="entry-modal-title">{{ pageAddFormMode === 'edit' ? '编辑页面' : '新建页面' }}</text>
          <text class="entry-modal-close" @click="closePageAddForm">×</text>
        </view>
        <view class="entry-modal-body page-add-body">
          <view class="page-add-layout">
            <!-- 列1 · 菜单导航 -->
            <view class="pa-rail" :class="{ collapsed: pageAddRailCollapsed }">
              <view class="pa-rail-header" @click="togglePageAddRail">
                <text class="pa-rail-title">菜单导航</text>
                <text class="pa-rail-toggle">▶</text>
              </view>
              <scroll-view scroll-y class="pa-rail-list">
                <view
                  v-for="cat in pageAddMenu"
                  :key="cat.id"
                  class="pa-rail-item"
                  :class="{ active: pageAddActiveCat === cat.id }"
                  @click="selectPageAddCat(cat.id)"
                >
                  <text class="pa-rail-icon">{{ cat.icon }}</text>
                  <text class="pa-rail-name">{{ cat.name }}</text>
                </view>
              </scroll-view>
            </view>
            <!-- 列2 · 组件 -->
            <view class="pa-lib">
              <view class="pa-col-header">
                <text>组件</text>
              </view>
              <scroll-view scroll-y class="pa-col-body">
                <view v-if="!getActivePageAddCat()" class="pa-col-empty">
                  <text class="pa-col-empty-icon">🧩</text>
                  <text class="pa-col-empty-text">请从左侧菜单选择分类</text>
                  <text class="pa-col-empty-tip">查看可添加的组件</text>
                </view>
                <block v-else>
                  <view
                    v-for="st in pageAddStyles"
                    :key="st.key"
                    class="pa-lib-item"
                    @click="addPageComp(st)"
                  >
                    <view class="page-add-comp-preview" :class="'pv-' + st.key">
                      <template v-if="st.key === 'large'">
                        <view class="pv-block area"></view>
                        <view class="pv-line"></view>
                        <view class="pv-line short"></view>
                      </template>
                      <template v-else-if="st.key === 'two'">
                        <view class="pv-col"><view class="pv-block sq"></view><view class="pv-line"></view></view>
                        <view class="pv-col"><view class="pv-block sq"></view><view class="pv-line"></view></view>
                      </template>
                      <template v-else-if="st.key === 'list'">
                        <view class="pv-listitem"><view class="pv-block thumb"></view><view class="pv-lines"><view class="pv-line"></view><view class="pv-line short"></view></view></view>
                        <view class="pv-listitem"><view class="pv-block thumb"></view><view class="pv-lines"><view class="pv-line"></view><view class="pv-line short"></view></view></view>
                      </template>
                      <template v-else-if="st.key === 'banner'">
                        <view class="pv-block banner"></view>
                      </template>
                      <template v-else>
                        <view class="pv-block sq"></view>
                        <view class="pv-block sq"></view>
                        <view class="pv-block sq"></view>
                        <view class="pv-block sq"></view>
                        <view class="pv-block sq"></view>
                        <view class="pv-block sq"></view>
                      </template>
                    </view>
                    <text class="pa-lib-item-name">{{ st.name + getActivePageAddCat().suffix }}</text>
                  </view>
                </block>
              </scroll-view>
            </view>
            <!-- 列3 · 页面配置（最大区域） -->
            <view class="pa-page">
              <view class="pa-col-header">
                <text>页面配置</text>
                <text class="pa-page-count">{{ pageAddPageComps.length }} 个组件</text>
              </view>
              <scroll-view scroll-y class="pa-col-body">
                <view v-if="!pageAddPageComps.length" class="pa-col-empty">
                  <text class="pa-col-empty-icon">📄</text>
                  <text class="pa-col-empty-text">页面暂无内容</text>
                  <text class="pa-col-empty-tip">点击左侧组件自动添加到此区域</text>
                </view>
                <view v-else class="pa-page-list">
                  <view
                    v-for="(cp, idx) in pageAddPageComps"
                    :key="cp.uid"
                    class="pa-page-item"
                    :class="{ selected: pageAddSelected && pageAddSelected.uid === cp.uid }"
                    @click="selectPageComp(cp)"
                  >
                    <view class="pa-page-item-head">
                      <text class="pa-page-item-idx">{{ idx + 1 }}</text>
                      <text class="pa-page-item-name">{{ cp.name }}</text>
                      <text class="pa-page-item-del" @click.stop="removePageComp(cp)">×</text>
                    </view>
                    <view class="pa-page-item-preview">
                      <!-- 商品浏览图：已选商品时展示真实封面 -->
                      <view v-if="cp.catId === 'product' && resolvePageProds(cp).length" class="pa-browse">
                        <view v-if="cp.key === 'large'" class="pa-browse-large">
                          <image class="pa-browse-cover" :src="resolvePageProds(cp)[0].img" mode="aspectFill" />
                          <view class="pa-browse-meta">
                            <text class="pa-browse-name">{{ resolvePageProds(cp)[0].label }}</text>
                            <text class="pa-browse-price">{{ resolvePageProds(cp)[0].priceText }}</text>
                          </view>
                        </view>
                        <view v-else-if="cp.key === 'two' || cp.key === 'three'" class="pa-browse-grid" :class="cp.key === 'three' ? 'cols-3' : 'cols-2'">
                          <view class="pa-browse-cell" v-for="p in resolvePageProds(cp).slice(0, cp.key === 'three' ? 6 : 4)" :key="p.key">
                            <image :src="p.img" mode="aspectFill" />
                            <text class="pa-browse-name">{{ p.label }}</text>
                            <text class="pa-browse-price">{{ p.priceText }}</text>
                          </view>
                        </view>
                        <view v-else-if="cp.key === 'list'" class="pa-browse-list">
                          <view class="pa-browse-row" v-for="p in resolvePageProds(cp).slice(0, 4)" :key="p.key">
                            <image :src="p.img" mode="aspectFill" />
                            <view class="pa-browse-meta">
                              <text class="pa-browse-name">{{ p.label }}</text>
                              <text class="pa-browse-price">{{ p.priceText }}</text>
                            </view>
                          </view>
                        </view>
                        <view v-else-if="cp.key === 'banner'" class="pa-browse-banner">
                          <image :src="resolvePageProds(cp)[0].img" mode="aspectFill" />
                        </view>
                        <view v-else class="page-add-comp-preview" :class="'pv-' + cp.key">
                          <view class="pv-block area"></view>
                        </view>
                      </view>
                      <view v-else-if="cp.catId === 'product' && (cp.data.mode === 'rule' || (cp.data.cats && cp.data.cats.length))" class="pa-browse">
                        <text class="pa-browse-empty">{{ cp.data.mode === 'rule' ? '按规则自动匹配商品' : ('已选分类：' + cp.data.cats.join('、')) }}</text>
                      </view>
                      <view v-else class="page-add-comp-preview" :class="'pv-' + cp.key">
                        <template v-if="cp.key === 'large'">
                          <view class="pv-block area"></view>
                          <view class="pv-line"></view>
                          <view class="pv-line short"></view>
                        </template>
                        <template v-else-if="cp.key === 'two'">
                          <view class="pv-col"><view class="pv-block sq"></view><view class="pv-line"></view></view>
                          <view class="pv-col"><view class="pv-block sq"></view><view class="pv-line"></view></view>
                        </template>
                        <template v-else-if="cp.key === 'list'">
                          <view class="pv-listitem"><view class="pv-block thumb"></view><view class="pv-lines"><view class="pv-line"></view><view class="pv-line short"></view></view></view>
                          <view class="pv-listitem"><view class="pv-block thumb"></view><view class="pv-lines"><view class="pv-line"></view><view class="pv-line short"></view></view></view>
                        </template>
                        <template v-else-if="cp.key === 'banner'">
                          <view class="pv-block banner"></view>
                        </template>
                        <template v-else>
                          <view class="pv-block sq"></view>
                          <view class="pv-block sq"></view>
                          <view class="pv-block sq"></view>
                          <view class="pv-block sq"></view>
                          <view class="pv-block sq"></view>
                          <view class="pv-block sq"></view>
                        </template>
                      </view>
                    </view>
                    <view class="pa-page-item-sum" v-if="hasCompSummary(cp)">
                      <text class="pa-sum-title" v-if="cp.data.title">{{ cp.data.title }}</text>
                      <text class="pa-sum-text" v-if="cp.data.items && cp.data.items.length">已选 {{ cp.data.items.length }} 个商品</text>
                      <text class="pa-sum-text" v-if="cp.data.cats && cp.data.cats.length">分类：{{ cp.data.cats.join('、') }}</text>
                      <text class="pa-sum-text" v-if="cp.data.mode === 'rule'">规则：{{ ruleLabel(cp.data.rule) }}</text>
                    </view>
                  </view>
                </view>
              </scroll-view>
            </view>
            <!-- 列4 · 属性配置 -->
            <view class="pa-props">
              <view class="pa-col-header">
                <text>属性配置</text>
              </view>
              <scroll-view scroll-y class="pa-col-body">
                <view v-if="!pageAddSelected" class="pa-col-empty">
                  <text class="pa-col-empty-icon">⚙️</text>
                  <text class="pa-col-empty-text">请在页面配置中选择组件</text>
                  <text class="pa-col-empty-tip">选中后可配置属性</text>
                </view>
                <block v-else>
                  <view class="pa-props-panel">
                    <text class="pa-props-title">{{ pageAddSelected.name }}</text>
                    <view class="pa-props-tabs">
                      <text class="pa-props-tab" :class="{ active: pageAddPropsTab === 'style' }" @click="pageAddPropsTab = 'style'">样式</text>
                      <text class="pa-props-tab" :class="{ active: pageAddPropsTab === 'data' }" @click="pageAddPropsTab = 'data'">数据</text>
                    </view>
                    <block v-if="pageAddPropsTab === 'style'">
                      <text class="pa-props-sec">样式管理</text>
                      <view class="pa-align-row">
                        <text class="pa-align-label">对齐</text>
                        <text
                          v-for="a in paAlignOptions"
                          :key="a.key"
                          class="pa-align-btn"
                          :class="{ active: pageAddSelected.align === a.key }"
                          @click="pageAddSelected.align = a.key"
                        >{{ a.label }}</text>
                      </view>
                      <scroll-view scroll-y class="pa-check-list">
                        <view
                          v-for="f in getPageAddSelectedFields()"
                          :key="f.key"
                          class="pa-check-item"
                          @click="toggleCompField(f.key)"
                        >
                          <view class="pa-check-box" :class="{ on: pageAddSelected.fields[f.key] }">✓</view>
                          <text>显示{{ f.label }}</text>
                        </view>
                      </scroll-view>
                    </block>
                    <block v-else>
                      <text class="pa-data-sec">添加{{ getActiveCatName() }}</text>
                      <view class="pa-mode-row">
                        <view class="pa-mode-card" :class="{ active: pageAddSelected.data.mode === 'rule' }" @click="pageAddSelected.data.mode = 'rule'">
                          <view class="pa-mode-dot"></view>
                          <text>指定规则</text>
                        </view>
                        <view class="pa-mode-card" :class="{ active: pageAddSelected.data.mode === 'manual' }" @click="pageAddSelected.data.mode = 'manual'">
                          <view class="pa-mode-dot"></view>
                          <text>手动选择</text>
                        </view>
                      </view>
                      <block v-if="pageAddSelected.data.mode === 'manual'">
                        <view class="pa-sub-row">
                          <view
                            v-for="s in getSubOptions()"
                            :key="s.key"
                            class="pa-sub-item"
                            :class="{ active: pageAddSelected.data.sub === s.key }"
                            @click="pageAddSelected.data.sub = s.key"
                          >
                            <view class="pa-sub-dot"></view>
                            <text>{{ s.label }}</text>
                          </view>
                        </view>
                        <text class="pa-field-label">标题</text>
                        <input class="pa-field-input" type="text" v-model="pageAddSelected.data.title" placeholder="请输入列表名称（选填）" />
                        <text class="pa-field-label" v-if="pageAddSelected.data.sub !== 'cat'">{{ getActiveCatName() }}</text>
                        <view class="pa-dd" v-if="pageAddSelected.data.sub !== 'cat'">
                          <view class="pa-dd-field" :class="{ has: pageAddSelected.data.items.length }" @click="pageAddDataDrop = !pageAddDataDrop">
                            <text>{{ pageAddSelected.data.items.length ? '已选 ' + pageAddSelected.data.items.length + ' 个' : '请选择' + getActiveCatName() + '（可多选）' }}</text>
                            <text class="pa-dd-arrow">▾</text>
                          </view>
                          <scroll-view v-if="pageAddDataDrop" scroll-y class="pa-dd-panel">
                            <view v-for="o in getItemOptions()" :key="o.key" class="pa-dd-opt" @click="toggleDataItem(o.key)">
                              <view class="pa-sub-dot" :class="{ blue: pageAddSelected.data.items.indexOf(o.key) >= 0 }"></view>
                              <image v-if="o.img" class="pa-dd-img" :src="o.img" mode="aspectFill" />
                              <text class="pa-dd-opt-name">{{ o.label }}</text>
                              <text v-if="o.price" class="pa-dd-opt-price">¥{{ o.price }}</text>
                            </view>
                          </scroll-view>
                        </view>
                        <text class="pa-field-label" v-if="pageAddSelected.data.sub === 'cat'">分类</text>
                        <view class="pa-dd" v-if="pageAddSelected.data.sub === 'cat'">
                          <view class="pa-dd-field" :class="{ has: pageAddSelected.data.cats.length }" @click="pageAddCatDrop = !pageAddCatDrop">
                            <text>{{ pageAddSelected.data.cats.length ? '已选 ' + pageAddSelected.data.cats.length + ' 个分类' : '请选择分类（可多选）' }}</text>
                            <text class="pa-dd-arrow">▾</text>
                          </view>
                          <scroll-view v-if="pageAddCatDrop" scroll-y class="pa-dd-panel">
                            <view v-for="c in getCatOptions()" :key="c" class="pa-dd-opt" @click="toggleDataCat(c)">
                              <view class="pa-sub-dot" :class="{ blue: pageAddSelected.data.cats.indexOf(c) >= 0 }"></view>
                              <text>{{ c }}</text>
                            </view>
                          </scroll-view>
                        </view>
                        <view class="pa-sync-row">
                          <text>已与页面配置预览同步</text>
                          <view class="pa-sync-btn" @click="onDataConfirm"><text>确认</text></view>
                        </view>
                      </block>
                      <block v-else>
                        <text class="pa-field-label">规则方式</text>
                        <view
                          v-for="r in pageAddRuleOptions"
                          :key="r.key"
                          class="pa-check-item"
                          @click="pageAddSelected.data.rule = r.key"
                        >
                          <view class="pa-check-box" :class="{ on: pageAddSelected.data.rule === r.key }">✓</view>
                          <text>{{ r.label }}</text>
                        </view>
                      </block>
                      <text class="pa-field-label">页面路径</text>
                      <input class="pa-field-input" type="text" :value="getPageAddPath()" disabled />
                    </block>
                    <view class="pa-props-del" @click="removePageComp(pageAddSelected)"><text>删除组件</text></view>
                  </view>
                </block>
              </scroll-view>
            </view>
          </view>
        </view>
        <view class="entry-modal-footer">
          <view class="btn btn-default" @click="closePageAddForm"><text>取消</text></view>
          <view class="btn btn-primary" @click="submitPageAdd"><text>确定</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { normFilterVal, paginateList } from '../../common/list-filter.js'
import { getAdCover, getPageCover, getEntryIcon } from '../../common/decor-image.js'
import { getProductCover } from '../../common/product-image.js'
import {
  getEntryMoveState,
  moveEntryInList,
  normalizeScopeEntrySort,
  sortEntriesByOrder
} from '../../common/entry-sort.js'
import {
  DECOR_ENTRY_STORAGE_KEY,
  loadDecorEntryList,
  saveDecorEntryList
} from '../../common/decor-entry-data.js'
import {
  DECOR_PAGE_STORAGE_KEY,
  loadDecorPageList,
  saveDecorPageList,
  generatePageContent,
  getPageToneOptions
} from '../../common/decor-page-data.js'

const PRODUCT_STORAGE_KEY = 'zhuangyan_product_list_v1'
const ACTIVITY_STORAGE_KEY = 'zhuangyan_activity_list_v1'
const PAGE_ADD_PROD_FALLBACK = [
  { id: 'SP100001', name: '神仙水精华露 230ml 补水保湿提亮', price: 1599, cat1: '护肤', cat2: '面部护肤' },
  { id: 'SP100002', name: '小黑瓶肌底修护精华液 50ml', price: 980, cat1: '护肤', cat2: '面部护肤' },
  { id: 'SP100003', name: '小棕瓶特润修护精华眼霜 15ml', price: 590, cat1: '护肤', cat2: '眼部护理' },
  { id: 'SP100004', name: '羽毛气垫粉底液 自然色 SPF50+', price: 219, cat1: '彩妆', cat2: '面部彩妆' },
  { id: 'SP100005', name: '花西子同心锁口红 哑光雾面 M301', price: 169, cat1: '彩妆', cat2: '唇部彩妆' },
  { id: 'SP100006', name: '自然堂喜马拉雅冰川水 160ml', price: 118, cat1: '护肤', cat2: '面部护肤' },
  { id: 'SP100007', name: '完美日记小细跟口红', price: 89, cat1: '彩妆', cat2: '唇部彩妆' },
  { id: 'SP100008', name: '自然堂面膜 10片装', price: 99, cat1: '护肤', cat2: '面膜' }
]
const ENTRY_ACTIVITY_FALLBACK = [
  { id: '202506005', name: '新人首单满减' },
  { id: '202506016', name: '年货节满减' },
  { id: '202506018', name: '护肤品类满折' },
  { id: '202506004', name: '限时秒杀专场' },
  { id: '202506019', name: '新人领券礼' }
]

function loadPageAddProductList() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(PRODUCT_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length) return parsed
      }
    }
  } catch (e) { /* ignore */ }
  return PAGE_ADD_PROD_FALLBACK
}

function loadEntryActivityList() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length) return parsed
      }
    }
  } catch (e) { /* ignore */ }
  return ENTRY_ACTIVITY_FALLBACK
}

function shortenEntryLink(url) {
  const s = String(url || '')
  if (!s) return ''
  if (s.length <= 28) return s
  return s.slice(0, 14) + '…' + s.slice(-10)
}

export default {
  data() {
    return {
      currentTab: 'slide',
      tabs: [
        { id: 'slide', name: '幻灯片管理', icon: '🖼' },
        { id: 'page', name: '自定义页面', icon: '📄' },
        { id: 'entry', name: '功能入口', icon: '🔗' }
      ],
      filterExpanded: false,
      statusOptions: ['全部', '待上线', '上线中', '已下线'],
      positionOptions: ['全部', '首页 中部', '首页 顶部', '发现-推荐 左上角', '个人中心-腰部', '商品详情-底部'],
      filterForm: { name: '', status: '', position: '', dateStart: '', dateEnd: '' },
      appliedFilter: { name: '', status: '', position: '', dateStart: '', dateEnd: '' },
      pageSizeList: ['10 条/页', '20 条/页', '50 条/页'],
      pageSize: '10 条/页',
      adPage: 1,
      adFormVisible: false,
      adFormMode: 'add',
      adFormEditId: '',
      adForm: {
        id: '', name: '', position: '首页 中部', status: '待上线',
        link: '', startTime: '', endTime: ''
      },
      adFormPosOptions: ['首页 中部', '首页 顶部', '发现-推荐 左上角', '个人中心-腰部', '商品详情-底部'],
      adFormStatusOptions: ['待上线', '上线中', '已下线'],
      adList: [
        {
          id: 'AD10001', position: '首页 中部', name: '首页 中部 banner',
          status: '待上线', statusKey: 'pending', link: 'www.baidu.com',
          startTime: '2026-08-01', endTime: '2026-08-31'
        },
        {
          id: 'AD10002', position: '发现-推荐 左上角', name: '发现信息流广告',
          status: '上线中', statusKey: 'online', link: 'www.meili.com/feed-ad',
          startTime: '2026-07-01', endTime: '2026-09-30'
        },
        {
          id: 'AD10003', position: '个人中心-腰部', name: '会员招募广告',
          status: '已下线', statusKey: 'offline', link: 'www.meili.com/vip',
          startTime: '2026-06-01', endTime: '2026-07-31'
        },
        {
          id: 'AD10004', position: '首页 顶部', name: '夏季大促轮播图',
          status: '上线中', statusKey: 'online', link: 'www.meili.com/summer-sale',
          startTime: '2026-08-10', endTime: '2026-08-31'
        },
        {
          id: 'AD10005', position: '商品详情-底部', name: '关联推荐广告位',
          status: '待上线', statusKey: 'pending', link: 'www.meili.com/recommend',
          startTime: '2026-08-20', endTime: '2026-10-20'
        }
      ],
      pageTypeOptions: ['全部', '专题页', '活动页', '品牌页', '内容页'],
      pageStatusOptions: ['全部', '已发布', '草稿', '已下线'],
      pageFilter: { name: '', type: '', status: '' },
      pageApplied: { name: '', type: '', status: '' },
      pagePageNum: 1,
      pageList: loadDecorPageList(),
      pageGenVisible: false,
      pageGenLoading: false,
      pageGenForm: { name: '', type: '专题页', tone: '专业', options: { grid: true, story: true, video: true, coupon: true, tasks: true, article: true, tags: true, related: true } },
      pageGenTypeOptions: ['专题页', '活动页', '品牌页', '内容页'],
      pageGenToneOptions: getPageToneOptions(),
      pageContentVisible: false,
      pageContentData: { id: '', name: '', type: '', path: '', modules: [] },
      pageAddVisible: false,
      pageAddFormMode: 'add',
      pageAddEditId: '',
      pageAddMeta: { name: '', type: '专题页', path: '', status: '草稿', statusKey: 'draft' },
      pageHighlightId: '',
      pageHighlightTimer: null,
      pageAddMenu: [
        { id: 'product', name: '商品', icon: '🛍', suffix: '商品' },
        { id: 'user', name: '用户', icon: '👥', suffix: '用户' },
        { id: 'activity', name: '活动', icon: '🎁', suffix: '活动' },
        { id: 'circle', name: '圈子', icon: '⭕', suffix: '圈子' },
        { id: 'article', name: '文章', icon: '📄', suffix: '文章' },
        { id: 'feed', name: '动态', icon: '📢', suffix: '动态' },
        { id: 'grass', name: '种草', icon: '🌿', suffix: '种草' },
        { id: 'topic', name: '话题', icon: '💬', suffix: '话题' },
        { id: 'other', name: '其他', icon: '⋯', suffix: '模块' }
      ],
      pageAddStyles: [
        { key: 'large', name: '大图' },
        { key: 'two', name: '两列' },
        { key: 'list', name: '列表' },
        { key: 'banner', name: '横浮' },
        { key: 'three', name: '三列' }
      ],
      pageAddPropsTab: 'style',
      pageAddDataDrop: false,
      // 指定规则的三个规则选项（勾选样式，单选互斥）
      pageAddRuleOptions: [
        { key: 'behavior', label: '按行为' },
        { key: 'sales', label: '按销量' },
        { key: 'praise', label: '按好评度' }
      ],
      paAlignOptions: [
        { key: 'left', label: '左' },
        { key: 'center', label: '中' },
        { key: 'right', label: '右' }
      ],
      // 各分类数据面板的多选示例项
      pageAddSamples: {
        product: ['玻尿酸补水面膜', '烟酰胺美白精华', '氨基酸洁面乳', '神经酰胺面霜', '温和防晒乳', '舒缓卸妆水', '修护眼霜', '保湿喷雾'],
        user: ['小镇姑娘', '糖糖不甜', '阿离', '软软酱', '奶盖茶', '柚子茶', '一头猫', '今天也要努力'],
        activity: ['周年庆大促', '新品首发日', '会员日专场', '直播特卖会', '打卡赢好礼', '限时秒杀'],
        circle: ['护肤交流圈', '彩妆种草圈', '好物分享圈', '新手入门圈', '护肤打卡圈', '成分党联盟'],
        article: ['夏季护肤指南', '成分党入门', '底妆避坑手册', '敏感肌护理', '防晒全攻略', '卸妆误区盘点'],
        feed: ['今日妆容打卡', '空瓶记分享', '新品开箱', '护肤小技巧', '好物安利', '探店日记'],
        grass: ['无限回购面霜', '平价好用水乳', '熬夜救急面膜', '学生党彩妆', '油皮亲妈散粉', '干皮救星精华'],
        topic: ['夏日清爽护肤', '我的化妆包', '空瓶挑战', '成分大科普', '晒晒我的梳妆台', '新手化妆教程'],
        other: ['品牌故事', '关于我们', '联系方式', '常见问题', '加入我们', '法律声明']
      },
      // 各分类可配置的显示字段（属性配置 · 样式管理勾选项），on 为默认勾选
      pageAddFields: {
        product: [
          { key: 'img', label: '商品图片', on: true },
          { key: 'id', label: 'ID' },
          { key: 'name', label: '名称', on: true },
          { key: 'brand', label: '品牌' },
          { key: 'sku', label: 'SKU' },
          { key: 'cat1', label: '一级分类' },
          { key: 'cat2', label: '二级分类' },
          { key: 'cat3', label: '三级分类' },
          { key: 'price', label: '价格', on: true },
          { key: 'stock', label: '库存' },
          { key: 'stage', label: '适用阶段' },
          { key: 'age', label: '适用年龄' },
          { key: 'merchant', label: '所属商家', on: true },
          { key: 'sales', label: '销量' },
          { key: 'tags', label: '商品标签' }
        ],
        user: [
          { key: 'avatar', label: '用户头像', on: true },
          { key: 'id', label: '用户ID' },
          { key: 'name', label: '昵称', on: true },
          { key: 'phone', label: '手机号' },
          { key: 'level', label: '会员等级' },
          { key: 'regtime', label: '注册时间' },
          { key: 'follows', label: '关注数' },
          { key: 'fans', label: '粉丝数' },
          { key: 'feeds', label: '发布动态数' }
        ],
        activity: [
          { key: 'img', label: '活动图片', on: true },
          { key: 'id', label: '活动ID' },
          { key: 'name', label: '活动名称', on: true },
          { key: 'time', label: '活动时间', on: true },
          { key: 'place', label: '活动地点' },
          { key: 'signup', label: '报名人数' },
          { key: 'status', label: '活动状态' },
          { key: 'tags', label: '活动标签' }
        ],
        circle: [
          { key: 'cover', label: '圈子封面', on: true },
          { key: 'id', label: '圈子ID' },
          { key: 'name', label: '圈子名称', on: true },
          { key: 'owner', label: '圈主' },
          { key: 'members', label: '成员数', on: true },
          { key: 'posts', label: '帖子数' },
          { key: 'digest', label: '精华帖数' }
        ],
        article: [
          { key: 'cover', label: '文章封面', on: true },
          { key: 'id', label: '文章ID' },
          { key: 'title', label: '文章标题', on: true },
          { key: 'author', label: '作者' },
          { key: 'time', label: '发布时间', on: true },
          { key: 'reads', label: '阅读量' },
          { key: 'likes', label: '点赞数' },
          { key: 'digest', label: '摘要' }
        ],
        feed: [
          { key: 'img', label: '动态图片', on: true },
          { key: 'id', label: '动态ID' },
          { key: 'digest', label: '内容摘要', on: true },
          { key: 'author', label: '发布人' },
          { key: 'time', label: '发布时间' },
          { key: 'likes', label: '点赞数' },
          { key: 'comments', label: '评论数' },
          { key: 'reads', label: '浏览量' }
        ],
        grass: [
          { key: 'img', label: '商品图片', on: true },
          { key: 'id', label: '商品ID' },
          { key: 'name', label: '商品名称', on: true },
          { key: 'reason', label: '种草理由' },
          { key: 'price', label: '价格', on: true },
          { key: 'collects', label: '收藏数' },
          { key: 'author', label: '发布人' }
        ],
        topic: [
          { key: 'icon', label: '话题图标', on: true },
          { key: 'id', label: '话题ID' },
          { key: 'name', label: '话题名称', on: true },
          { key: 'joins', label: '参与人数' },
          { key: 'reads', label: '浏览量' },
          { key: 'talks', label: '讨论数' }
        ],
        other: [
          { key: 'title', label: '模块标题', on: true },
          { key: 'img', label: '模块图片', on: true },
          { key: 'sub', label: '副标题' },
          { key: 'link', label: '跳转链接' },
          { key: 'sort', label: '排序权重' }
        ]
      },
      pageAddActiveCat: null,
      pageAddRailCollapsed: false,
      pageAddSelected: null,
      pageAddPageComps: [],
      pageAddUid: 0,
      entryScope: 'home',
      entrySubMenus: [
        { id: 'home', name: '首页功能入口管理' },
        { id: 'profile', name: '个人功能入口管理' }
      ],
      homeEntryPosOptions: ['全部', '首页顶部', '首页中部'],
      profileEntryPosOptions: ['全部', '个人中心'],
      entryShowOptions: ['全部', '显示', '隐藏'],
      entryFilter: { name: '', position: '', visible: '' },
      entryApplied: { name: '', position: '', visible: '' },
      entryPageNum: 1,
      entryFormVisible: false,
      entryFormMode: 'add',
      entryFormEditId: '',
      entryForm: { id: '', name: '', icon: 'skin.svg', iconUrl: '', position: '', path: '选择指定商品', linkUrl: '', sort: 1, visible: true },
      entryLinkTypeOptions: ['选择指定商品', '指定活动', '自定页面', '跳转网址'],
      entryFormVisibleOptions: ['显示', '隐藏'],
      entryFormVisibleValues: [true, false],
      entryList: [],
    }
  },
  mounted() {
    this.refreshEntryList()
    if (typeof window !== 'undefined') {
      this._onDecorEntryStorage = (ev) => {
        if (!ev || ev.key !== DECOR_ENTRY_STORAGE_KEY) return
        this.refreshEntryList()
      }
      this._onDecorEntryMessage = (ev) => {
        if (!ev.data || ev.data.type !== 'decor-entry-sync' || !Array.isArray(ev.data.entries)) return
        if (ev.data.source === 'workspace') return
        this.entryList = ev.data.entries.map((en) => ({ ...en, _checked: false }))
        saveDecorEntryList(this.entryList)
      }
      this._onDecorPageStorage = (ev) => {
        if (!ev || ev.key !== DECOR_PAGE_STORAGE_KEY) return
        this.pageList = loadDecorPageList().map((p) => ({ ...p, _checked: false }))
      }
      this._onDecorPageMessage = (ev) => {
        if (!ev.data || ev.data.type !== 'decor-page-sync' || !Array.isArray(ev.data.pages)) return
        if (ev.data.source === 'workspace') return
        this.pageList = ev.data.pages.map((p) => ({ ...p, _checked: false }))
        saveDecorPageList(this.pageList)
      }
      window.addEventListener('storage', this._onDecorEntryStorage)
      window.addEventListener('message', this._onDecorEntryMessage)
      window.addEventListener('storage', this._onDecorPageStorage)
      window.addEventListener('message', this._onDecorPageMessage)
    }
  },
  beforeDestroy() {
    if (this.pageHighlightTimer) {
      clearTimeout(this.pageHighlightTimer)
      this.pageHighlightTimer = null
    }
    if (typeof window !== 'undefined') {
      if (this._onDecorEntryStorage) window.removeEventListener('storage', this._onDecorEntryStorage)
      if (this._onDecorEntryMessage) window.removeEventListener('message', this._onDecorEntryMessage)
      if (this._onDecorPageStorage) window.removeEventListener('storage', this._onDecorPageStorage)
      if (this._onDecorPageMessage) window.removeEventListener('message', this._onDecorPageMessage)
    }
  },
  computed: {
    currentTabCfg() {
      return this.tabs.find(t => t.id === this.currentTab) || this.tabs[0]
    },
    filteredAdList() {
      const f = this.appliedFilter
      const kw = (f.name || '').trim().toLowerCase()
      return this.adList.filter(ad => {
        if (kw && !(ad.name || '').toLowerCase().includes(kw)) return false
        const st = normFilterVal(f.status)
        if (st && ad.status !== st) return false
        const pos = normFilterVal(f.position)
        if (pos && ad.position !== pos) return false
        if (f.dateStart && ad.endTime < f.dateStart) return false
        if (f.dateEnd && ad.startTime > f.dateEnd) return false
        return true
      })
    },
    adMaxPage() {
      const size = parseInt(this.pageSize, 10) || 10
      return Math.max(1, Math.ceil(this.filteredAdList.length / size))
    },
    displayAdList() {
      return paginateList(this.filteredAdList, this.adPage, this.pageSize).items
    },
    isAllChecked() {
      const list = this.displayAdList
      return list.length > 0 && list.every(a => a._checked)
    },
    filteredPageList() {
      const f = this.pageApplied
      const kw = (f.name || '').trim().toLowerCase()
      return this.pageList.filter(pg => {
        if (kw && !(pg.name || '').toLowerCase().includes(kw)) return false
        const tp = normFilterVal(f.type)
        if (tp && pg.type !== tp) return false
        const st = normFilterVal(f.status)
        if (st && pg.status !== st) return false
        return true
      })
    },
    pageMaxPage() {
      const size = parseInt(this.pageSize, 10) || 10
      return Math.max(1, Math.ceil(this.filteredPageList.length / size))
    },
    displayPageList() {
      return paginateList(this.filteredPageList, this.pagePageNum, this.pageSize).items
    },
    isAllPageChecked() {
      const list = this.displayPageList
      return list.length > 0 && list.every(p => p._checked)
    },
    currentEntryPosOptions() {
      return this.entryScope === 'profile' ? this.profileEntryPosOptions : this.homeEntryPosOptions
    },
    filteredEntryList() {
      const f = this.entryApplied
      const kw = (f.name || '').trim().toLowerCase()
      return sortEntriesByOrder(this.entryList.filter(en => {
        if (en.scope !== this.entryScope) return false
        if (kw && !(en.name || '').toLowerCase().includes(kw)) return false
        const pos = normFilterVal(f.position)
        if (pos && en.position !== pos) return false
        const vis = normFilterVal(f.visible)
        if (vis === '显示' && !en.visible) return false
        if (vis === '隐藏' && en.visible) return false
        return true
      }))
    },
    entryMaxPage() {
      const size = parseInt(this.pageSize, 10) || 10
      return Math.max(1, Math.ceil(this.filteredEntryList.length / size))
    },
    displayEntryList() {
      return paginateList(this.filteredEntryList, this.entryPageNum, this.pageSize).items
    },
    isAllEntryChecked() {
      const list = this.displayEntryList
      return list.length > 0 && list.every(e => e._checked)
    },
    entryFormPosOptions() {
      return this.entryScope === 'profile'
        ? ['个人中心']
        : ['首页顶部', '首页中部']
    },
    entryFormIconPreview() {
      if (this.entryForm.iconUrl) return this.entryForm.iconUrl
      return getEntryIcon(this.entryForm)
    },
    entryProductLinkOptions() {
      return loadPageAddProductList().map((p) => {
        const name = String(p.name || '')
        const shortName = name.length > 18 ? name.slice(0, 18) + '…' : name
        return {
          label: p.id + ' · ' + shortName,
          value: '/pages/product/detail?id=' + p.id
        }
      })
    },
    entryProductLinkLabels() {
      return this.entryProductLinkOptions.map((o) => o.label)
    },
    entryActivityLinkOptions() {
      return loadEntryActivityList().map((a) => {
        const name = String(a.name || a.id || '')
        const shortName = name.length > 18 ? name.slice(0, 18) + '…' : name
        return {
          label: a.id + ' · ' + shortName,
          value: '/pages/activity/detail?id=' + encodeURIComponent(a.id)
        }
      })
    },
    entryActivityLinkLabels() {
      return this.entryActivityLinkOptions.map((o) => o.label)
    },
    entryPageLinkOptions() {
      return (this.pageList || []).map((pg) => {
        const name = String(pg.name || pg.id || '')
        const shortName = name.length > 18 ? name.slice(0, 18) + '…' : name
        return {
          label: (pg.id || '') + ' · ' + shortName,
          value: '/pages/decor/page?id=' + encodeURIComponent(pg.id)
        }
      })
    },
    entryPageLinkLabels() {
      return this.entryPageLinkOptions.map((o) => o.label)
    },
    entryLinkTargetDisplay() {
      const url = this.entryForm.linkUrl
      if (!url) return ''
      const type = this.entryForm.path
      let opts = []
      if (type === '选择指定商品') opts = this.entryProductLinkOptions
      else if (type === '指定活动') opts = this.entryActivityLinkOptions
      else if (type === '自定页面') opts = this.entryPageLinkOptions
      const hit = opts.find((o) => o.value === url)
      if (hit) return hit.label
      if (type === '自定页面') {
        const pg = (this.pageList || []).find((p) => p.path === url || ('/pages/decor/page?id=' + encodeURIComponent(p.id)) === url)
        if (pg) {
          const name = String(pg.name || pg.id || '')
          const shortName = name.length > 18 ? name.slice(0, 18) + '…' : name
          return (pg.id || '') + ' · ' + shortName
        }
      }
      return shortenEntryLink(url)
    },
    // 选商品：取商品管理列表（localStorage 同步），含封面与价格
    pageAddProdOptions() {
      return loadPageAddProductList().map((p) => ({
        key: String(p.id),
        label: p.name,
        price: Math.round(Number(p.price) || 0),
        cat: p.cat2 || p.cat1 || '',
        img: p.syncCover || p.coverUrl || getProductCover(p.id || p.sku),
        cover: p.cover || ''
      }))
    }
  },
  methods: {
    refreshEntryList() {
      this.entryList = loadDecorEntryList().map((en) => ({ ...en, _checked: false }))
    },
    persistEntryList() {
      this.entryList = saveDecorEntryList(this.entryList).map((en) => ({ ...en, _checked: false }))
    },
    getAdCover,
    getPageCover,
    getEntryIcon,
    applySearch() {
      this.appliedFilter = { ...this.filterForm }
      this.adPage = 1
    },
    resetFilter() {
      this.filterForm = { name: '', status: '', position: '', dateStart: '', dateEnd: '' }
      this.appliedFilter = { name: '', status: '', position: '', dateStart: '', dateEnd: '' }
      this.adPage = 1
    },
    onPageSizeChange(e) {
      this.pageSize = this.pageSizeList[e.detail.value]
      this.adPage = 1
    },
    prevPage() {
      if (this.adPage > 1) this.adPage--
    },
    nextPage() {
      if (this.adPage < this.adMaxPage) this.adPage++
    },
    toggleCheckAll(e) {
      const checked = e.detail.value && e.detail.value.length > 0
      this.displayAdList.forEach(a => { this.$set(a, '_checked', checked) })
    },
    toggleRow(ad) {
      this.$set(ad, '_checked', !ad._checked)
    },
    checkedAds() {
      return this.adList.filter(a => a._checked)
    },
    nextAdId() {
      let max = 10000
      this.adList.forEach((ad) => {
        const n = parseInt(String(ad.id).replace(/\D/g, ''), 10)
        if (!isNaN(n) && n > max) max = n
      })
      return 'AD' + (max + 1)
    },
    adStatusKeyFromText(status) {
      return { '待上线': 'pending', '上线中': 'online', '已下线': 'offline' }[status] || 'pending'
    },
    openAdForm(mode, ad) {
      this.adFormMode = mode
      this.adFormEditId = ad ? ad.id : ''
      if (mode === 'edit' && ad) {
        this.adForm = {
          id: ad.id,
          name: ad.name || '',
          position: ad.position || this.adFormPosOptions[0],
          status: ad.status || '待上线',
          link: ad.link || '',
          startTime: ad.startTime || '',
          endTime: ad.endTime || ''
        }
      } else {
        const today = new Date()
        const p = (n) => String(n).padStart(2, '0')
        const start = today.getFullYear() + '-' + p(today.getMonth() + 1) + '-' + p(today.getDate())
        const endDate = new Date(today.getTime() + 30 * 24 * 3600 * 1000)
        const end = endDate.getFullYear() + '-' + p(endDate.getMonth() + 1) + '-' + p(endDate.getDate())
        this.adForm = {
          id: this.nextAdId(),
          name: '',
          position: this.adFormPosOptions[0],
          status: '待上线',
          link: '',
          startTime: start,
          endTime: end
        }
      }
      this.adFormVisible = true
    },
    closeAdForm() {
      this.adFormVisible = false
      this.adFormEditId = ''
    },
    submitAdForm() {
      const name = (this.adForm.name || '').trim()
      const link = (this.adForm.link || '').trim()
      const position = this.adForm.position
      const status = this.adForm.status
      if (!name) return uni.showToast({ title: '请输入广告名称', icon: 'none' })
      if (!position) return uni.showToast({ title: '请选择广告位置', icon: 'none' })
      if (!status) return uni.showToast({ title: '请选择广告状态', icon: 'none' })
      if (!link) return uni.showToast({ title: '请输入广告链接', icon: 'none' })
      if (!this.adForm.startTime || !this.adForm.endTime) {
        return uni.showToast({ title: '请选择起止日期', icon: 'none' })
      }
      if (this.adForm.startTime > this.adForm.endTime) {
        return uni.showToast({ title: '开始日期不能晚于结束日期', icon: 'none' })
      }
      const payload = {
        id: this.adForm.id,
        name,
        position,
        status,
        statusKey: this.adStatusKeyFromText(status),
        link,
        startTime: this.adForm.startTime,
        endTime: this.adForm.endTime
      }
      if (this.adFormMode === 'edit' && this.adFormEditId) {
        const idx = this.adList.findIndex(x => x.id === this.adFormEditId)
        if (idx >= 0) {
          this.$set(this.adList, idx, { ...this.adList[idx], ...payload })
        }
        uni.showToast({ title: '已保存：' + name, icon: 'none' })
      } else {
        this.adList.unshift(payload)
        uni.showToast({ title: '已添加：' + name, icon: 'success' })
      }
      this.closeAdForm()
    },
    onAdd() { this.openAdForm('add') },
    onEdit(ad) {
      const target = this.adList.find(x => x.id === ad.id) || ad
      this.openAdForm('edit', target)
    },
    onDelete(ad) {
      uni.showModal({
        title: '确认删除',
        content: '确定删除「' + ad.name + '」吗？',
        success: (res) => {
          if (res.confirm) {
            const idx = this.adList.findIndex(x => x.id === ad.id)
            if (idx >= 0) this.adList.splice(idx, 1)
            uni.showToast({ title: '已删除', icon: 'success' })
          }
        }
      })
    },
    onBatchEdit() {
      const list = this.checkedAds()
      if (!list.length) {
        uni.showToast({ title: '请先选择广告', icon: 'none' })
        return
      }
      if (list.length === 1) {
        const target = this.adList.find(x => x.id === list[0].id) || list[0]
        this.openAdForm('edit', target)
        return
      }
      uni.showToast({ title: '请一次选择 1 条进行编辑', icon: 'none' })
    },
    onBatchDelete() {
      const list = this.checkedAds()
      if (!list.length) {
        uni.showToast({ title: '请先选择广告', icon: 'none' })
        return
      }
      uni.showModal({
        title: '确认删除',
        content: '确定删除选中的 ' + list.length + ' 条广告吗？',
        success: (res) => {
          if (res.confirm) {
            const ids = list.map(a => a.id)
            this.adList = this.adList.filter(a => !ids.includes(a.id))
            uni.showToast({ title: '已删除', icon: 'success' })
          }
        }
      })
    },
    applyPageSearch() {
      this.pageApplied = { ...this.pageFilter }
      this.pagePageNum = 1
    },
    resetPageFilter() {
      this.pageFilter = { name: '', type: '', status: '' }
      this.pageApplied = { name: '', type: '', status: '' }
      this.pagePageNum = 1
    },
    onPagePageSizeChange(e) {
      this.pageSize = this.pageSizeList[e.detail.value]
      this.pagePageNum = 1
    },
    pagePrev() { if (this.pagePageNum > 1) this.pagePageNum-- },
    pageNext() { if (this.pagePageNum < this.pageMaxPage) this.pagePageNum++ },
    togglePageCheckAll(e) {
      const checked = e.detail.value && e.detail.value.length > 0
      this.displayPageList.forEach(p => { this.$set(p, '_checked', checked) })
    },
    togglePageRow(pg) { this.$set(pg, '_checked', !pg._checked) },
    checkedPages() { return this.pageList.filter(p => p._checked) },
    persistPageList() {
      this.pageList = saveDecorPageList(this.pageList).map((p) => ({ ...p, _checked: false }))
    },
    onPageAdd() { this.openPageAddForm('add') },
    onPageGen() { this.openPageGenForm() },
    onPagePreview(pg) {
      const target = this.pageList.find(x => x.id === pg.id) || pg
      let modules = Array.isArray(target.modules) ? target.modules : []
      if (!modules.length) {
        const name = target.name || '精选专题'
        modules = [
          { type: 'banner', title: name + ' 专属会场', subtitle: '页面路径预览 · ' + (target.path || '') },
          { type: 'hero', title: name, text: '这是「' + name + '」在 App 端按页面路径打开后的效果预览。', cta: '立即选购' },
          { type: 'grid', title: '编辑推荐', items: [name + ' 热销', name + ' 新品', name + ' 套装', name + ' 限时'] },
          { type: 'cta', title: '进入会场', subtitle: target.path || '', cta: '马上逛逛' }
        ]
      }
      this.pageContentData = {
        id: target.id,
        name: target.name,
        type: target.type,
        path: target.path || '',
        modules
      }
      this.pageContentVisible = true
    },
    onPageEdit(pg) {
      const target = this.pageList.find(x => x.id === pg.id) || pg
      this.openPageAddForm('edit', target)
    },
    onPageDelete(pg) {
      uni.showModal({
        title: '确认删除',
        content: '确定删除「' + pg.name + '」吗？',
        success: (res) => {
          if (res.confirm) {
            const idx = this.pageList.findIndex(x => x.id === pg.id)
            if (idx >= 0) this.pageList.splice(idx, 1)
            this.persistPageList()
            uni.showToast({ title: '已删除', icon: 'success' })
          }
        }
      })
    },
    onPageBatchEdit() {
      const list = this.checkedPages()
      if (!list.length) {
        uni.showToast({ title: '请先选择页面', icon: 'none' })
        return
      }
      if (list.length === 1) {
        this.onPageEdit(list[0])
        return
      }
      uni.showToast({ title: '请一次选择 1 条进行编辑', icon: 'none' })
    },
    onPageBatchDelete() {
      const list = this.checkedPages()
      if (!list.length) return uni.showToast({ title: '请先选择页面', icon: 'none' })
      uni.showModal({
        title: '确认删除',
        content: '确定删除选中的 ' + list.length + ' 个页面吗？',
        success: (res) => {
          if (res.confirm) {
            const ids = list.map(p => p.id)
            this.pageList = this.pageList.filter(p => !ids.includes(p.id))
            this.persistPageList()
            uni.showToast({ title: '已删除', icon: 'success' })
          }
        }
      })
    },
    openPageGenForm() {
      this.pageGenForm = {
        name: '',
        type: '专题页',
        tone: '专业',
        options: { grid: true, story: true, video: true, coupon: true, tasks: true, article: true, tags: true, related: true }
      }
      this.pageGenVisible = true
    },
    closePageGenForm() {
      this.pageGenVisible = false
      this.pageGenLoading = false
    },
    openPageAddForm(mode, pg) {
      this.pageAddFormMode = mode === 'edit' ? 'edit' : 'add'
      this.pageAddEditId = mode === 'edit' && pg ? pg.id : ''
      this.pageAddActiveCat = null
      this.pageAddRailCollapsed = false
      this.pageAddSelected = null
      this.pageAddPageComps = []
      this.pageAddUid = 0
      this.pageAddPropsTab = 'style'
      this.pageAddDataDrop = false
      this.pageAddCatDrop = false
      if (mode === 'edit' && pg) {
        this.pageAddMeta = {
          name: pg.name || '',
          type: pg.type || '专题页',
          path: pg.path || '',
          status: pg.status || '草稿',
          statusKey: pg.statusKey || 'draft'
        }
        const modules = Array.isArray(pg.modules) ? pg.modules : []
        this.pageAddPageComps = modules.map((m) => this.moduleToPageComp(m))
        this.pageAddSelected = this.pageAddPageComps[0] || null
        if (this.pageAddSelected) {
          this.pageAddActiveCat = this.pageAddSelected.catId || null
        }
      } else {
        this.pageAddMeta = { name: '', type: '专题页', path: '', status: '草稿', statusKey: 'draft' }
      }
      this.pageAddVisible = true
    },
    moduleToPageComp(m) {
      this.pageAddUid += 1
      const catId = m.catId || 'other'
      const fieldsDef = this.pageAddFields[catId] || this.pageAddFields.other
      const fields = {}
      fieldsDef.forEach((f) => { fields[f.key] = !!f.on })
      const styleKeys = (this.pageAddStyles || []).map((s) => s.key)
      const key = styleKeys.indexOf(m.type) >= 0 ? m.type : (m.type || 'banner')
      return {
        uid: this.pageAddUid,
        catId,
        key,
        name: m.name || m.title || key,
        align: 'left',
        fields,
        data: {
          mode: m.mode || 'manual',
          sub: (m.cats && m.cats.length) ? 'cat' : 'item',
          title: m.title || '',
          items: Array.isArray(m.items) ? m.items.slice() : [],
          cats: Array.isArray(m.cats) ? m.cats.slice() : [],
          rule: m.rule || 'behavior'
        }
      }
    },
    closePageAddForm() {
      this.pageAddVisible = false
      this.pageAddFormMode = 'add'
      this.pageAddEditId = ''
      this.pageAddMeta = { name: '', type: '专题页', path: '', status: '草稿', statusKey: 'draft' }
    },
    togglePageAddRail() {
      this.pageAddRailCollapsed = !this.pageAddRailCollapsed
    },
    selectPageAddCat(catId) {
      this.pageAddActiveCat = catId
    },
    getActivePageAddCat() {
      return this.pageAddMenu.find((c) => c.id === this.pageAddActiveCat) || null
    },
    addPageComp(st) {
      const cat = this.getActivePageAddCat()
      if (!cat) return
      this.pageAddUid += 1
      const fields = this.pageAddFields[cat.id] || this.pageAddFields.other
      const cpFields = {}
      fields.forEach((f) => { cpFields[f.key] = !!f.on })
      const cp = {
        uid: this.pageAddUid,
        catId: cat.id,
        key: st.key,
        name: st.name + cat.suffix,
        align: 'left',
        fields: cpFields,
        data: { mode: 'manual', sub: 'item', title: '', items: [], cats: [], rule: 'behavior' }
      }
      this.pageAddPageComps.push(cp)
      this.pageAddSelected = cp
      this.pageAddPropsTab = 'style'
      this.pageAddDataDrop = false
      this.pageAddCatDrop = false
    },
    removePageComp(cp) {
      this.pageAddPageComps = this.pageAddPageComps.filter((c) => c.uid !== cp.uid)
      if (this.pageAddSelected && this.pageAddSelected.uid === cp.uid) {
        this.pageAddSelected = null
      }
    },
    selectPageComp(cp) {
      this.pageAddSelected = cp
      this.pageAddPropsTab = 'style'
      this.pageAddDataDrop = false
      this.pageAddCatDrop = false
    },
    // 属性配置 · 样式管理
    getPageAddSelectedFields() {
      if (!this.pageAddSelected) return []
      return this.pageAddFields[this.pageAddSelected.catId] || this.pageAddFields.other
    },
    toggleCompField(key) {
      if (this.pageAddSelected) {
        this.pageAddSelected.fields[key] = !this.pageAddSelected.fields[key]
      }
    },
    // 属性配置 · 数据面板
    getActiveCatName() {
      const cat = this.getActivePageAddCat()
      return cat ? cat.name : '内容'
    },
    getSubOptions() {
      const n = this.getActiveCatName()
      return [
        { key: 'module', label: '关联' + n + '模块' },
        { key: 'item', label: '选' + n },
        { key: 'cat', label: '选分类' }
      ]
    },
    getActiveCatSamples() {
      if (!this.pageAddSelected) return []
      return this.pageAddSamples[this.pageAddSelected.catId] || this.pageAddSamples.other
    },
    // 选商品下拉选项：商品分类取商品列表（含名称/价格），其他分类沿用示例
    getItemOptions() {
      if (!this.pageAddSelected) return []
      if (this.pageAddSelected.catId === 'product') {
        return this.pageAddProdOptions
      }
      return this.getActiveCatSamples().map((s) => ({ key: s, label: s }))
    },
    // 选分类下拉选项：商品分类取自商品列表分类字段
    getCatOptions() {
      if (!this.pageAddSelected) return []
      if (this.pageAddSelected.catId === 'product') {
        const seen = {}
        const cats = []
        this.pageAddProdOptions.forEach((p) => {
          if (p.cat && !seen[p.cat]) {
            seen[p.cat] = true
            cats.push(p.cat)
          }
        })
        return cats
      }
      return ['热门分类', '新品分类', '推荐分类']
    },
    toggleDataItem(key) {
      if (!this.pageAddSelected) return
      const items = this.pageAddSelected.data.items
      const i = items.indexOf(key)
      if (i >= 0) {
        items.splice(i, 1)
      } else {
        items.push(key)
      }
    },
    toggleDataCat(c) {
      if (!this.pageAddSelected) return
      const cats = this.pageAddSelected.data.cats
      const i = cats.indexOf(c)
      if (i >= 0) {
        cats.splice(i, 1)
      } else {
        cats.push(c)
      }
    },
    // 页面配置项摘要：确认后显示已选商品/分类/规则
    hasCompSummary(cp) {
      const d = cp.data || {}
      return !!(d.title || (d.items && d.items.length) || (d.cats && d.cats.length) || d.mode === 'rule')
    },
    resolvePageProds(cp) {
      const keys = (cp.data && cp.data.items) || []
      return keys.map((key) => {
        const p = this.pageAddProdOptions.find((o) => o.key === key)
        if (!p) return null
        return {
          key,
          label: p.label,
          img: p.img || p.cover || '',
          priceText: '¥' + Math.round(Number(p.price) || 0)
        }
      }).filter(Boolean)
    },
    compSummaryItems(cp) {
      return (cp.data && cp.data.items ? cp.data.items : []).slice(0, 3)
    },
    getProdName(key) {
      const p = this.pageAddProdOptions.find((o) => o.key === key)
      return p ? p.label : key
    },
    ruleLabel(rule) {
      return { behavior: '按行为', sales: '按销量', praise: '按好评度' }[rule] || ''
    },
    onDataConfirm() {
      uni.showToast({ title: '已同步到页面配置预览', icon: 'none' })
    },
    getPageAddPath() {
      if (this.pageAddFormMode === 'edit' && this.pageAddMeta.path) {
        return this.pageAddMeta.path
      }
      if (!this.pageAddSelected) return ''
      return '/pages/custom-page?id=' + ('0000' + this.pageAddSelected.uid).slice(-5)
    },
    submitPageAdd() {
      if (!this.pageAddPageComps.length) {
        uni.showToast({ title: '页面配置为空，请先添加组件', icon: 'none' })
        return
      }
      const now = new Date()
      const pad = (n) => (n < 10 ? '0' : '') + n
      const timeStr = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate())
        + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes())
      const modules = this.pageAddPageComps.map((cp) => ({
        type: cp.key,
        title: (cp.data && cp.data.title) || cp.name,
        catId: cp.catId,
        items: (cp.data && cp.data.items) ? cp.data.items.slice() : [],
        cats: (cp.data && cp.data.cats) ? cp.data.cats.slice() : [],
        mode: (cp.data && cp.data.mode) || 'manual',
        rule: (cp.data && cp.data.rule) || '',
        name: cp.name
      }))
      let pageId = ''
      if (this.pageAddFormMode === 'edit' && this.pageAddEditId) {
        const idx = this.pageList.findIndex(x => x.id === this.pageAddEditId)
        if (idx < 0) {
          uni.showToast({ title: '列表项不存在，无法保存', icon: 'none' })
          return
        }
        const prev = this.pageList[idx]
        pageId = prev.id
        this.$set(this.pageList, idx, {
          ...prev,
          name: this.pageAddMeta.name || prev.name,
          type: this.pageAddMeta.type || prev.type,
          path: this.pageAddMeta.path || prev.path,
          status: this.pageAddMeta.status || prev.status,
          statusKey: this.pageAddMeta.statusKey || prev.statusKey,
          updateTime: timeStr,
          modules,
          _checked: !!prev._checked
        })
      } else {
        pageId = 'PG' + String(Date.now()).slice(-8)
        this.pageList.unshift({
          id: pageId,
          name: '自定义页-' + pageId.slice(-4),
          type: '专题页',
          path: '/pages/custom/' + pageId,
          status: '草稿',
          statusKey: 'draft',
          updateTime: timeStr,
          modules,
          _checked: false
        })
      }
      saveDecorPageList(this.pageList)
      // 关闭弹窗，定位到下方列表对应项
      this.closePageAddForm()
      this.pageFilter = { name: '', type: '', status: '' }
      this.pageApplied = { name: '', type: '', status: '' }
      this.pagePageNum = 1
      this.currentTab = 'page'
      this.focusPageListRow(pageId)
      uni.showToast({ title: '页面已保存', icon: 'none' })
    },
    focusPageListRow(pageId) {
      if (this.pageHighlightTimer) {
        clearTimeout(this.pageHighlightTimer)
        this.pageHighlightTimer = null
      }
      this.pageHighlightId = pageId
      this.$nextTick(() => {
        try {
          const el = typeof document !== 'undefined'
            ? document.getElementById('page-row-' + pageId)
            : null
          if (el && typeof el.scrollIntoView === 'function') {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          } else {
            uni.createSelectorQuery()
              .in(this)
              .select('#page-row-' + pageId)
              .boundingClientRect((rect) => {
                if (!rect) return
                uni.pageScrollTo({
                  scrollTop: Math.max(0, (rect.top || 0) + (rect.scrollTop || 0) - 120),
                  duration: 300
                })
              })
              .exec()
          }
        } catch (e) { /* ignore */ }
      })
      this.pageHighlightTimer = setTimeout(() => {
        this.pageHighlightId = ''
        this.pageHighlightTimer = null
      }, 2600)
    },
    onPageGenTypeChange(idx) {
      this.pageGenForm.type = this.pageGenTypeOptions[idx]
      this.syncPageGenOptions()
    },
    onPageGenToneChange(idx) {
      this.pageGenForm.tone = this.pageGenToneOptions[idx]
    },
    syncPageGenOptions() {
      const t = this.pageGenForm.type
      const valid = {
        专题页: ['grid', 'story'],
        活动页: ['coupon', 'tasks'],
        品牌页: ['grid', 'story', 'video'],
        内容页: ['article', 'tags', 'related']
      }[t] || []
      const allKeys = ['grid', 'story', 'video', 'coupon', 'tasks', 'article', 'tags', 'related']
      allKeys.forEach((k) => {
        if (!valid.includes(k)) this.pageGenForm.options[k] = false
        else if (this.pageGenForm.options[k] === false) this.pageGenForm.options[k] = true
      })
    },
    onPageGenToggleOption(key) {
      this.$set(this.pageGenForm.options, key, !this.pageGenForm.options[key])
    },
    pageGenOptionList() {
      const t = this.pageGenForm.type
      return {
        专题页: [
          { key: 'grid', label: '产品推荐网格' },
          { key: 'story', label: '专题内容指南' }
        ],
        活动页: [
          { key: 'coupon', label: '优惠券领取' },
          { key: 'tasks', label: '任务打卡赢礼' }
        ],
        品牌页: [
          { key: 'story', label: '品牌故事' },
          { key: 'video', label: '品牌视频' },
          { key: 'grid', label: '明星单品系列' }
        ],
        内容页: [
          { key: 'article', label: '精选文章列表' },
          { key: 'tags', label: '热门标签' },
          { key: 'related', label: '相关推荐' }
        ]
      }[t] || []
    },
    submitPageGen() {
      const name = (this.pageGenForm.name || '').trim()
      if (!name) return uni.showToast({ title: '请输入页面主题', icon: 'none' })
      this.pageGenLoading = true
      setTimeout(() => {
        const newPage = generatePageContent({
          name,
          type: this.pageGenForm.type,
          tone: this.pageGenForm.tone,
          options: { ...this.pageGenForm.options }
        }, this.pageList)
        this.pageList.push({ ...newPage, _checked: false })
        this.persistPageList()
        this.pageGenLoading = false
        this.closePageGenForm()
        uni.showToast({ title: '已生成：' + name, icon: 'success' })
        this.$nextTick(() => {
          this.pageContentData = {
            id: newPage.id,
            name: newPage.name,
            type: newPage.type,
            path: newPage.path || '',
            modules: newPage.modules
          }
          this.pageContentVisible = true
        })
      }, 600)
    },
    closePageContent() {
      this.pageContentVisible = false
    },
    pageModuleIcon(type) {
      const map = {
        banner: '🖼', hero: '✨', grid: '▦', story: '📖', video: '▶',
        coupon: '🎟', countdown: '⏰', task: '✓', article: '📝',
        tags: '#', related: '🔗', cta: '👉'
      }
      return map[type] || '•'
    },
    pageModuleTypeLabel(type) {
      const map = {
        banner: '横幅 Banner', hero: '主视觉 Hero', grid: '产品网格', story: '图文故事',
        video: '视频模块', coupon: '优惠券', countdown: '倒计时', task: '任务列表',
        article: '文章列表', tags: '标签云', related: '相关推荐', cta: '行动号召 CTA'
      }
      return map[type] || type
    },
    applyEntrySearch() {
      this.entryApplied = { ...this.entryFilter }
      this.entryPageNum = 1
    },
    resetEntryFilter() {
      this.entryFilter = { name: '', position: '', visible: '' }
      this.entryApplied = { name: '', position: '', visible: '' }
      this.entryPageNum = 1
    },
    switchEntryScope(scope) {
      this.entryScope = scope
      this.resetEntryFilter()
    },
    onEntryPageSizeChange(e) {
      this.pageSize = this.pageSizeList[e.detail.value]
      this.entryPageNum = 1
    },
    entryPrev() { if (this.entryPageNum > 1) this.entryPageNum-- },
    entryNext() { if (this.entryPageNum < this.entryMaxPage) this.entryPageNum++ },
    toggleEntryCheckAll(e) {
      const checked = e.detail.value && e.detail.value.length > 0
      this.displayEntryList.forEach(en => { this.$set(en, '_checked', checked) })
    },
    toggleEntryRow(en) { this.$set(en, '_checked', !en._checked) },
    checkedEntries() { return this.entryList.filter(e => e._checked) },
    nextEntryId() {
      let max = 10000
      this.entryList.forEach(en => {
        const n = parseInt(String(en.id).replace(/\D/g, ''), 10)
        if (!isNaN(n) && n > max) max = n
      })
      return 'EN' + (max + 1)
    },
    nextEntrySort(scope) {
      const scoped = this.entryList.filter(en => en.scope === scope)
      if (!scoped.length) return 1
      return Math.max(...scoped.map(en => Number(en.sort) || 0)) + 1
    },
    normalizeEntryLinkType(val) {
      if (!val) return this.entryLinkTypeOptions[0]
      return this.entryLinkTypeOptions.includes(val) ? val : this.entryLinkTypeOptions[0]
    },
    entryPathDisplay(en) {
      if (!en) return ''
      if (en.linkUrl) return (en.path || '') + ' · ' + shortenEntryLink(en.linkUrl)
      return en.path || ''
    },
    onEntryLinkTypeChange(e) {
      const next = this.entryLinkTypeOptions[e.detail.value]
      this.entryForm.path = next
      this.entryForm.linkUrl = ''
    },
    onEntryProductLinkChange(e) {
      const opt = this.entryProductLinkOptions[e.detail.value]
      this.entryForm.linkUrl = opt ? opt.value : ''
    },
    onEntryActivityLinkChange(e) {
      const opt = this.entryActivityLinkOptions[e.detail.value]
      this.entryForm.linkUrl = opt ? opt.value : ''
    },
    onEntryPageLinkChange(e) {
      const opt = this.entryPageLinkOptions[e.detail.value]
      this.entryForm.linkUrl = opt ? opt.value : ''
    },
    openEntryForm(mode, en) {
      this.entryFormMode = mode
      this.entryFormEditId = en ? en.id : ''
      const scope = this.entryScope
      const posOpts = this.entryFormPosOptions
      if (mode === 'edit' && en) {
        this.entryForm = {
          id: en.id,
          name: en.name,
          icon: en.icon || 'skin.svg',
          iconUrl: en.iconUrl || '',
          position: en.position,
          path: this.normalizeEntryLinkType(en.path),
          linkUrl: en.linkUrl || '',
          sort: String(en.sort),
          visible: !!en.visible
        }
      } else {
        this.entryForm = {
          id: this.nextEntryId(),
          name: '',
          icon: 'skin.svg',
          iconUrl: '',
          position: posOpts[0],
          path: this.entryLinkTypeOptions[0],
          linkUrl: '',
          sort: String(this.nextEntrySort(scope)),
          visible: true
        }
      }
      this.entryFormVisible = true
    },
    closeEntryForm() {
      this.entryFormVisible = false
      this.entryFormEditId = ''
    },
    chooseEntryIcon() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const path = res.tempFilePaths && res.tempFilePaths[0]
          if (!path) return
          uni.getFileSystemManager().readFile({
            filePath: path,
            encoding: 'base64',
            success: (r) => {
              const lower = path.toLowerCase()
              let mime = 'image/jpeg'
              if (lower.endsWith('.png')) mime = 'image/png'
              else if (lower.endsWith('.svg')) mime = 'image/svg+xml'
              else if (lower.endsWith('.webp')) mime = 'image/webp'
              this.entryForm.iconUrl = 'data:' + mime + ';base64,' + r.data
              this.entryForm.icon = ''
              uni.showToast({ title: '图标已上传', icon: 'none' })
            },
            fail: () => {
              this.entryForm.iconUrl = path
              this.entryForm.icon = ''
              uni.showToast({ title: '图标已上传', icon: 'none' })
            }
          })
        }
      })
    },
    onEntryPosPreview() {
      uni.showToast({ title: '预览展示位置：' + (this.entryForm.position || '未选择'), icon: 'none' })
    },
    submitEntryForm() {
      const name = (this.entryForm.name || '').trim()
      const linkType = this.entryForm.path
      const linkUrl = (this.entryForm.linkUrl || '').trim()
      if (!name) return uni.showToast({ title: '请输入入口名称', icon: 'none' })
      if (!linkType) return uni.showToast({ title: '请选择跳转路径', icon: 'none' })
      const prev = this.entryFormEditId
        ? this.entryList.find(x => x.id === this.entryFormEditId)
        : null
      const keepActionFallback = !!(prev && prev.actionKey) && this.entryFormMode === 'edit'
      if (!linkUrl && !keepActionFallback) {
        if (linkType === '选择指定商品') {
          return uni.showToast({ title: '请选择商品链接', icon: 'none' })
        }
        if (linkType === '指定活动') {
          return uni.showToast({ title: '请选择活动链接', icon: 'none' })
        }
        if (linkType === '自定页面') {
          return uni.showToast({ title: '请选择页面链接', icon: 'none' })
        }
        if (linkType === '跳转网址') {
          return uni.showToast({ title: '请输入链接地址', icon: 'none' })
        }
      }
      const payload = {
        id: this.entryForm.id,
        name,
        icon: this.entryForm.iconUrl ? '' : (this.entryForm.icon || (prev && prev.icon) || 'skin.svg'),
        iconUrl: this.entryForm.iconUrl || '',
        position: this.entryForm.position,
        path: linkType,
        linkUrl,
        sort: parseInt(this.entryForm.sort, 10) || 1,
        visible: !!this.entryForm.visible,
        scope: this.entryScope,
        actionKey: (prev && prev.actionKey) || ''
      }
      if (this.entryFormMode === 'edit' && this.entryFormEditId) {
        const idx = this.entryList.findIndex(x => x.id === this.entryFormEditId)
        if (idx >= 0) {
          this.$set(this.entryList, idx, { ...this.entryList[idx], ...payload })
        }
        uni.showToast({ title: '已保存：' + name, icon: 'none' })
      } else {
        this.entryList.push(payload)
        normalizeScopeEntrySort(this.entryList, this.entryScope)
        uni.showToast({ title: '已添加：' + name, icon: 'success' })
      }
      this.persistEntryList()
      this.closeEntryForm()
    },
    onEntryAdd() { this.openEntryForm('add') },
    onEntryEdit(en) {
      const target = this.entryList.find(x => x.id === en.id) || en
      this.openEntryForm('edit', target)
    },
    canEntryMoveUp(en) {
      return getEntryMoveState(this.entryList, en, this.filteredEntryList).canMoveUp
    },
    canEntryMoveDown(en) {
      return getEntryMoveState(this.entryList, en, this.filteredEntryList).canMoveDown
    },
    onEntryMove(en, direction) {
      const result = moveEntryInList(this.entryList, en.id, direction, this.filteredEntryList)
      if (!result.ok) {
        return uni.showToast({ title: result.message, icon: 'none' })
      }
      uni.showToast({ title: result.message, icon: 'none' })
      this.persistEntryList()
    },
    onEntrySort() {
      normalizeScopeEntrySort(this.entryList, this.entryScope)
      this.persistEntryList()
      uni.showToast({ title: '已整理当前菜单排序', icon: 'none' })
    },
    onEntryToggle(en) {
      this.$set(en, 'visible', !en.visible)
      this.persistEntryList()
      uni.showToast({ title: (en.visible ? '已显示：' : '已隐藏：') + en.name, icon: 'none' })
    },
    onEntryDelete(en) {
      uni.showModal({
        title: '确认删除',
        content: '确定删除「' + en.name + '」吗？',
        success: (res) => {
          if (res.confirm) {
            const idx = this.entryList.findIndex(x => x.id === en.id)
            if (idx >= 0) this.entryList.splice(idx, 1)
            this.persistEntryList()
            uni.showToast({ title: '已删除', icon: 'success' })
          }
        }
      })
    },
    onEntryBatchEdit() {
      const list = this.checkedEntries()
      if (!list.length) {
        uni.showToast({ title: '请先选择入口', icon: 'none' })
        return
      }
      if (list.length === 1) {
        const target = this.entryList.find(x => x.id === list[0].id) || list[0]
        this.openEntryForm('edit', target)
        return
      }
      uni.showToast({ title: '请一次选择 1 条进行编辑', icon: 'none' })
    },
    onEntryBatchDelete() {
      const list = this.checkedEntries()
      if (!list.length) return uni.showToast({ title: '请先选择入口', icon: 'none' })
      uni.showModal({
        title: '确认删除',
        content: '确定删除选中的 ' + list.length + ' 个入口吗？',
        success: (res) => {
          if (res.confirm) {
            const ids = list.map(e => e.id)
            this.entryList = this.entryList.filter(e => !ids.includes(e.id))
            this.persistEntryList()
            uni.showToast({ title: '已删除', icon: 'success' })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.decor-panel {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
}

.decor-page-header {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 32rpx 40rpx 24rpx;
  box-shadow: 0 4rpx 20rpx rgba($primary-color, 0.06);
}

.decor-page-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #111;
  margin-bottom: 8rpx;
}

.decor-page-sub {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.tab-bar {
  display: flex;
  background: #fff;
  padding: 0 40rpx;
  border-bottom: 1rpx solid #F0ECFA;
}

.tab-item {
  position: relative;
  padding: 28rpx 32rpx;
  font-size: 28rpx;
  color: #888;
  font-weight: 500;

  &.active {
    color: $primary-dark;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 0;
      transform: translateX(-50%);
      width: 56rpx;
      height: 6rpx;
      border-radius: 4rpx;
      background: linear-gradient(90deg, $primary-color, $primary-light);
    }
  }
}

.tab-body {
  background: #fff;
  border-radius: 0 0 24rpx 24rpx;
  padding: 24rpx 32rpx 32rpx;
  box-shadow: 0 4rpx 20rpx rgba($primary-color, 0.06);
}

.entry-tab-body {
  padding: 0;
  overflow: hidden;
}

.entry-layout {
  display: flex;
  align-items: stretch;
  min-height: 720rpx;
}

.entry-subnav {
  width: 220rpx;
  flex-shrink: 0;
  background: #FAFAFE;
  border-right: 1rpx solid #F0ECFA;
  padding: 24rpx 0;
}

.entry-sub-item {
  padding: 24rpx 20rpx 24rpx 28rpx;
  font-size: 26rpx;
  color: #666;
  line-height: 1.55;
  border-left: 6rpx solid transparent;

  &.active {
    color: $primary-dark;
    font-weight: 600;
    background: #fff;
    border-left-color: $primary-color;
  }
}

.entry-main {
  flex: 1;
  min-width: 0;
  padding: 24rpx 32rpx 32rpx;
  overflow: auto;
}

.filter-bar {
  background: $purple-surface;
  border-radius: 16rpx;
  padding: 24rpx 28rpx 12rpx;
  margin-bottom: 24rpx;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20rpx 24rpx;
  margin-bottom: 16rpx;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.filter-label {
  font-size: 24rpx;
  color: #666;
  white-space: nowrap;
}

.filter-input {
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 20rpx;
  border-radius: 12rpx;
  background: #fff;
  font-size: 24rpx;
  color: #333;
  width: 280rpx;
}

.filter-picker, .filter-date {
  display: flex;
  align-items: center;
}

.filter-picker .placeholder, .filter-date:empty {
  color: #999;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.filter-date {
  width: 220rpx;
  text-align: center;
  color: #333;
}

.range-sep {
  color: #ccc;
  font-size: 24rpx;
}

.filter-actions {
  display: flex;
  gap: 16rpx;
  margin-left: auto;
}

.filter-more {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8rpx;
  font-size: 24rpx;
  color: $primary-color;
  padding: 8rpx 0 4rpx;
}

.more-arrow {
  transition: transform 0.2s;
  &.up { transform: rotate(180deg); }
}

.btn {
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 28rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  display: inline-flex;
  align-items: center;
}

.btn-primary {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  color: #fff;
  font-weight: 500;
}

.btn-default {
  background: #fff;
  color: #555;
  border: 1rpx solid #E0DAEE;
}

.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.action-left {
  display: flex;
  gap: 16rpx;
}

.total-hint {
  font-size: 24rpx;
  color: #888;
}

.list-wrap {
  background: #fff;
  border-radius: 16rpx;
  border: 1rpx solid #F0ECFA;
  overflow: hidden;
}

.list-scroll { width: 100%; white-space: nowrap; }

.list-table {
  display: inline-block;
  min-width: 2400rpx;
  font-size: 24rpx;
}

.list-tr { display: flex; align-items: stretch; }

.list-tr.row-highlight {
  background: #F0ECFF;
  box-shadow: inset 0 0 0 2rpx #8B7CF6;
  transition: background 0.35s ease;
}

.list-th { background: #FAF8FF; }

.list-th .list-td { font-weight: 600; color: #555; }

.list-td {
  padding: 22rpx 20rpx;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  box-sizing: border-box;
}

.col-check { width: 80rpx; justify-content: center; }
.col-d-op { width: 180rpx; }
.col-d-id { width: 180rpx; }
.col-d-pos { width: 280rpx; }
.col-d-name { width: 320rpx; }
.col-d-cover { width: 160rpx; }
.col-d-status { width: 160rpx; }
.col-d-link { width: 360rpx; min-width: 360rpx; }

.row-ops { display: flex; align-items: center; gap: 8rpx; }

.op-link {
  font-size: 24rpx;
  color: #4A3CB0;
  &.danger { color: #FF5B6B; }
  &.disabled { color: #D1D5DB; pointer-events: none; }
}

.op-sep { color: #D1D5DB; font-size: 22rpx; }

.mono { font-family: Consolas, Menlo, monospace; font-size: 22rpx; color: #666; }

.name-text { font-weight: 500; color: #222; }

.link-text { font-size: 22rpx; color: #4A3CB0; word-break: break-all; white-space: normal; line-height: 1.4; }

.cover-thumb {
  width: 120rpx;
  height: 72rpx;
  border-radius: 8rpx;
  overflow: hidden;
  background: #F7F5FC;
}

.cover-thumb image { width: 100%; height: 100%; display: block; }

.ad-status {
  display: inline-block;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.ad-pending { background: #FEF3C7; color: #92400E; }
.ad-online { background: #D1FAE5; color: #065F46; }
.ad-offline { background: #FEE2E2; color: #991B1B; }

.pg-published { background: #D1FAE5; color: #065F46; }
.pg-draft { background: #FEF3C7; color: #92400E; }
.pg-offline { background: #FEE2E2; color: #991B1B; }

.en-show { background: #D1FAE5; color: #065F46; }
.en-hide { background: #F3F4F6; color: #6B7280; }

.page-table { min-width: 2200rpx; }
.col-p-op { width: 220rpx; }
.col-p-id { width: 160rpx; }
.col-p-name { width: 280rpx; }
.col-p-type { width: 140rpx; }
.col-p-cover { width: 160rpx; }
.col-p-path { width: 360rpx; }
.col-p-status { width: 140rpx; }
.col-p-time { width: 240rpx; min-width: 240rpx; }

.entry-table { min-width: 2100rpx; }
.col-e-op { width: 320rpx; }
.col-e-id { width: 160rpx; }
.col-e-name { width: 200rpx; }
.col-e-icon { width: 120rpx; justify-content: center; }
.col-e-pos { width: 160rpx; }
.col-e-path { width: 340rpx; }
.col-e-sort { width: 100rpx; justify-content: center; }
.col-e-status { width: 120rpx; }

.type-tag {
  display: inline-block;
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  background: #EDE9FE;
  color: #6D28D9;
}

.time-text { font-size: 22rpx; color: #888; }
.sort-num { font-weight: 600; color: $primary-color; font-size: 26rpx; }

.entry-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.entry-modal-box {
  width: 640rpx;
  max-width: 92vw;
  max-height: 80vh;
  background: #fff;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  box-shadow: 0 16rpx 48rpx rgba($primary-color, 0.18);
}

.entry-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #F0ECFA;
}

.entry-modal-title { font-size: 32rpx; font-weight: 600; color: #111; }
.entry-modal-close { font-size: 40rpx; color: #999; line-height: 1; padding: 0 8rpx; }
.entry-modal-body { padding: 28rpx 32rpx; overflow-y: auto; flex: 1; }
.entry-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  padding: 20rpx 32rpx 28rpx;
  border-top: 1rpx solid #F0ECFA;
}

.modal-form { display: flex; flex-direction: column; gap: 24rpx; }
.modal-form-row { display: flex; align-items: flex-start; gap: 16rpx; }
.modal-form-label {
  width: 140rpx;
  flex-shrink: 0;
  font-size: 26rpx;
  color: #666;
  text-align: right;
  line-height: 64rpx;
}
.modal-form-field { flex: 1; min-width: 0; }
.modal-form-input {
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 20rpx;
  border-radius: 12rpx;
  background: #fff;
  border: 1rpx solid #E8E4F4;
  font-size: 26rpx;
  color: #333;
  width: 100%;
  box-sizing: border-box;
}
.modal-form-input.readonly { background: #F7F5FC; color: #888; }
.modal-form-picker { display: flex; align-items: center; }
.modal-form-grow { flex: 1; min-width: 0; }
.modal-form-link-type { width: 220rpx; flex-shrink: 0; }
.modal-form-inline { display: flex; align-items: center; gap: 16rpx; width: 100%; }
.btn-mini {
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 24rpx;
  font-size: 24rpx;
  white-space: nowrap;
  flex-shrink: 0;
}

.modal-form-row-top { align-items: flex-start; }
.modal-form-row-top .modal-form-label { line-height: 72rpx; }

.entry-icon-upload {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16rpx;
}

.entry-icon-upload-preview {
  width: 72rpx;
  height: 72rpx;
  border-radius: 12rpx;
  background: #F5F3FF;
  border: 1rpx dashed #D8D0F0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx;
  flex-shrink: 0;
}

.entry-icon-upload-preview image { width: 100%; height: 100%; }
.entry-icon-upload-tip { font-size: 22rpx; color: #999; }

.entry-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  border-radius: 14rpx;
  background: #F5F3FF;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx;
}

.entry-icon-wrap image { width: 100%; height: 100%; }

.pagination {
  padding: 24rpx 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1rpx solid #F0ECFA;
}

.total-text { font-size: 24rpx; color: #888; }
.total-text .b { color: $primary-color; font-weight: 600; }

.pager-wrap { display: flex; align-items: center; gap: 20rpx; }

.pager { display: flex; gap: 12rpx; }

.page-btn {
  padding: 0 20rpx;
  height: 56rpx;
  line-height: 56rpx;
  border-radius: 10rpx;
  background: $purple-surface;
  font-size: 22rpx;
  color: #555;

  &.disabled { opacity: 0.45; }
}

.page-size-select {
  height: 56rpx;
  line-height: 56rpx;
  padding: 0 16rpx;
  border-radius: 10rpx;
  background: $purple-surface;
  font-size: 22rpx;
  color: #555;
}

.tab-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  padding: 120rpx 40rpx;
  min-height: 400rpx;
}

.tab-empty-icon { font-size: 96rpx; opacity: 0.85; }
.tab-empty-text { font-size: 30rpx; color: #888; font-weight: 500; }
.tab-empty-tip { font-size: 24rpx; color: #BBB; }

/* AI 自动生成按钮 */
.btn-gen {
  background: linear-gradient(135deg, #6D28D9, #8B7CF6);
  color: #fff;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
}
.gen-spark {
  font-size: 24rpx;
  color: #FDE68A;
  margin-right: 2rpx;
}
.btn-loading { opacity: 0.6; pointer-events: none; }

/* 生成弹窗 */
.page-gen-box { width: 680rpx; }

.page-gen-tip {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  background: linear-gradient(135deg, rgba(139, 124, 246, 0.08), rgba(109, 40, 217, 0.06));
  border: 1rpx solid #EDE9FE;
  border-radius: 12rpx;
  padding: 18rpx 20rpx;
  margin-bottom: 24rpx;
}
.page-gen-tip-icon { color: #8B7CF6; font-size: 26rpx; line-height: 1.5; flex-shrink: 0; }
.page-gen-tip-text { font-size: 24rpx; color: #6B5B9E; line-height: 1.55; flex: 1; }

.page-gen-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx 16rpx;
}
.page-gen-opt {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 14rpx 22rpx;
  border-radius: 10rpx;
  background: #F7F5FC;
  border: 1rpx solid #E8E4F4;
  font-size: 24rpx;
  color: #666;
  transition: all 0.18s;

  &.active {
    background: linear-gradient(135deg, #8B7CF6, #6D28D9);
    border-color: transparent;
    color: #fff;
  }
}
.page-gen-opt-check {
  width: 28rpx;
  height: 28rpx;
  line-height: 28rpx;
  text-align: center;
  font-size: 22rpx;
  color: #fff;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
}
.page-gen-opt:not(.active) .page-gen-opt-check { background: #E8E4F4; color: transparent; }
.page-gen-opt-label { white-space: nowrap; }
.page-gen-empty {
  font-size: 24rpx;
  color: #AAA;
  padding: 14rpx 0;
}

/* 页面路径预览弹窗（手机端效果） */
.page-path-preview-box { width: 720rpx; max-height: 90vh; }
.page-path-preview-body { display: flex; flex-direction: column; gap: 24rpx; }
.page-path-preview-meta {
  background: $purple-surface;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.page-path-preview-meta-row { display: flex; align-items: flex-start; gap: 16rpx; }
.page-path-preview-label {
  width: 140rpx; flex-shrink: 0; font-size: 24rpx; color: #888; line-height: 1.5;
}
.page-path-preview-value {
  flex: 1; font-size: 26rpx; color: #222; font-weight: 500; word-break: break-all; line-height: 1.5;
}
.page-path-preview-value.path { color: #6B5CAD; font-size: 22rpx; }
.page-path-phone-wrap { display: flex; justify-content: center; padding: 8rpx 0 16rpx; }
.page-path-phone {
  width: 360rpx;
  height: 720rpx;
  border-radius: 36rpx;
  border: 8rpx solid #2A2438;
  background: #F7F5FC;
  overflow: hidden;
  box-shadow: 0 16rpx 48rpx rgba(80, 60, 140, 0.18);
  display: flex;
  flex-direction: column;
  position: relative;
}
.page-path-phone-notch {
  position: absolute; top: 10rpx; left: 50%; transform: translateX(-50%);
  width: 100rpx; height: 10rpx; border-radius: 8rpx; background: #1a1524; z-index: 2;
}
.page-path-phone-nav {
  height: 72rpx; padding: 18rpx 16rpx 0;
  display: flex; align-items: center; justify-content: space-between;
  background: #fff; border-bottom: 1rpx solid #F0ECF8; flex-shrink: 0;
}
.page-path-phone-back, .page-path-phone-share { width: 40rpx; text-align: center; font-size: 28rpx; color: #333; }
.page-path-phone-title {
  flex: 1; text-align: center; font-size: 22rpx; font-weight: 600; color: #111;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.page-path-phone-scroll { flex: 1; height: 0; background: #F7F5FC; }
.page-path-phone-empty {
  padding: 80rpx 24rpx; display: flex; flex-direction: column; align-items: center; gap: 12rpx;
  font-size: 22rpx; color: #999; text-align: center;
}
.page-path-phone-empty-tip { font-size: 20rpx; color: #BBB; }
.pp-mod { margin-bottom: 12rpx; }
.pp-banner {
  position: relative; min-height: 180rpx;
  background: linear-gradient(135deg, #EDE7FF, #F8E8F0); overflow: hidden;
}
.pp-banner-img { width: 100%; height: 180rpx; }
.pp-banner-fallback { width: 100%; height: 180rpx; }
.pp-banner-mask {
  position: absolute; left: 0; right: 0; bottom: 0; padding: 20rpx 16rpx;
  background: linear-gradient(transparent, rgba(40, 20, 60, 0.55));
}
.pp-banner-title { display: block; font-size: 24rpx; font-weight: 700; color: #fff; }
.pp-banner-sub { display: block; margin-top: 6rpx; font-size: 18rpx; color: rgba(255,255,255,0.9); }
.pp-card {
  margin: 0 12rpx; padding: 16rpx; background: #fff; border-radius: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(120, 90, 180, 0.06);
}
.pp-card-title { display: block; font-size: 22rpx; font-weight: 600; color: #222; }
.pp-card-sub { display: block; margin-top: 6rpx; font-size: 18rpx; color: #888; line-height: 1.4; }
.pp-para { display: block; margin-top: 8rpx; font-size: 18rpx; color: #555; line-height: 1.5; }
.pp-grid { display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 12rpx; }
.pp-grid-item { width: calc(50% - 5rpx); }
.pp-grid-thumb {
  height: 72rpx; border-radius: 10rpx;
  background: linear-gradient(135deg, #F0EBFF, #FDEEF5);
}
.pp-grid-name { display: block; margin-top: 6rpx; font-size: 18rpx; color: #444; }
.pp-coupon {
  margin: 0 12rpx; display: flex; background: #fff; border-radius: 12rpx; overflow: hidden;
}
.pp-coupon-left {
  width: 72rpx; background: linear-gradient(160deg, #8B7CF6, #C4A8F5);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 18rpx; font-weight: 700;
}
.pp-coupon-right { flex: 1; padding: 14rpx; }
.pp-tag-row { display: flex; flex-wrap: wrap; gap: 8rpx; margin-top: 10rpx; }
.pp-tag {
  padding: 4rpx 10rpx; border-radius: 999rpx; background: #F3EFFC;
  font-size: 16rpx; color: #6B5CAD;
}
.pp-cta {
  display: inline-block; margin-top: 12rpx; padding: 8rpx 16rpx;
  background: #8B7CF6; color: #fff; border-radius: 999rpx; font-size: 18rpx;
}
.pp-end { padding: 16rpx 0 28rpx; text-align: center; font-size: 18rpx; color: #C0B8D0; }

/* 内容预览弹窗（兼容旧样式引用） */
.page-content-box { width: 760rpx; }
.page-content-meta {
  background: $purple-surface;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-bottom: 24rpx;
}
.page-content-meta-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.page-content-meta-label {
  width: 140rpx;
  flex-shrink: 0;
  font-size: 24rpx;
  color: #888;
}
.page-content-meta-value {
  font-size: 26rpx;
  color: #222;
  font-weight: 500;
}

.page-content-modules {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.page-content-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 80rpx 0;
  color: #999;
  font-size: 26rpx;
}
.page-content-empty-tip { font-size: 22rpx; color: #BBB; }

.page-content-module {
  border: 1rpx solid #F0ECFA;
  border-radius: 14rpx;
  overflow: hidden;
  background: #fff;
}
.page-content-module-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 18rpx 22rpx;
  background: linear-gradient(135deg, rgba(139, 124, 246, 0.08), rgba(109, 40, 217, 0.04));
  border-bottom: 1rpx solid #F0ECFA;
}
.page-content-module-icon {
  font-size: 28rpx;
  color: #8B7CF6;
  width: 44rpx;
  text-align: center;
  flex-shrink: 0;
}
.page-content-module-type {
  flex: 1;
  font-size: 26rpx;
  font-weight: 600;
  color: #4A3CB0;
}
.page-content-module-idx {
  font-size: 22rpx;
  color: #B0A4D6;
  font-family: Consolas, Menlo, monospace;
}

.page-content-module-body {
  padding: 18rpx 22rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.page-content-line {
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
}
.pc-lbl {
  width: 80rpx;
  flex-shrink: 0;
  font-size: 22rpx;
  color: #999;
  line-height: 1.6;
}
.pc-val {
  flex: 1;
  font-size: 24rpx;
  color: #333;
  line-height: 1.6;
  word-break: break-all;
}
.pc-image {
  width: 200rpx;
  height: 110rpx;
  border-radius: 8rpx;
  overflow: hidden;
  background: #F7F5FC;
  flex: none;
}
.pc-image image { width: 100%; height: 100%; display: block; }

.page-content-line-items,
.page-content-line-paragraphs {
  align-items: flex-start;
}
.pc-items, .pc-paragraphs {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}
.pc-item { font-size: 24rpx; color: #555; line-height: 1.55; }
.pc-paragraph { font-size: 24rpx; color: #555; line-height: 1.6; }

/* 新建页面弹窗（四列白卡片：菜单导航 / 组件 / 页面配置 / 属性配置） */
.page-add-box {
  width: 940rpx;
  max-width: 96vw;
  max-height: 90vh;
}
.page-add-body {
  padding: 24rpx;
  overflow: hidden;
  min-height: 0;
  background: #F4F4F8;
}
.page-add-layout {
  display: flex;
  align-items: stretch;
  gap: 20rpx;
  height: 960rpx;
  max-height: 58vh;
  min-height: 720rpx;
  overflow: hidden;
}
.pa-rail,
.pa-lib,
.pa-page,
.pa-props {
  background: #fff;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(30, 20, 60, 0.06);
}

/* 列1 · 菜单导航 */
.pa-rail { flex: 0 0 13%; width: 13%; }
.pa-rail.collapsed { flex: 0 0 5.5%; width: 5.5%; }
.pa-rail-header {
  height: 88rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  background: #F3EFFC;
  color: #7C5CE0;
  font-size: 28rpx;
  font-weight: 600;
}
.pa-rail-toggle {
  font-size: 22rpx;
  line-height: 1;
  transition: transform 0.2s ease;
}
.pa-rail.collapsed .pa-rail-toggle { transform: rotate(180deg); }
.pa-rail-list { flex: 1; padding: 12rpx; }
.pa-rail-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  color: #555;
  font-size: 28rpx;
  transition: background 0.15s;
}
.pa-rail-item.active {
  background: #F0EAFC;
  color: #7C5CE0;
  font-weight: 600;
}
.pa-rail-icon { font-size: 34rpx; line-height: 1.2; }
.pa-rail-name { white-space: nowrap; }
.pa-rail.collapsed .pa-rail-name { display: none; }
.pa-rail.collapsed .pa-rail-item { justify-content: center; padding: 20rpx 8rpx; }

/* 列头（组件 / 页面配置 / 属性配置 共用） */
.pa-col-header {
  height: 88rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28rpx;
  border-bottom: 1rpx solid #F0ECFA;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}
.pa-page-count { font-size: 24rpx; color: #999; font-weight: 400; }
.pa-col-body { flex: 1; padding: 20rpx; }

/* 三列共用的空状态 */
.pa-col-empty {
  height: 100%;
  min-height: 440rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  text-align: center;
  padding: 24rpx;
}
.pa-col-empty-icon { font-size: 72rpx; line-height: 1.2; opacity: 0.85; }
.pa-col-empty-text { font-size: 26rpx; color: #444; line-height: 1.5; }
.pa-col-empty-tip { font-size: 24rpx; color: #A5A0B8; line-height: 1.5; }

/* 列2 · 组件 */
.pa-lib { flex: 0 0 15%; width: 15%; }
.pa-lib-item {
  background: #fff;
  border: 1rpx solid #E8E4F4;
  border-radius: 20rpx;
  padding: 16rpx;
  margin-bottom: 20rpx;
  transition: border-color 0.15s;
}
.pa-lib-item-name {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #555;
  text-align: center;
}

/* 列3 · 页面配置（最大区域） */
.pa-page { flex: 1 1 0; min-width: 0; }
.pa-page-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.pa-page-item {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 16rpx;
  background: #fff;
  border: 1rpx solid #E8E4F4;
  border-radius: 20rpx;
  padding: 16rpx 20rpx;
  transition: border-color 0.15s;
}
.pa-page-item-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.pa-page-item-preview {
  width: 100%;
}
.pa-browse {
  width: 100%;
  background: #F7F5FC;
  border-radius: 16rpx;
  padding: 12rpx;
  box-sizing: border-box;
  overflow: hidden;
}
.pa-browse-large { display: flex; flex-direction: column; gap: 10rpx; }
.pa-browse-cover {
  width: 100%;
  height: 200rpx;
  border-radius: 12rpx;
  background: #EDE8F8;
}
.pa-browse-name {
  font-size: 22rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pa-browse-price {
  font-size: 22rpx;
  color: #F5487F;
  font-weight: 700;
  margin-top: 4rpx;
}
.pa-browse-grid { display: grid; gap: 12rpx; }
.pa-browse-grid.cols-2 { grid-template-columns: 1fr 1fr; }
.pa-browse-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
.pa-browse-cell {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  border: 1rpx solid #EEEAF5;
  padding-bottom: 8rpx;
}
.pa-browse-cell image {
  width: 100%;
  height: 120rpx;
  background: #EDE8F8;
  display: block;
}
.pa-browse-cell .pa-browse-name,
.pa-browse-cell .pa-browse-price { padding: 0 10rpx; }
.pa-browse-list { display: flex; flex-direction: column; gap: 10rpx; }
.pa-browse-row {
  display: flex;
  gap: 12rpx;
  align-items: center;
  background: #fff;
  border-radius: 12rpx;
  padding: 10rpx;
  border: 1rpx solid #EEEAF5;
}
.pa-browse-row image {
  width: 88rpx;
  height: 88rpx;
  border-radius: 10rpx;
  background: #EDE8F8;
  flex-shrink: 0;
}
.pa-browse-banner image {
  width: 100%;
  height: 140rpx;
  border-radius: 12rpx;
  background: #EDE8F8;
}
.pa-browse-empty {
  font-size: 22rpx;
  color: #999;
  text-align: center;
  padding: 24rpx 12rpx;
}
/* 页面配置项：确认后同步的配置摘要（已选商品/分类/规则） */
.pa-page-item-sum {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 4rpx;
  padding-top: 12rpx;
  border-top: 1rpx dashed #EFEBFA;
}
.pa-sum-title {
  font-size: 22rpx;
  font-weight: 600;
  color: #4E83FD;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pa-sum-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8rpx;
}
.pa-sum-prod {
  display: flex;
  align-items: center;
  background: #F7F5FC;
  border-radius: 10rpx;
  padding: 4rpx 12rpx;
  max-width: 100%;
}
.pa-sum-prod-name {
  font-size: 20rpx;
  color: #444;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 220rpx;
}
.pa-sum-more {
  font-size: 20rpx;
  color: #8A63F2;
  font-weight: 600;
}
.pa-sum-text {
  font-size: 20rpx;
  color: #888;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pa-page-item.selected {
  border-color: $primary-color;
  background: #FAF8FF;
}
.pa-page-item-idx {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #F0EAFC;
  color: #7C5CE0;
  font-size: 22rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.pa-page-item .page-add-comp-preview {
  width: 100%;
  height: auto;
  min-height: 100rpx;
  flex-shrink: 0;
  padding: 12rpx;
  gap: 8rpx;
  border-radius: 12rpx;
  box-sizing: border-box;
}
.pa-page-item .pv-block.thumb { width: 24rpx; height: 24rpx; }
.pa-page-item .pv-line { height: 6rpx; }
.pa-page-item-name {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pa-page-item.selected .pa-page-item-name {
  color: #7C5CE0;
  font-weight: 600;
}
.pa-page-item-del {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #B5AED1;
  font-size: 28rpx;
  line-height: 1;
}
.pa-page-item-del:active {
  background: #FDECEC;
  color: #E05C5C;
}

/* 组件线框预览 */
.page-add-comp-preview {
  height: 152rpx;
  background: #F3F5F9;
  border-radius: 16rpx;
  padding: 16rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  overflow: hidden;
}
.page-add-comp-preview.pv-big {
  width: 100%;
  max-width: 100%;
  height: 192rpx;
  padding: 20rpx;
  gap: 10rpx;
  border: 1rpx solid #E8E4F4;
  background: #F8F9FC;
}
.pv-block { background: #CBD6E6; border-radius: 4rpx; }
.pv-block.area { flex: 1; min-height: 0; }
.pv-block.sq { flex: 1; min-height: 0; }
.pv-block.banner { flex: 1; background: #D9E6F7; }
.pv-block.thumb { width: 32rpx; height: 32rpx; flex: none; }
.page-add-comp-preview.pv-big .pv-block.thumb { width: 48rpx; height: 48rpx; }
.pv-line { height: 8rpx; background: #E2E8F1; border-radius: 4rpx; flex: none; }
.pv-line.short { width: 62%; }
.pv-two { display: grid; grid-template-columns: 1fr 1fr; gap: 8rpx; }
.pv-col { display: flex; flex-direction: column; gap: 6rpx; }
.pv-three { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8rpx; }
.pv-list { justify-content: center; gap: 10rpx; }
.pv-listitem { display: flex; gap: 10rpx; align-items: center; }
.pv-lines { flex: 1; display: flex; flex-direction: column; gap: 6rpx; }

/* 列4 · 属性配置 */
.pa-props { flex: 0 0 17%; width: 17%; }
.pa-props .pa-col-body { padding: 24rpx; }
/* 属性配置面板：标题 + 样式/数据标签页 + 删除组件 */
.pa-props-panel { display: flex; flex-direction: column; }
.pa-props-title { display: block; font-size: 32rpx; font-weight: 700; color: #222; margin-bottom: 20rpx; }
.pa-props-tabs { display: flex; gap: 48rpx; border-bottom: 1rpx solid #EDEAF6; }
.pa-props-tab { position: relative; padding: 8rpx 4rpx 20rpx; font-size: 28rpx; font-weight: 600; color: #999; }
.pa-props-tab.active { color: #222; }
.pa-props-tab.active::after { content: ''; position: absolute; left: 0; right: 0; bottom: -1rpx; height: 6rpx; border-radius: 4rpx; background: #7C5CE0; }
.pa-props-sec { display: block; font-size: 26rpx; color: #666; margin: 16rpx 0 20rpx; }
.pa-align-row { display: flex; align-items: center; gap: 16rpx; margin-bottom: 28rpx; }
.pa-align-label { font-size: 26rpx; color: #333; margin-right: 4rpx; }
.pa-align-btn { min-width: 84rpx; height: 56rpx; padding: 0 24rpx; display: flex; align-items: center; justify-content: center; border-radius: 12rpx; background: #F4F4F8; color: #555; font-size: 26rpx; }
.pa-align-btn.active { background: #4E83FD; color: #fff; font-weight: 600; }
.pa-check-list { flex: 1; min-height: 0; max-height: 560rpx; }
.pa-check-item { display: flex; flex-direction: row; align-items: center; gap: 18rpx; padding: 12rpx 0; }
.pa-check-box { width: 32rpx; height: 32rpx; border-radius: 6rpx; border: 2rpx solid #C9C4DC; background: #fff; color: #fff; font-size: 22rpx; line-height: 30rpx; text-align: center; flex-shrink: 0; }
.pa-check-box.on { background: #4E83FD; border-color: #4E83FD; }
.pa-props-del { margin-top: 24rpx; height: 76rpx; display: flex; align-items: center; justify-content: center; border: 1rpx solid #F3C6C6; border-radius: 16rpx; background: #fff; }
.pa-props-del text { color: #E05C5C; font-size: 28rpx; }
/* 数据面板：模式卡片 / 子选项 / 表单 / 多选下拉 / 同步确认 */
.pa-data-sec { display: block; font-size: 26rpx; font-weight: 700; color: #222; margin: 4rpx 0 20rpx; }
.pa-mode-row { display: flex; gap: 16rpx; margin-bottom: 24rpx; }
.pa-mode-card { flex: 1; display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 10rpx; height: 60rpx; border: 1rpx solid #E5E2EF; border-radius: 16rpx; background: #fff; transition: border-color 0.15s, background 0.15s; }
.pa-mode-card text { font-size: 24rpx; color: #555; white-space: nowrap; }
.pa-mode-card.active { border-color: #F5487F; background: #FFF5F8; }
.pa-mode-card.active text { color: #222; font-weight: 600; }
.pa-mode-dot { width: 24rpx; height: 24rpx; border-radius: 50%; border: 2rpx solid #C9C4DC; background: #fff; flex-shrink: 0; box-sizing: border-box; transition: border 0.15s; }
.pa-mode-card.active .pa-mode-dot { border: 8rpx solid #F5487F; }
.pa-sub-row { display: flex; flex-direction: row; align-items: center; flex-wrap: wrap; gap: 16rpx 20rpx; margin-bottom: 8rpx; }
.pa-sub-item { display: flex; flex-direction: row; align-items: center; gap: 8rpx; }
.pa-sub-item text { font-size: 24rpx; color: #555; white-space: nowrap; }
.pa-sub-item.active text { color: #333; }
.pa-sub-dot { width: 24rpx; height: 24rpx; border-radius: 50%; border: 2rpx solid #C9C4DC; background: #fff; flex-shrink: 0; box-sizing: border-box; transition: border 0.15s; }
.pa-sub-item.active .pa-sub-dot { border: 8rpx solid #4E83FD; }
.pa-sub-dot.blue { border: 8rpx solid #4E83FD; }
.pa-field-label { display: block; font-size: 24rpx; color: #666; margin: 20rpx 0 12rpx; }
.pa-field-input { width: 100%; height: 60rpx; border: 1rpx solid #E5E2EF; border-radius: 16rpx; background: #F6F6F9; padding: 0 16rpx; font-size: 24rpx; color: #333; box-sizing: border-box; }
.pa-dd { position: relative; }
.pa-dd-field { display: flex; flex-direction: row; align-items: center; justify-content: space-between; height: 60rpx; border: 1rpx solid #E5E2EF; border-radius: 16rpx; background: #fff; padding: 0 16rpx; }
.pa-dd-field text { font-size: 24rpx; color: #999; }
.pa-dd-field.has text { color: #333; }
.pa-dd-arrow { font-size: 20rpx; color: #999; }
.pa-dd-panel { position: absolute; left: 0; right: 0; top: 68rpx; z-index: 5; background: #fff; border: 1rpx solid #E5E2EF; border-radius: 16rpx; box-shadow: 0 8rpx 24rpx rgba(30, 20, 60, 0.12); max-height: 300rpx; padding: 8rpx; box-sizing: border-box; }
.pa-dd-opt { display: flex; flex-direction: row; align-items: center; gap: 12rpx; padding: 10rpx 12rpx; }
.pa-dd-img {
  width: 56rpx;
  height: 56rpx;
  border-radius: 10rpx;
  background: #F4F2FA;
  border: 1rpx solid #F0ECFA;
  flex-shrink: 0;
}
.pa-dd-opt text { font-size: 24rpx; color: #333; }
.pa-dd-opt-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pa-dd-opt-price { font-size: 20rpx; color: #F5487F; font-weight: 600; flex-shrink: 0; }
.pa-sync-row { display: flex; flex-direction: row; align-items: center; justify-content: space-between; margin-top: 28rpx; padding-top: 20rpx; border-top: 1rpx solid #F0ECFA; }
.pa-sync-row > text { font-size: 22rpx; color: #999; }
.pa-sync-btn { height: 52rpx; padding: 0 32rpx; display: flex; align-items: center; justify-content: center; border-radius: 26rpx; background: #F7A8BE; }
.pa-sync-btn text { color: #fff; font-size: 24rpx; }
.pa-prop-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}
.pa-prop-label {
  width: 108rpx;
  flex-shrink: 0;
  font-size: 24rpx;
  color: #666;
}
.pa-prop-input {
  flex: 1;
  min-width: 0;
  height: 56rpx;
  border: 1rpx solid #E3DDF2;
  border-radius: 12rpx;
  padding: 0 12rpx;
  font-size: 24rpx;
  color: #333;
  background: #fff;
  box-sizing: border-box;
}
.pa-prop-value {
  font-size: 24rpx;
  color: #333;
  padding: 8rpx 16rpx;
  border: 1rpx solid #E3DDF2;
  border-radius: 12rpx;
  background: #fff;
}
</style>
