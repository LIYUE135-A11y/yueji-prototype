<template>
  <view class="brand-manage">
    <view class="filter-bar">
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">品牌名称</text>
          <picker :range="nameFilterOptions" @change="e => filterForm.name = nameFilterOptions[e.detail.value]">
            <view class="filter-input filter-picker">
              <text :class="{ placeholder: !filterForm.name || filterForm.name === '全部' }">
                {{ filterForm.name || '请选择' }}
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
            <view class="list-td col-id">品牌ID</view>
            <view class="list-td col-logo">品牌Logo</view>
            <view class="list-td col-name">品牌名称</view>
            <view class="list-td col-en">英文名称</view>
            <view class="list-td col-count">关联商品数</view>
            <view class="list-td col-sort">排序</view>
            <view class="list-td col-status">状态</view>
            <view class="list-td col-intro">品牌简介</view>
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
            <view class="list-td col-logo">
              <image v-if="item.logo" class="logo-img" :src="item.logo" mode="aspectFit" />
              <text v-else class="dash">—</text>
            </view>
            <view class="list-td col-name"><text class="name-text">{{ item.name }}</text></view>
            <view class="list-td col-en"><text>{{ item.enName || '—' }}</text></view>
            <view class="list-td col-count"><text>{{ item.productCount }}</text></view>
            <view class="list-td col-sort"><text>{{ item.sort }}</text></view>
            <view class="list-td col-status">
              <text class="status-text" :class="item.statusKey">{{ item.status }}</text>
            </view>
            <view class="list-td col-intro"><text class="intro-text">{{ item.intro || '—' }}</text></view>
            <view class="list-td col-time"><text class="time-text">{{ item.createTime }}</text></view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view v-if="formVisible" class="modal-mask" @click="closeForm">
      <view class="modal-box" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ formMode === 'edit' ? '编辑品牌' : '新增品牌' }}</text>
          <text class="modal-close" @click="closeForm">×</text>
        </view>
        <view class="modal-body">
          <view class="form-row">
            <text class="form-label">品牌ID</text>
            <input class="form-input readonly" v-model="form.id" disabled />
          </view>
          <view class="form-row">
            <text class="form-label">品牌名称</text>
            <input class="form-input readonly" v-model="form.name" disabled />
          </view>
          <view class="form-row">
            <text class="form-label">英文名称</text>
            <input class="form-input" v-model="form.enName" placeholder="选填" />
          </view>
          <view class="form-row">
            <text class="form-label">品牌Logo</text>
            <input class="form-input" v-model="form.logo" placeholder="图片 URL（选填）" />
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
          <view class="form-row top">
            <text class="form-label">品牌简介</text>
            <textarea class="form-textarea" v-model="form.intro" placeholder="选填" :maxlength="200" />
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
  loadBrandList,
  saveBrandList,
  cloneBrand,
  guessBrandEnName
} from '../../common/brand-data.js'

