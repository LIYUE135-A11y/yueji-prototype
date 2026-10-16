<template>
  <view class="cat-manage">
    <view class="filter-bar">
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">分类名称</text>
          <input class="filter-input" v-model="filterForm.name" placeholder="请输入分类名称" />
        </view>
        <view class="filter-item">
          <text class="filter-label">分类层级</text>
          <picker :range="levelOptions" @change="e => filterForm.level = levelOptions[e.detail.value]">
            <view class="filter-input filter-picker">
              <text :class="{ placeholder: !filterForm.level || filterForm.level === '全部' }">
                {{ filterForm.level || '请选择' }}
              </text>
            </view>
          </picker>
        </view>
        <view class="filter-item">
          <text class="filter-label">状态</text>
          <picker :range="statusOptions" @change="e => filterForm.status = statusOptions[e.detail.value]">
            <view class="filter-input filter-picker">
              <text :class="{ placeholder: !filterForm.status || filterForm.status === '全部' }">
                {{ filterForm.status || '请选择' }}
              </text>
            </view>
          </picker>
        </view>
        <view class="filter-actions">
          <view class="btn btn-primary" @click="applySearch"><text>查询</text></view>
          <view class="btn btn-default" @click="resetFilter"><text>重置</text></view>
        </view>
      </view>
    </view>

    <view class="action-bar">
      <view class="action-left">
        <view class="btn btn-primary" @click="onAdd"><text>新增</text></view>
        <view class="btn btn-default" @click="onBatchEnable"><text>启用</text></view>
        <view class="btn btn-default" @click="onBatchDisable"><text>停用</text></view>
        <view class="btn btn-default" @click="onBatchDelete"><text>删除</text></view>
        <view class="btn btn-default" @click="onExport"><text>导出</text></view>
      </view>
      <view class="action-right">
        <text class="total-hint">共 {{ filteredList.length }} 条 · 第 {{ pageNum }}/{{ maxPage }} 页</text>
        <picker :range="pageSizeList" @change="onPageSizeChange">
          <view class="page-size-select"><text>{{ pageSizeNum }} 条</text></view>
        </picker>
        <view class="pager">
          <view class="page-btn" :class="{ disabled: pageNum <= 1 }" @click="prevPage"><text>上一页</text></view>
          <view class="page-btn" :class="{ disabled: pageNum >= maxPage }" @click="nextPage"><text>下一页</text></view>
        </view>
      </view>
    </view>

    <view class="list-wrap">
      <scroll-view scroll-x class="list-scroll" :show-scrollbar="false">
        <view class="list-table">
          <view class="list-tr list-th">
            <view class="list-td col-check">
              <checkbox :checked="isAllChecked" @change="toggleCheckAll" color="#8B7CF6" style="transform:scale(0.85);" />
            </view>
            <view class="list-td col-op">操作</view>
            <view class="list-td col-id">分类ID</view>
            <view class="list-td col-name">分类名称</view>
            <view class="list-td col-level">层级</view>
            <view class="list-td col-parent">上级分类</view>
            <view class="list-td col-path">完整路径</view>
            <view class="list-td col-count">关联商品数</view>
            <view class="list-td col-sort">排序</view>
            <view class="list-td col-status">状态</view>
            <view class="list-td col-time">创建时间</view>
          </view>
          <view class="list-tr list-tbody" v-for="item in displayList" :key="item.id">
            <view class="list-td col-check">
              <checkbox :checked="!!item._checked" @change="toggleRow(item)" color="#8B7CF6" style="transform:scale(0.85);" />
            </view>
            <view class="list-td col-op">
              <text class="op-link" @click="onEdit(item)">编辑</text>
              <text class="op-sep">|</text>
              <text class="op-link danger" @click="onDelete(item)">删除</text>
            </view>
            <view class="list-td col-id"><text class="mono">{{ item.id }}</text></view>
            <view class="list-td col-name">
              <text class="name-text" :style="{ paddingLeft: ((item.level - 1) * 24) + 'rpx' }">{{ item.name }}</text>
            </view>
            <view class="list-td col-level">
              <text class="level-tag" :class="'lv' + item.level">{{ item.levelLabel }}</text>
            </view>
            <view class="list-td col-parent"><text>{{ item.parentName || '—' }}</text></view>
            <view class="list-td col-path"><text class="path-text">{{ item.path }}</text></view>
            <view class="list-td col-count"><text>{{ item.productCount }}</text></view>
            <view class="list-td col-sort"><text>{{ item.sort }}</text></view>
            <view class="list-td col-status">
              <text class="status-text" :class="item.statusKey">{{ item.status }}</text>
            </view>
            <view class="list-td col-time"><text class="time-text">{{ item.createTime || '—' }}</text></view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view v-if="formVisible" class="modal-mask" @click="closeForm">
      <view class="modal-box" @click.stop>
        <view class="modal-header">
          <text class="modal-title">编辑分类</text>
          <text class="modal-close" @click="closeForm">×</text>
        </view>
        <view class="modal-body">
          <view class="form-row">
            <text class="form-label">分类ID</text>
            <input class="form-input readonly" v-model="form.id" disabled />
          </view>
          <view class="form-row">
            <text class="form-label">分类名称</text>
            <input class="form-input readonly" v-model="form.name" disabled />
          </view>
          <view class="form-row">
            <text class="form-label">层级</text>
            <input class="form-input readonly" v-model="form.levelLabel" disabled />
          </view>
          <view class="form-row">
            <text class="form-label">完整路径</text>
            <input class="form-input readonly" v-model="form.path" disabled />
          </view>
          <view class="form-row">
            <text class="form-label">排序</text>
            <input class="form-input" type="number" v-model="form.sort" placeholder="数字越小越靠前" />
          </view>
          <view class="form-row">
            <text class="form-label">状态</text>
            <picker :range="formStatusOptions" @change="e => form.status = formStatusOptions[e.detail.value]">
              <view class="form-input picker"><text>{{ form.status }}</text></view>
            </picker>
          </view>
        </view>
        <view class="modal-footer">
          <view class="btn btn-default" @click="closeForm"><text>取消</text></view>
          <view class="btn btn-primary" @click="submitForm"><text>确定</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  loadCategoryList,
  saveCategoryList,
  cloneCategory
} from '../../common/category-data.js'

