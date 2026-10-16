<template>
  <view class="dept-manage">
    <view class="filter-bar">
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">部门名称</text>
          <input class="filter-input" v-model="filterForm.name" placeholder="请输入部门名称" />
        </view>
        <view class="filter-item">
          <text class="filter-label">部门状态</text>
          <picker :range="statusOptions" @change="e => filterForm.status = statusOptions[e.detail.value]">
            <view class="filter-input filter-picker">
              <text :class="{ placeholder: !filterForm.status || filterForm.status === '全部' }">
                {{ filterForm.status || '请选择' }}
              </text>
            </view>
          </picker>
        </view>
        <view class="filter-item">
          <text class="filter-label">上级部门</text>
          <picker :range="parentOptions" @change="e => filterForm.parent = parentOptions[e.detail.value]">
            <view class="filter-input filter-picker">
              <text :class="{ placeholder: !filterForm.parent || filterForm.parent === '全部' }">
                {{ filterForm.parent || '请选择' }}
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
        <view class="btn btn-primary" @click="onAdd"><text>新建部门</text></view>
        <view class="btn btn-default" @click="onBatchDelete"><text>删除</text></view>
      </view>
      <text class="total-hint">共 {{ filteredList.length }} 条</text>
    </view>

    <view class="list-wrap">
      <scroll-view scroll-x class="list-scroll" :show-scrollbar="false">
        <view class="list-table">
          <view class="list-tr list-th">
            <view class="list-td col-check">
              <checkbox :checked="isAllChecked" @change="toggleCheckAll" color="#8B7CF6" style="transform:scale(0.85);" />
            </view>
            <view class="list-td col-op">操作</view>
            <view class="list-td col-id">部门ID</view>
            <view class="list-td col-name">部门名称</view>
            <view class="list-td col-code">部门编码</view>
            <view class="list-td col-parent">上级部门</view>
            <view class="list-td col-leader">负责人</view>
            <view class="list-td col-phone">联系电话</view>
            <view class="list-td col-count">人数</view>
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
            <view class="list-td col-name"><text class="name-text">{{ item.name }}</text></view>
            <view class="list-td col-code"><text class="mono">{{ item.code }}</text></view>
            <view class="list-td col-parent"><text>{{ item.parentName || '—' }}</text></view>
            <view class="list-td col-leader"><text>{{ item.leader }}</text></view>
            <view class="list-td col-phone"><text>{{ item.phone }}</text></view>
            <view class="list-td col-count"><text>{{ item.memberCount }}</text></view>
            <view class="list-td col-status">
              <text class="status-tag" :class="item.statusKey">{{ item.status }}</text>
            </view>
            <view class="list-td col-time"><text class="time-text">{{ item.createTime }}</text></view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="pagination">
      <text class="total-text">共 <text class="b">{{ filteredList.length }}</text> 条 · 第 <text class="b">{{ pageNum }}</text> / <text class="b">{{ maxPage }}</text> 页</text>
      <view class="pager-wrap">
        <picker :range="pageSizeList" @change="onPageSizeChange">
          <view class="page-size-select"><text>{{ pageSize }}</text></view>
        </picker>
        <view class="pager">
          <view class="page-btn" :class="{ disabled: pageNum <= 1 }" @click="prevPage"><text>上一页</text></view>
          <view class="page-btn" :class="{ disabled: pageNum >= maxPage }" @click="nextPage"><text>下一页</text></view>
        </view>
      </view>
    </view>

    <!-- 新建/编辑部门 -->
    <view v-if="formVisible" class="modal-mask" @click="closeForm">
      <view class="modal-box" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ formMode === 'edit' ? '编辑部门' : '新建部门' }}</text>
          <text class="modal-close" @click="closeForm">×</text>
        </view>
        <view class="modal-body">
          <view class="form-row">
            <text class="form-label">部门ID</text>
            <input class="form-input readonly" v-model="form.id" disabled />
          </view>
          <view class="form-row">
            <text class="form-label">部门名称</text>
            <input class="form-input" v-model="form.name" placeholder="请输入部门名称" />
          </view>
          <view class="form-row">
            <text class="form-label">部门编码</text>
            <input class="form-input" v-model="form.code" placeholder="如 OPS / CS" />
          </view>
          <view class="form-row">
            <text class="form-label">上级部门</text>
            <picker :range="formParentOptions" @change="onFormParentChange">
              <view class="form-input picker"><text>{{ form.parentName || '无（顶级部门）' }}</text></view>
            </picker>
          </view>
          <view class="form-row">
            <text class="form-label">负责人</text>
            <input class="form-input" v-model="form.leader" placeholder="请输入负责人" />
          </view>
          <view class="form-row">
            <text class="form-label">联系电话</text>
            <input class="form-input" v-model="form.phone" placeholder="请输入联系电话" />
          </view>
          <view class="form-row">
            <text class="form-label">状态</text>
            <picker :range="formStatusOptions" @change="e => form.status = formStatusOptions[e.detail.value]">
              <view class="form-input picker"><text>{{ form.status }}</text></view>
            </picker>
          </view>
          <view class="form-row">
            <text class="form-label">排序</text>
            <input class="form-input" type="number" v-model="form.sort" />
          </view>
          <view class="form-row top">
            <text class="form-label">备注</text>
            <textarea class="form-textarea" v-model="form.remark" placeholder="选填" />
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
const DEPT_SEED = [
  { id: 'D10001', name: '阅己美妆总部', code: 'HQ', parentId: '', parentName: '', leader: '林晓薇', phone: '138****1001', memberCount: 128, status: '启用', statusKey: 'on', sort: 1, createTime: '2024-01-08 09:30', remark: '公司一级组织' },
  { id: 'D10002', name: '运营中心', code: 'OPS', parentId: 'D10001', parentName: '阅己美妆总部', leader: '周启明', phone: '139****2202', memberCount: 36, status: '启用', statusKey: 'on', sort: 2, createTime: '2024-01-12 10:15', remark: '活动/店铺装修/投放' },
  { id: 'D10003', name: '商品中心', code: 'PRD', parentId: 'D10001', parentName: '阅己美妆总部', leader: '陈思远', phone: '137****3303', memberCount: 28, status: '启用', statusKey: 'on', sort: 3, createTime: '2024-01-15 11:20', remark: '商品与类目运营' },
  { id: 'D10004', name: '客户服务部', code: 'CS', parentId: 'D10001', parentName: '阅己美妆总部', leader: '赵婉清', phone: '136****4404', memberCount: 42, status: '启用', statusKey: 'on', sort: 4, createTime: '2024-02-01 14:00', remark: '售前售后客服' },
  { id: 'D10005', name: '技术研发部', code: 'RD', parentId: 'D10001', parentName: '阅己美妆总部', leader: '韩予安', phone: '135****5505', memberCount: 22, status: '启用', statusKey: 'on', sort: 5, createTime: '2024-02-18 09:45', remark: 'App / 运营后台' },
  { id: 'D10006', name: '市场品牌部', code: 'MKT', parentId: 'D10001', parentName: '阅己美妆总部', leader: '苏念', phone: '158****6606', memberCount: 18, status: '启用', statusKey: 'on', sort: 6, createTime: '2024-03-05 16:10', remark: '品牌与内容营销' },
  { id: 'D10007', name: '仓储物流部', code: 'WMS', parentId: 'D10001', parentName: '阅己美妆总部', leader: '马骏', phone: '159****7707', memberCount: 31, status: '启用', statusKey: 'on', sort: 7, createTime: '2024-03-20 10:30', remark: '仓配一体化' },
  { id: 'D10008', name: '财务部', code: 'FIN', parentId: 'D10001', parentName: '阅己美妆总部', leader: '何静', phone: '186****8808', memberCount: 12, status: '启用', statusKey: 'on', sort: 8, createTime: '2024-04-02 09:00', remark: '结算与对账' },
  { id: 'D10009', name: '人力资源部', code: 'HR', parentId: 'D10001', parentName: '阅己美妆总部', leader: '顾晴', phone: '187****9909', memberCount: 9, status: '启用', statusKey: 'on', sort: 9, createTime: '2024-04-15 13:40', remark: '招聘与组织发展' },
  { id: 'D10010', name: '活动运营组', code: 'OPS-ACT', parentId: 'D10002', parentName: '运营中心', leader: '许澄', phone: '133****1010', memberCount: 14, status: '启用', statusKey: 'on', sort: 10, createTime: '2024-05-08 11:05', remark: '满减/秒杀等活动' },
  { id: 'D10011', name: '店铺装修组', code: 'OPS-DEC', parentId: 'D10002', parentName: '运营中心', leader: '叶岚', phone: '132****1111', memberCount: 8, status: '启用', statusKey: 'on', sort: 11, createTime: '2024-05-20 15:25', remark: '首页与专题装修' },
  { id: 'D10012', name: '在线客服组', code: 'CS-OL', parentId: 'D10004', parentName: '客户服务部', leader: '白柠', phone: '131****1212', memberCount: 26, status: '启用', statusKey: 'on', sort: 12, createTime: '2024-06-01 09:50', remark: 'IM 与工单' },
  { id: 'D10013', name: '算法实验室', code: 'RD-AI', parentId: 'D10005', parentName: '技术研发部', leader: '沈川', phone: '188****1313', memberCount: 7, status: '停用', statusKey: 'off', sort: 13, createTime: '2024-07-12 10:00', remark: '大模型与测肤算法（暂停扩招）' },
  { id: 'D10014', name: '内容种草组', code: 'MKT-UGC', parentId: 'D10006', parentName: '市场品牌部', leader: '乔薇', phone: '185****1414', memberCount: 11, status: '启用', statusKey: 'on', sort: 14, createTime: '2024-08-03 14:35', remark: '社区与达人合作' },
  { id: 'D10015', name: '华北仓', code: 'WMS-N', parentId: 'D10007', parentName: '仓储物流部', leader: '唐磊', phone: '182****1515', memberCount: 16, status: '启用', statusKey: 'on', sort: 15, createTime: '2025-01-10 08:20', remark: '京津冀发货' }
]