export default {
  name: 'BrandManage',
  data() {
    return {
      statusOptions: ['全部', '已启用', '已停用'],
      formStatusOptions: ['已启用', '已停用'],
      filterForm: { name: '', status: '' },
      applied: { name: '', status: '' },
      pageSizeList: ['10 条', '20 条', '50 条'],
      pageSize: '10 条',
      pageNum: 1,
      list: [],
      formVisible: false,
      formMode: 'add',
      formEditId: '',
      form: {
        id: '', name: '', enName: '', logo: '', sort: 0, status: '已启用', intro: ''
      }
    }
  },
  computed: {
    nameFilterOptions() {
      const names = this.list.map((b) => b.name).filter(Boolean)
      return ['全部'].concat(names)
    },
    pageSizeNum() {
      return parseInt(this.pageSize, 10) || 10
    },
    filteredList() {
      const f = this.applied
      return this.list.filter((b) => {
        if (f.name && f.name !== '全部' && b.name !== f.name) return false
        if (f.status && f.status !== '全部' && b.status !== f.status) return false
        return true
      }).slice().sort((a, b) => {
        const sa = Number(a.sort) || 0
        const sb = Number(b.sort) || 0
        if (sa !== sb) return sa - sb
        return String(b.id).localeCompare(String(a.id))
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
      return list.length > 0 && list.every((b) => b._checked)
    },
    checkedList() {
      return this.list.filter((b) => b._checked)
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
          this.list = loadBrandList(ev.data.products)
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
      let p = this.$parent
      while (p) {
        if (Array.isArray(p.productList) && p.productList.length) return p.productList
        p = p.$parent
      }
      return null
    },
    refreshFromProducts() {
      const products = this.resolveProductList()
      this.list = loadBrandList(products)
    },
    persist() {
      saveBrandList(this.list)
      this.refreshFromProducts()
    },
    applySearch() {
      this.applied = { ...this.filterForm }
      this.pageNum = 1
    },
    resetFilter() {
      this.filterForm = { name: '', status: '' }
      this.applied = { name: '', status: '' }
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
      this.displayList.forEach((b) => { this.$set(b, '_checked', checked) })
    },
    toggleRow(item) { this.$set(item, '_checked', !item._checked) },
    onAdd() {
      uni.showToast({
        title: '品牌来自商品管理，请在商品中维护品牌后自动同步',
        icon: 'none',
        duration: 2500
      })
      this.refreshFromProducts()
    },
    onEdit(item) {
      const target = this.list.find((x) => x.id === item.id) || item
      this.formMode = 'edit'
      this.formEditId = target.id
      this.form = {
        id: target.id,
        name: target.name,
        enName: target.enName || guessBrandEnName(target.name),
        logo: target.logo || '',
        sort: target.sort,
        status: target.status,
        intro: target.intro || ''
      }
      this.formVisible = true
    },
    closeForm() {
      this.formVisible = false
      this.formEditId = ''
    },
    submitForm() {
      const name = (this.form.name || '').trim()
      if (!name) return uni.showToast({ title: '请输入品牌名称', icon: 'none' })
      // 品牌名称以商品管理为准，编辑时不允许改成列表外品牌名导致丢失
      if (this.formMode === 'edit' && this.formEditId) {
        const idx = this.list.findIndex((x) => x.id === this.formEditId)
        if (idx < 0) return uni.showToast({ title: '列表项不存在', icon: 'none' })
        const prev = this.list[idx]
        const status = this.form.status === '已停用' ? '已停用' : '已启用'
        this.$set(this.list, idx, cloneBrand({
          ...prev,
          name: prev.name,
          enName: (this.form.enName || '').trim(),
          logo: (this.form.logo || '').trim(),
          sort: parseInt(this.form.sort, 10) || 0,
          status,
          intro: (this.form.intro || '').trim(),
          productCount: prev.productCount
        }))
        this.persist()
        uni.showToast({ title: '已保存：' + prev.name, icon: 'none' })
        this.closeForm()
        return
      }
      uni.showToast({ title: '请在商品管理中维护品牌', icon: 'none' })
      this.closeForm()
    },
    onDelete(item) {
      if (Number(item.productCount) > 0) {
        return uni.showToast({ title: '该品牌仍有关联商品，无法删除', icon: 'none' })
      }
      uni.showModal({
        title: '确认删除',
        content: '确定删除品牌「' + item.name + '」吗？',
        success: (res) => {
          if (!res.confirm) return
          this.list = this.list.filter((b) => b.id !== item.id)
          this.persist()
          uni.showToast({ title: '已删除', icon: 'success' })
        }
      })
    },
    onBatchDelete() {
      const checked = this.checkedList
      if (!checked.length) return uni.showToast({ title: '请先选择品牌', icon: 'none' })
      const blocked = checked.filter((b) => Number(b.productCount) > 0)
      if (blocked.length) {
        return uni.showToast({ title: '选中项含关联商品的品牌，无法删除', icon: 'none' })
      }
      uni.showModal({
        title: '确认删除',
        content: '确定删除选中的 ' + checked.length + ' 个品牌吗？',
        success: (res) => {
          if (!res.confirm) return
          const ids = checked.map((b) => b.id)
          this.list = this.list.filter((b) => ids.indexOf(b.id) < 0)
          this.persist()
          uni.showToast({ title: '已删除', icon: 'success' })
        }
      })
    },
    setBatchStatus(status) {
      const checked = this.checkedList
      if (!checked.length) return uni.showToast({ title: '请先选择品牌', icon: 'none' })
      const ids = new Set(checked.map((b) => b.id))
      this.list = this.list.map((b) => {
        if (!ids.has(b.id)) return b
        return cloneBrand({ ...b, status })
      })
      this.persist()
      uni.showToast({ title: status === '已启用' ? '已启用' : '已停用', icon: 'none' })
    },
    onBatchEnable() { this.setBatchStatus('已启用') },
    onBatchDisable() { this.setBatchStatus('已停用') },
    onExport() {
      const rows = this.filteredList
      if (!rows.length) return uni.showToast({ title: '暂无数据可导出', icon: 'none' })
      const header = ['品牌ID', '品牌名称', '英文名称', '关联商品数', '排序', '状态', '品牌简介', '创建时间']
      const lines = [header.join(',')]
      rows.forEach((b) => {
        lines.push([
          b.id,
          '"' + String(b.name || '').replace(/"/g, '""') + '"',
          '"' + String(b.enName || '').replace(/"/g, '""') + '"',
          b.productCount,
          b.sort,
          b.status,
          '"' + String(b.intro || '').replace(/"/g, '""') + '"',
          b.createTime
        ].join(','))
      })
      const csv = lines.join('\n')
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(csv).then(() => {
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
.brand-manage { min-height: 520rpx; }

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
  width: 280rpx;
  height: 64rpx;
  padding: 0 20rpx;
  background: #fff;
  border: 1px solid #E8E4F0;
  border-radius: 10rpx;
  font-size: 26rpx;
  color: #222;
  box-sizing: border-box;
}

.filter-picker {
  display: flex;
  align-items: center;
}

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
.col-id { width: 140rpx; }
.col-logo { width: 140rpx; justify-content: center; }
.col-name { width: 200rpx; }
.col-en { width: 200rpx; }
.col-count { width: 160rpx; justify-content: center; }
.col-sort { width: 100rpx; justify-content: center; }
.col-status { width: 140rpx; }
.col-intro { width: 240rpx; }
.col-time { width: 260rpx; }

.logo-img {
  width: 64rpx;
  height: 64rpx;
  border-radius: 8rpx;
  background: #F5F3FF;
}

.dash, .intro-text { color: #999; }
.name-text { font-weight: 500; color: #222; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #555; }
.time-text { color: #888; font-size: 22rpx; }

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
  &.top { align-items: flex-start; }
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

.form-textarea {
  flex: 1;
  min-height: 140rpx;
  padding: 16rpx 20rpx;
  border: 1px solid #E8E4F0;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #222;
  box-sizing: border-box;
  width: 100%;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  padding: 20rpx 32rpx 28rpx;
}
</style>
