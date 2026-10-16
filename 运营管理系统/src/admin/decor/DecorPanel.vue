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
            <view class="list-tr list-tbody" v-for="pg in displayPageList" :key="pg.id">
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
  </view>
</template>

<script>
import { normFilterVal, paginateList } from '../../common/list-filter.js'
import { getAdCover, getPageCover, getEntryIcon } from '../../common/decor-image.js'
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

const PRODUCT_STORAGE_KEY = 'zhuangyan_product_list_v1'
const ACTIVITY_STORAGE_KEY = 'zhuangyan_activity_list_v1'
const ENTRY_PROD_FALLBACK = [
  { id: 'SP100001', name: '神仙水精华露 230ml 补水保湿提亮' },
  { id: 'SP100002', name: '小黑瓶肌底修护精华液 50ml' },
  { id: 'SP100003', name: '小棕瓶特润修护精华眼霜 15ml' },
  { id: 'SP100004', name: '羽毛气垫粉底液 自然色 SPF50+' },
  { id: 'SP100005', name: '花西子同心锁口红 哑光雾面 M301' }
]
const ENTRY_ACTIVITY_FALLBACK = [
  { id: '202506005', name: '新人首单满减' },
  { id: '202506016', name: '年货节满减' },
  { id: '202506018', name: '护肤品类满折' },
  { id: '202506004', name: '限时秒杀专场' }
]

function loadEntryProductList() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(PRODUCT_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length) return parsed
      }
    }
  } catch (e) { /* ignore */ }
  return ENTRY_PROD_FALLBACK
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
      pageList: [
        { id: 'PG10001', name: '夏季护肤专题', type: '专题页', path: '/pages/topic/summer-skincare', status: '已发布', statusKey: 'published', updateTime: '2026-08-20 14:30' },
        { id: 'PG10002', name: '会员权益说明', type: '品牌页', path: '/pages/vip/benefits', status: '已发布', statusKey: 'published', updateTime: '2026-08-18 09:15' },
        { id: 'PG10003', name: '新人领券活动', type: '活动页', path: '/pages/activity/newbie-coupon', status: '草稿', statusKey: 'draft', updateTime: '2026-08-22 16:42' },
        { id: 'PG10004', name: '成分百科首页', type: '内容页', path: '/pages/ingredient/index', status: '已发布', statusKey: 'published', updateTime: '2026-08-15 11:08' },
        { id: 'PG10005', name: '618大促会场', type: '活动页', path: '/pages/activity/618-sale', status: '已下线', statusKey: 'offline', updateTime: '2026-06-20 23:59' }
      ],
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
      window.addEventListener('storage', this._onDecorEntryStorage)
      window.addEventListener('message', this._onDecorEntryMessage)
    }
  },
  beforeDestroy() {
    if (typeof window !== 'undefined') {
      if (this._onDecorEntryStorage) window.removeEventListener('storage', this._onDecorEntryStorage)
      if (this._onDecorEntryMessage) window.removeEventListener('message', this._onDecorEntryMessage)
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
      return loadEntryProductList().map((p) => {
        const name = String(p.name || '')
        const shortName = name.length > 18 ? name.slice(0, 18) + '…' : name
        return { label: p.id + ' · ' + shortName, value: '/pages/product/detail?id=' + p.id }
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
      return hit ? hit.label : shortenEntryLink(url)
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
    onAdd() {
      uni.showToast({ title: '打开添加广告', icon: 'none' })
    },
    onEdit(ad) {
      uni.showToast({ title: '编辑：' + ad.name, icon: 'none' })
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
      uni.showToast({ title: '批量编辑 ' + list.length + ' 项', icon: 'none' })
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
    onPageAdd() { uni.showToast({ title: '打开新建页面', icon: 'none' }) },
    onPagePreview(pg) { this.openPagePathPreview(pg) },
    openPagePathPreview(pg) {
      if (!pg) return
      let modules = Array.isArray(pg.modules) ? pg.modules : []
      if (!modules.length) {
        const name = pg.name || '精选专题'
        modules = [
          { type: 'banner', title: name + ' 专属会场', subtitle: '页面路径预览 · ' + (pg.path || '') },
          { type: 'hero', title: name, text: '这是「' + name + '」在 App 端按页面路径打开后的效果预览。', cta: '立即选购' },
          { type: 'grid', title: '编辑推荐', items: [name + ' 热销', name + ' 新品', name + ' 套装', name + ' 限时'] },
          { type: 'cta', title: '进入会场', subtitle: pg.path || '', cta: '马上逛逛' }
        ]
      }
      // src 副本：用 modal 提示 + 简易 toast 不够，升级为与 admin 一致的内容弹层不可用时至少展示路径
      uni.showModal({
        title: '页面路径预览',
        content: (pg.name || '') + '\n路径：' + (pg.path || '—') + '\n类型：' + (pg.type || '') + '\n模块：' + modules.length + ' 个',
        showCancel: false,
        confirmText: '关闭'
      })
    },
    onPageEdit(pg) { uni.showToast({ title: '编辑：' + pg.name, icon: 'none' }) },
    onPageDelete(pg) {
      uni.showModal({
        title: '确认删除',
        content: '确定删除「' + pg.name + '」吗？',
        success: (res) => {
          if (res.confirm) {
            const idx = this.pageList.findIndex(x => x.id === pg.id)
            if (idx >= 0) this.pageList.splice(idx, 1)
            uni.showToast({ title: '已删除', icon: 'success' })
          }
        }
      })
    },
    onPageBatchEdit() {
      const list = this.checkedPages()
      if (!list.length) return uni.showToast({ title: '请先选择页面', icon: 'none' })
      uni.showToast({ title: '批量编辑 ' + list.length + ' 项', icon: 'none' })
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
            uni.showToast({ title: '已删除', icon: 'success' })
          }
        }
      })
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
    onEntryEdit(en) { this.openEntryForm('edit', en) },
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
      if (!list.length) return uni.showToast({ title: '请先选择入口', icon: 'none' })
      uni.showToast({ title: '批量编辑 ' + list.length + ' 项', icon: 'none' })
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
</style>