function cloneDept(d) {
  return {
    id: d.id,
    name: d.name || '',
    code: d.code || '',
    parentId: d.parentId || '',
    parentName: d.parentName || '',
    leader: d.leader || '',
    phone: d.phone || '',
    memberCount: d.memberCount != null ? d.memberCount : 0,
    status: d.status || '启用',
    statusKey: d.statusKey || (d.status === '停用' ? 'off' : 'on'),
    sort: d.sort != null ? d.sort : 1,
    createTime: d.createTime || '',
    remark: d.remark || '',
    _checked: false
  }
}

export default {
  name: 'DeptManage',
  data() {
    return {
      statusOptions: ['全部', '启用', '停用'],
      filterForm: { name: '', status: '', parent: '' },
      applied: { name: '', status: '', parent: '' },
      pageSizeList: ['10 条/页', '20 条/页', '50 条/页'],
      pageSize: '10 条/页',
      pageNum: 1,
      list: DEPT_SEED.map(cloneDept),
      formVisible: false,
      formMode: 'add',
      formEditId: '',
      formStatusOptions: ['启用', '停用'],
      form: {
        id: '', name: '', code: '', parentId: '', parentName: '',
        leader: '', phone: '', status: '启用', sort: 1, remark: ''
      }
    }
  },
  computed: {
    parentOptions() {
      const names = this.list.map((d) => d.name).filter(Boolean)
      return ['全部', '无（顶级部门）'].concat(names)
    },
    formParentOptions() {
      return ['无（顶级部门）'].concat(
        this.list.filter((d) => d.id !== this.form.id).map((d) => d.name)
      )
    },
    filteredList() {
      const f = this.applied
      const kw = (f.name || '').trim().toLowerCase()
      return this.list.filter((d) => {
        if (kw && !(d.name || '').toLowerCase().includes(kw) && !(d.code || '').toLowerCase().includes(kw)) return false
        if (f.status && f.status !== '全部' && d.status !== f.status) return false
        if (f.parent && f.parent !== '全部') {
          if (f.parent === '无（顶级部门）') {
            if (d.parentName) return false
          } else if (d.parentName !== f.parent) {
            return false
          }
        }
        return true
      }).sort((a, b) => (Number(a.sort) || 0) - (Number(b.sort) || 0))
    },
    maxPage() {
      const size = parseInt(this.pageSize, 10) || 10
      return Math.max(1, Math.ceil(this.filteredList.length / size))
    },
    displayList() {
      const size = parseInt(this.pageSize, 10) || 10
      const start = (this.pageNum - 1) * size
      return this.filteredList.slice(start, start + size)
    },
    isAllChecked() {
      const list = this.displayList
      return list.length > 0 && list.every((d) => d._checked)
    }
  },
  methods: {
    applySearch() {
      this.applied = { ...this.filterForm }
      this.pageNum = 1
    },
    resetFilter() {
      this.filterForm = { name: '', status: '', parent: '' }
      this.applied = { name: '', status: '', parent: '' }
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
      this.displayList.forEach((d) => { this.$set(d, '_checked', checked) })
    },
    toggleRow(item) { this.$set(item, '_checked', !item._checked) },
    nextId() {
      let max = 10000
      this.list.forEach((d) => {
        const n = parseInt(String(d.id).replace(/\D/g, ''), 10)
        if (!isNaN(n) && n > max) max = n
      })
      return 'D' + (max + 1)
    },
    onAdd() {
      this.formMode = 'add'
      this.formEditId = ''
      this.form = {
        id: this.nextId(),
        name: '',
        code: '',
        parentId: '',
        parentName: '',
        leader: '',
        phone: '',
        status: '启用',
        sort: this.list.length + 1,
        remark: ''
      }
      this.formVisible = true
    },
    onEdit(item) {
      this.formMode = 'edit'
      this.formEditId = item.id
      this.form = {
        id: item.id,
        name: item.name,
        code: item.code,
        parentId: item.parentId || '',
        parentName: item.parentName || '',
        leader: item.leader,
        phone: item.phone,
        status: item.status,
        sort: item.sort,
        remark: item.remark || ''
      }
      this.formVisible = true
    },
    closeForm() {
      this.formVisible = false
      this.formEditId = ''
    },
    onFormParentChange(e) {
      const name = this.formParentOptions[e.detail.value]
      if (!name || name === '无（顶级部门）') {
        this.form.parentId = ''
        this.form.parentName = ''
        return
      }
      const hit = this.list.find((d) => d.name === name)
      this.form.parentId = hit ? hit.id : ''
      this.form.parentName = name
    },
    submitForm() {
      const name = (this.form.name || '').trim()
      const code = (this.form.code || '').trim()
      if (!name) return uni.showToast({ title: '请输入部门名称', icon: 'none' })
      if (!code) return uni.showToast({ title: '请输入部门编码', icon: 'none' })
      const now = new Date()
      const p = (n) => String(n).padStart(2, '0')
      const timeStr = now.getFullYear() + '-' + p(now.getMonth() + 1) + '-' + p(now.getDate()) + ' ' + p(now.getHours()) + ':' + p(now.getMinutes())
      const payload = {
        id: this.form.id,
        name,
        code,
        parentId: this.form.parentId || '',
        parentName: this.form.parentName || '',
        leader: (this.form.leader || '').trim() || '—',
        phone: (this.form.phone || '').trim() || '—',
        memberCount: this.formMode === 'edit'
          ? ((this.list.find((x) => x.id === this.formEditId) || {}).memberCount || 0)
          : 0,
        status: this.form.status,
        statusKey: this.form.status === '停用' ? 'off' : 'on',
        sort: parseInt(this.form.sort, 10) || 1,
        createTime: this.formMode === 'edit'
          ? ((this.list.find((x) => x.id === this.formEditId) || {}).createTime || timeStr)
          : timeStr,
        remark: (this.form.remark || '').trim(),
        _checked: false
      }
      if (this.formMode === 'edit' && this.formEditId) {
        const idx = this.list.findIndex((x) => x.id === this.formEditId)
        if (idx >= 0) this.$set(this.list, idx, payload)
        uni.showToast({ title: '已保存：' + name, icon: 'none' })
      } else {
        this.list.unshift(payload)
        uni.showToast({ title: '已创建：' + name, icon: 'success' })
      }
      this.closeForm()
    },
    onDelete(item) {
      uni.showModal({
        title: '确认删除',
        content: '确定删除部门「' + item.name + '」吗？',
        success: (res) => {
          if (!res.confirm) return
          const hasChild = this.list.some((d) => d.parentId === item.id)
          if (hasChild) {
            return uni.showToast({ title: '请先删除下级部门', icon: 'none' })
          }
          this.list = this.list.filter((d) => d.id !== item.id)
          uni.showToast({ title: '已删除', icon: 'success' })
        }
      })
    },
    onBatchDelete() {
      const checked = this.list.filter((d) => d._checked)
      if (!checked.length) return uni.showToast({ title: '请先选择部门', icon: 'none' })
      uni.showModal({
        title: '确认删除',
        content: '确定删除选中的 ' + checked.length + ' 个部门吗？',
        success: (res) => {
          if (!res.confirm) return
          const ids = checked.map((d) => d.id)
          const blocked = ids.some((id) => this.list.some((d) => d.parentId === id && ids.indexOf(d.id) < 0))
          if (blocked) {
            return uni.showToast({ title: '存在未勾选的下级部门，无法删除', icon: 'none' })
          }
          this.list = this.list.filter((d) => ids.indexOf(d.id) < 0)
          uni.showToast({ title: '已删除', icon: 'success' })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dept-manage { width: 100%; }

.filter-bar {
  background: #FAFAFC;
  border-radius: 12rpx;
  padding: 20rpx 20rpx 8rpx;
  margin-bottom: 20rpx;
}
.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx 24rpx;
  align-items: flex-end;
  margin-bottom: 12rpx;
}
.filter-item { display: flex; flex-direction: column; gap: 8rpx; }
.filter-label { font-size: 22rpx; color: #888; }
.filter-input {
  width: 220rpx; height: 64rpx; padding: 0 16rpx;
  background: #fff; border: 1px solid #E8E4F4; border-radius: 10rpx;
  font-size: 24rpx; color: #333; box-sizing: border-box;
}
.filter-picker { display: flex; align-items: center; }
.filter-picker .placeholder { color: #BBB; }
.filter-actions { display: flex; gap: 12rpx; padding-bottom: 2rpx; }

.btn {
  height: 64rpx; padding: 0 28rpx; border-radius: 10rpx;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 24rpx; font-weight: 600;
}
.btn-primary { background: #8B7CF6; color: #fff; }
.btn-default { background: #fff; color: #666; border: 1px solid #E8E4F4; }

.action-bar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16rpx;
}
.action-left { display: flex; gap: 12rpx; }
.total-hint { font-size: 24rpx; color: #999; }

.list-wrap {
  border: 1px solid #EEEAF5; border-radius: 12rpx; overflow: hidden; background: #fff;
}
.list-scroll { width: 100%; }
.list-table { min-width: 1600rpx; }
.list-tr { display: flex; align-items: stretch; border-bottom: 1px solid #F3F0FA; }
.list-th {
  background: #FAFAFC; font-size: 22rpx; color: #888; font-weight: 600;
}
.list-tbody { font-size: 24rpx; color: #333; }
.list-td {
  padding: 20rpx 16rpx; display: flex; align-items: center;
  box-sizing: border-box; flex-shrink: 0;
}
.col-check { width: 72rpx; justify-content: center; }
.col-op { width: 160rpx; }
.col-id { width: 140rpx; }
.col-name { width: 220rpx; }
.col-code { width: 140rpx; }
.col-parent { width: 200rpx; }
.col-leader { width: 120rpx; }
.col-phone { width: 160rpx; }
.col-count { width: 90rpx; }
.col-status { width: 110rpx; }
.col-time { width: 200rpx; }
.mono { font-family: ui-monospace, Consolas, monospace; color: #6B5CAD; font-size: 22rpx; }
.name-text { font-weight: 600; color: #222; }
.time-text { font-size: 22rpx; color: #888; }
.op-link { color: #8B7CF6; font-size: 24rpx; }
.op-link.danger { color: #FF5B6B; }
.op-sep { color: #D1D5DB; margin: 0 8rpx; }
.status-tag {
  font-size: 22rpx; padding: 4rpx 14rpx; border-radius: 999rpx;
}
.status-tag.on { background: #E8F8EF; color: #1F9D57; }
.status-tag.off { background: #F3F4F6; color: #9CA3AF; }

.pagination {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 20rpx; gap: 16rpx; flex-wrap: wrap;
}
.total-text { font-size: 24rpx; color: #888; }
.b { color: #8B7CF6; font-weight: 600; }
.pager-wrap { display: flex; align-items: center; gap: 12rpx; }
.page-size-select {
  height: 56rpx; padding: 0 16rpx; border: 1px solid #E8E4F4; border-radius: 8rpx;
  display: flex; align-items: center; font-size: 22rpx; color: #666; background: #fff;
}
.pager { display: flex; gap: 8rpx; }
.page-btn {
  height: 56rpx; padding: 0 20rpx; border-radius: 8rpx; border: 1px solid #E8E4F4;
  background: #fff; font-size: 22rpx; color: #666;
  display: flex; align-items: center;
}
.page-btn.disabled { opacity: 0.45; }

.modal-mask {
  position: fixed; left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(20, 16, 40, 0.45); z-index: 1000;
  display: flex; align-items: center; justify-content: center;
}
.modal-box {
  width: 680rpx; max-height: 86vh; background: #fff; border-radius: 20rpx;
  display: flex; flex-direction: column; overflow: hidden;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 28rpx 32rpx; border-bottom: 1px solid #F0ECF8;
}
.modal-title { font-size: 30rpx; font-weight: 600; color: #111; }
.modal-close { font-size: 40rpx; color: #999; line-height: 1; padding: 0 8rpx; }
.modal-body { padding: 24rpx 32rpx; overflow-y: auto; flex: 1; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 16rpx;
  padding: 20rpx 32rpx; border-top: 1px solid #F0ECF8;
}
.form-row {
  display: flex; align-items: center; gap: 16rpx; margin-bottom: 20rpx;
}
.form-row.top { align-items: flex-start; }
.form-label { width: 140rpx; flex-shrink: 0; font-size: 24rpx; color: #666; }
.form-input {
  flex: 1; height: 68rpx; padding: 0 16rpx; border: 1px solid #E8E4F4;
  border-radius: 10rpx; font-size: 24rpx; color: #333; box-sizing: border-box; background: #fff;
}
.form-input.readonly { background: #F7F5FC; color: #888; }
.form-input.picker { display: flex; align-items: center; }
.form-textarea {
  flex: 1; min-height: 140rpx; padding: 14rpx 16rpx; border: 1px solid #E8E4F4;
  border-radius: 10rpx; font-size: 24rpx; color: #333; box-sizing: border-box;
}
</style>