export default {
  name: 'CategoryManage',
  data() {
    return {
      levelOptions: ['全部', '一级分类', '二级分类', '三级分类'],
      statusOptions: ['全部', '已启用', '已停用'],
      formStatusOptions: ['已启用', '已停用'],
      filterForm: { name: '', level: '', status: '' },
      applied: { name: '', level: '', status: '' },
      pageSizeList: ['10 条', '20 条', '50 条'],
      pageSize: '10 条',
      pageNum: 1,
      list: [],
      formVisible: false,
      formEditId: '',
      form: {
        id: '', name: '', levelLabel: '', path: '', sort: 0, status: '已启用'
      }
    }
  },
  computed: {
    pageSizeNum() {
      return parseInt(this.pageSize, 10) || 10
    },
    filteredList() {
      const f = this.applied
      const kw = (f.name || '').trim().toLowerCase()
      const levelMap = { '一级分类': 1, '二级分类': 2, '三级分类': 3 }
      return this.list.filter((c) => {
        if (kw && !(c.name || '').toLowerCase().includes(kw) && !(c.path || '').toLowerCase().includes(kw)) return false
        if (f.level && f.level !== '全部' && c.level !== levelMap[f.level]) return false
        if (f.status && f.status !== '全部' && c.status !== f.status) return false
        return true
      })
    },
    maxPage() {
      return Math.max(1, Math.ceil(this.filteredList.length / this.pageSizeNum))
    },
    displayList() {
      const start = (this.pageNum - 1) * this.pageSizeNum
      return this.filteredList.slice(start, start + this.pageSizeNum)
    },
    isAllChecked() {
      const list = this.displayList
      return list.length > 0 && list.every((c) => c._checked)
    },
    checkedList() {
      return this.list.filter((c) => c._checked)
    }
  },
  mounted() {
    this.refreshFromProducts()
    if (typeof window !== 'undefined') {
      this._onProductStorage = (ev) => {
        if (ev && ev.key && ev.key !== 'zhuangyan_product_list_v1') return
        this.refreshFromProducts()
      }
      this._onProductMessage = (ev) => {
        if (!ev.data || ev.data.type !== 'product-sync') return
        if (Array.isArray(ev.data.products)) {
          this.list = loadCategoryList(ev.data.products)
        } else {
          this.refreshFromProducts()
        }
      }
      window.addEventListener('storage', this._onProductStorage)
      window.addEventListener('message', this._onProductMessage)
    }
  },
  beforeDestroy() {
    if (typeof window !== 'undefined') {
      if (this._onProductStorage) window.removeEventListener('storage', this._onProductStorage)
      if (this._onProductMessage) window.removeEventListener('message', this._onProductMessage)
    }
  },
  methods: {
    resolveProductList() {
      // 1) 运营管理系统商品管理内存列表
      let p = this.$parent
      while (p) {
        if (Array.isArray(p.productList) && p.productList.length) return p.productList
        p = p.$parent
      }
      // 2) 全局 PRODUCT_LIST（preview / H5）
      if (typeof window !== 'undefined' && Array.isArray(window.PRODUCT_LIST) && window.PRODUCT_LIST.length) {
        return window.PRODUCT_LIST
      }
      return null
    },
    refreshFromProducts() {
      this.list = loadCategoryList(this.resolveProductList())
    },
    persist() {
      saveCategoryList(this.list)
      this.refreshFromProducts()
    },
    applySearch() {
      this.applied = { ...this.filterForm }
      this.pageNum = 1
    },
    resetFilter() {
      this.filterForm = { name: '', level: '', status: '' }
      this.applied = { name: '', level: '', status: '' }
      this.pageNum = 1
    },
    onPageSizeChange(e) {
      this.pageSize = this.pageSizeList[e.detail.value]
      this.pageNum = 1
    },
    prevPage() { if (this.pageNum > 1) this.pageNum-- },
    nextPage() { if (this.pageNum < this.maxPage) this.pageNum++ },
    toggleCheckAll(e) {
      const checked = e.detail.value && e.detail.value.length > 0
      this.displayList.forEach((c) => { this.$set(c, '_checked', checked) })
    },
    toggleRow(item) { this.$set(item, '_checked', !item._checked) },
    onAdd() {
      uni.showToast({
        title: '分类来自商品管理，请在商品中维护分类后自动同步',
        icon: 'none',
        duration: 2500
      })
      this.refreshFromProducts()
    },
    onEdit(item) {
      const target = this.list.find((x) => x.id === item.id) || item
      this.formEditId = target.id
      this.form = {
        id: target.id,
        name: target.name,
        levelLabel: target.levelLabel,
        path: target.path,
        sort: target.sort,
        status: target.status
      }
      this.formVisible = true
    },
    closeForm() {
      this.formVisible = false
      this.formEditId = ''
    },
    submitForm() {
      if (!this.formEditId) return
      const idx = this.list.findIndex((x) => x.id === this.formEditId)
      if (idx < 0) return uni.showToast({ title: '列表项不存在', icon: 'none' })
      const prev = this.list[idx]
      const status = this.form.status === '已停用' ? '已停用' : '已启用'
      this.$set(this.list, idx, cloneCategory({
        ...prev,
        sort: parseInt(this.form.sort, 10) || 0,
        status
      }))
      this.persist()
      uni.showToast({ title: '已保存：' + prev.name, icon: 'none' })
      this.closeForm()
    },
    onDelete(item) {
      if (Number(item.productCount) > 0) {
        return uni.showToast({ title: '该分类仍有关联商品，无法删除', icon: 'none' })
      }
      uni.showModal({
        title: '确认删除',
        content: '确定删除分类「' + item.name + '」吗？',
        success: (res) => {
          if (!res.confirm) return
          this.list = this.list.filter((c) => c.id !== item.id)
          this.persist()
          uni.showToast({ title: '已删除', icon: 'success' })
        }
      })
    },
    onBatchDelete() {
      const checked = this.checkedList
      if (!checked.length) return uni.showToast({ title: '请先选择分类', icon: 'none' })
      if (checked.some((c) => Number(c.productCount) > 0)) {
        return uni.showToast({ title: '选中项含关联商品的分类，无法删除', icon: 'none' })
      }
      uni.showModal({
        title: '确认删除',
        content: '确定删除选中的 ' + checked.length + ' 个分类吗？',
        success: (res) => {
          if (!res.confirm) return
          const ids = checked.map((c) => c.id)
          this.list = this.list.filter((c) => ids.indexOf(c.id) < 0)
          this.persist()
          uni.showToast({ title: '已删除', icon: 'success' })
        }
      })
    },
    setBatchStatus(status) {
      const checked = this.checkedList
      if (!checked.length) return uni.showToast({ title: '请先选择分类', icon: 'none' })
      const ids = new Set(checked.map((c) => c.id))
      this.list = this.list.map((c) => {
        if (!ids.has(c.id)) return c
        return cloneCategory({ ...c, status })
      })
      this.persist()
      uni.showToast({ title: status === '已启用' ? '已启用' : '已停用', icon: 'none' })
    },
    onBatchEnable() { this.setBatchStatus('已启用') },
    onBatchDisable() { this.setBatchStatus('已停用') },
    onExport() {
      const rows = this.filteredList
      if (!rows.length) return uni.showToast({ title: '暂无数据可导出', icon: 'none' })
      const header = ['分类ID', '分类名称', '层级', '上级分类', '完整路径', '关联商品数', '排序', '状态']
      const lines = [header.join(',')]
      rows.forEach((c) => {
        lines.push([
          c.id,
          '"' + String(c.name || '').replace(/"/g, '""') + '"',
          c.levelLabel,
          '"' + String(c.parentName || '').replace(/"/g, '""') + '"',
          '"' + String(c.path || '').replace(/"/g, '""') + '"',
          c.productCount,
          c.sort,
          c.status
        ].join(','))
      })
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(lines.join('\n')).then(() => {
            uni.showToast({ title: '已复制导出内容', icon: 'none' })
          }).catch(() => {
            uni.showToast({ title: '导出 ' + rows.length + ' 条', icon: 'none' })
          })
          return
        }
      } catch (e) { /* ignore */ }
      uni.showToast({ title: '导出 ' + rows.length + ' 条', icon: 'none' })
    }
  }
}
</script>

<style lang="scss" scoped>
.cat-manage { min-height: 520rpx; }

.filter-bar {
  background: #fff;
  border: 1px solid #EEEAF5;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 20rpx;
}
.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20rpx;
}
.filter-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.filter-label {
  font-size: 26rpx;
  color: #666;
  white-space: nowrap;
}
.filter-input {
  width: 260rpx;
  height: 64rpx;
  padding: 0 20rpx;
  background: #fff;
  border: 1px solid #E8E4F0;
  border-radius: 10rpx;
  font-size: 26rpx;
  color: #222;
  box-sizing: border-box;
}
.filter-picker { display: flex; align-items: center; }
.placeholder { color: #BBB; }
.filter-actions {
  display: flex;
  gap: 12rpx;
  margin-left: auto;
}

.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 16rpx;
  flex-wrap: wrap;
}
.action-left, .action-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}
.total-hint {
  font-size: 24rpx;
  color: #888;
  margin-right: 8rpx;
}
.page-size-select {
  min-width: 100rpx;
  height: 56rpx;
  padding: 0 16rpx;
  border: 1px solid #E8E4F0;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #555;
  background: #fff;
}
.pager { display: flex; gap: 8rpx; }
.page-btn {
  height: 56rpx;
  padding: 0 20rpx;
  border: 1px solid #E8E4F0;
  border-radius: 10rpx;
  background: #fff;
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #555;
  &.disabled { opacity: 0.4; pointer-events: none; }
}

