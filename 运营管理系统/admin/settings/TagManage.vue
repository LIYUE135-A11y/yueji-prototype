<template>
  <view class="tag-manage">
    <view class="filter-bar">
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">标签名称</text>
          <picker :range="nameFilterOptions" @change="e => filterForm.name = nameFilterOptions[e.detail.value]">
            <view class="filter-input filter-picker">
              <text :class="{ placeholder: !filterForm.name || filterForm.name === '全部' }">
                {{ filterForm.name || '全部' }}
              </text>
            </view>
          </picker>
        </view>
        <view class="filter-item">
          <text class="filter-label">状态</text>
          <picker :range="statusOptions" @change="e => filterForm.status = statusOptions[e.detail.value]">
            <view class="filter-input filter-picker">
              <text :class="{ placeholder: !filterForm.status || filterForm.status === '全部' }">
                {{ filterForm.status || '全部' }}
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
            <view class="list-td col-id">标签ID</view>
            <view class="list-td col-name">标签名称</view>
            <view class="list-td col-intro">简介</view>
            <view class="list-td col-count">关联商品</view>
            <view class="list-td col-sort">排序</view>
            <view class="list-td col-status">状态</view>
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
            <view class="list-td col-name"><text class="name-text">{{ item.name }}</text></view>
            <view class="list-td col-intro"><text class="intro-text">{{ item.intro || '—' }}</text></view>
            <view class="list-td col-count"><text>{{ item.productCount }}</text></view>
            <view class="list-td col-sort"><text>{{ item.sort }}</text></view>
            <view class="list-td col-status">
              <text class="status-tag" :class="item.statusKey">{{ item.status }}</text>
            </view>
          </view>
          <view v-if="!displayList.length" class="empty-row">
            <text class="empty-text">暂无标签数据</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view v-if="formVisible" class="modal-mask" @click="closeForm">
      <view class="modal-box" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ formMode === 'edit' ? '编辑标签' : '新增标签' }}</text>
          <text class="modal-close" @click="closeForm">×</text>
        </view>
        <view class="modal-body">
          <view class="form-row">
            <text class="form-label">标签ID</text>
            <input class="form-input readonly" v-model="form.id" disabled />
          </view>
          <view class="form-row">
            <text class="form-label">标签名称</text>
            <input class="form-input" v-model="form.name" placeholder="请输入标签名称" />
          </view>
          <view class="form-row top">
            <text class="form-label">简介</text>
            <textarea class="form-textarea" v-model="form.intro" placeholder="选填" :maxlength="100" />
          </view>
          <view class="form-row">
            <text class="form-label">关联商品</text>
            <input class="form-input" type="number" v-model="form.productCount" placeholder="0" />
          </view>
          <view class="form-row">
            <text class="form-label">排序</text>
            <input class="form-input" type="number" v-model="form.sort" placeholder="数字越大越靠前" />
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
  loadTagList,
  saveTagList,
  cloneTag,
  nextTagId
} from '../../common/tag-data.js'