.btn {
  min-width: 120rpx;
  height: 64rpx;
  padding: 0 28rpx;
  border-radius: 10rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
}
.btn-primary { background: #8B7CF6; color: #fff; }
.btn-default {
  background: #fff;
  color: #666;
  border: 1px solid #E5E5E5;
}

.list-wrap {
  border: 1px solid #EEEAF5;
  border-radius: 12rpx;
  background: #fff;
  overflow: hidden;
}
.list-scroll { width: 100%; white-space: nowrap; }
.list-table {
  display: inline-block;
  min-width: 2200rpx;
  font-size: 24rpx;
}
.list-tr {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid #F0ECF8;
}
.list-th { background: #FAFAFC; }
.list-th .list-td { font-weight: 600; color: #666; }
.list-td {
  padding: 22rpx 16rpx;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  box-sizing: border-box;
  color: #333;
}

.col-check { width: 80rpx; justify-content: center; }
.col-op { width: 160rpx; }
.col-id { width: 160rpx; }
.col-name { width: 240rpx; }
.col-level { width: 160rpx; }
.col-parent { width: 180rpx; }
.col-path { width: 360rpx; }
.col-count { width: 160rpx; justify-content: center; }
.col-sort { width: 100rpx; justify-content: center; }
.col-status { width: 140rpx; }
.col-time { width: 240rpx; }

.name-text { font-weight: 500; color: #222; }
.path-text { color: #888; font-size: 22rpx; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #555; }
.time-text { color: #888; font-size: 22rpx; }

.level-tag {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  &.lv1 { color: #6B5CAD; background: #F0EBFF; }
  &.lv2 { color: #0F766E; background: #CCFBF1; }
  &.lv3 { color: #9A3412; background: #FFEDD5; }
}

.status-text {
  font-size: 24rpx;
  &.on { color: #16A34A; }
  &.off { color: #9CA3AF; }
}

.op-link {
  font-size: 24rpx;
  color: #8B7CF6;
  &.danger { color: #FF5B6B; }
}
.op-sep { color: #D1D5DB; margin: 0 6rpx; font-size: 22rpx; }

.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-box {
  width: 720rpx;
  max-width: 92vw;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 1px solid #F0ECF8;
}
.modal-title { font-size: 30rpx; font-weight: 700; color: #222; }
.modal-close { font-size: 40rpx; color: #999; line-height: 1; }
.modal-body { padding: 8rpx 32rpx; }
.form-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 0;
}
.form-label {
  width: 160rpx;
  flex-shrink: 0;
  font-size: 26rpx;
  color: #555;
  line-height: 68rpx;
}
.form-input {
  flex: 1;
  height: 68rpx;
  padding: 0 20rpx;
  border: 1px solid #E8E4F0;
  border-radius: 12rpx;
  background: #fff;
  font-size: 26rpx;
  color: #222;
  box-sizing: border-box;
  &.readonly { background: #F7F7FA; color: #999; }
  &.picker { display: flex; align-items: center; }
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  padding: 20rpx 32rpx 28rpx;
}
</style>