export default {
  name: 'TagManage',
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
        id: '', name: '', intro: '', productCount: 0, sort: 0, status: '已启用'
      }
    }
  },
  computed: {
    nameFilterOptions() {
      const names = this.list.map((t) => t.name).filter(Boolean)
      return ['全部'].concat(names)
    },
    pageSizeNum() {
      return parseInt(this.pageSize, 10) || 10
    },
    filteredList() {
      const f = this.applied
      return this.list.filter((t) => {
        if (f.name && f.name !== '全部' && t.name !== f.name) return false
        if (f.status && f.status !== '全部' && t.status !== f.status) return false
        return true
      }).slice().sort((a, b) => {
        const sa = Number(a.sort) || 0
        const sb = Number(b.sort) || 0
        if (sa !== sb) return sb - sa
        return String(b.id).localeCompare(String(a.id))
      })
    },
    maxPage() {
      return Math.max(1, Math.ceil(this.filteredList.length / this.pageSizeNum) || 1)
    },
    displayList() {
      const start = (this.pageNum - 1) * this.pageSizeNum
      return this.filteredList.slice(start, start + this.pageSizeNum)
    },
    isAllChecked() {
      const list = this.displayList
      return list.length > 0 && list.every((t) => t._checked)
    },
    checkedList() {
      return this.list.filter((t) => t._checked)
    }
  },
  mounted() {
    this.list = loadTagList()
  },
  methods: {
    persist() {
      saveTagList(this.list)
      this.list = loadTagList()
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
      this.displayList.forEach((t) => { this.$set(t, '_checked', checked) })
    },
    toggleRow(item) { this.$set(item, '_checked', !item._checked) },
    onAdd() {
      this.formMode = 'add'
      this.formEditId = ''
      this.form = {
        id: nextTagId(this.list),
        name: '',
        intro: '',
        productCount: 0,
        sort: 0,
        status: '已启用'
      }
      this.formVisible = true
    },
    onEdit(item) {
      const target = this.list.find((x) => x.id === item.id) || item
      this.formMode = 'edit'
      this.formEditId = target.id
      this.form = {
        id: target.id,
        name: target.name,
        intro: target.intro || '',
        productCount: target.productCount,
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
      const name = (this.form.name || '').trim()
      if (!name) return uni.showToast({ title: '请输入标签名称', icon: 'none' })
      const status = this.form.status === '已停用' ? '已停用' : '已启用'
      const payload = cloneTag({
        id: this.form.id,
        name,
        intro: (this.form.intro || '').trim(),
        productCount: parseInt(this.form.productCount, 10) || 0,
        sort: parseInt(this.form.sort, 10) || 0,
        status
      })
      if (this.formMode === 'edit' && this.formEditId) {
        const idx = this.list.findIndex((x) => x.id === this.formEditId)
        if (idx < 0) return uni.showToast({ title: '列表项不存在', icon: 'none' })
        this.$set(this.list, idx, payload)
      } else {
        const dup = this.list.some((t) => t.name === name)
        if (dup) return uni.showToast({ title: '标签名称已存在', icon: 'none' })
        this.list.unshift(payload)
      }
      this.persist()
      uni.showToast({ title: '已保存', icon: 'success' })
      this.closeForm()
    },
    onDelete(item) {
      uni.showModal({
        title: '确认删除',
        content: '确定删除标签「' + item.name + '」吗？',
        success: (res) => {
          if (!res.confirm) return
          this.list = this.list.filter((t) => t.id !== item.id)
          this.persist()
          uni.showToast({ title: '已删除', icon: 'success' })
        }
      })
    },
    onBatchDelete() {
      const checked = this.checkedList
      if (!checked.length) return uni.showToast({ title: '请先选择标签', icon: 'none' })
      uni.showModal({
        title: '确认删除',
        content: '确定删除选中的 ' + checked.length + ' 个标签吗？',
        success: (res) => {
          if (!res.confirm) return
          const ids = checked.map((t) => t.id)
          this.list = this.list.filter((t) => ids.indexOf(t.id) < 0)
          this.persist()
          uni.showToast({ title: '已删除', icon: 'success' })
        }
      })
    },
    setBatchStatus(status) {
      const checked = this.checkedList
      if (!checked.length) return uni.showToast({ title: '请先选择标签', icon: 'none' })
      const ids = new Set(checked.map((t) => t.id))
      this.list = this.list.map((t) => {
        if (!ids.has(t.id)) return t
        return cloneTag({ ...t, status })
      })
      this.persist()
      uni.showToast({ title: status === '已启用' ? '已启用' : '已停用', icon: 'none' })
    },
    onBatchEnable() { this.setBatchStatus('已启用') },
    onBatchDisable() { this.setBatchStatus('已停用') },
    onExport() {
      const rows = this.filteredList
      if (!rows.length) return uni.showToast({ title: '暂无数据可导出', icon: 'none' })
      uni.showToast({ title: '导出 ' + rows.length + ' 条', icon: 'none' })
    }
  }
}
</script>

<style lang="scss" scoped>
.tag-manage { min-height: 520rpx; }

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
  min-width: 1600rpx;
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
.col-name { width: 180rpx; }
.col-intro { width: 420rpx; }
.col-count { width: 140rpx; justify-content: center; }
.col-sort { width: 100rpx; justify-content: center; }
.col-status { width: 140rpx; }

.name-text { font-weight: 500; color: #222; }
.intro-text { color: #666; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #888; }

.status-tag {
  display: inline-block;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  &.on { background: #E8F8EF; color: #16A34A; }
  &.off { background: #F3F4F6; color: #9CA3AF; }
}

.op-link {
  font-size: 24rpx;
  color: #8B7CF6;
  &.danger { color: #FF5B6B; }
}
.op-sep { color: #D1D5DB; margin: 0 6rpx; font-size: 22rpx; }

.empty-row { padding: 60rpx 24rpx; text-align: center; }
.empty-text { color: #AAA; font-size: 26rpx; }

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
  min-height: 120rpx;
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
