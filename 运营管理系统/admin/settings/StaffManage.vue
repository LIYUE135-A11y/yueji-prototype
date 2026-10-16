<template>
  <view class="staff-manage">
    <view class="filter-bar">
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">员工姓名</text>
          <input class="filter-input" v-model="filterForm.keyword" placeholder="姓名/工号/手机" />
        </view>
        <view class="filter-item">
          <text class="filter-label">所属部门</text>
          <picker :range="deptOptions" @change="e => filterForm.dept = deptOptions[e.detail.value]">
            <view class="filter-input filter-picker">
              <text :class="{ placeholder: !filterForm.dept || filterForm.dept === '全部' }">
                {{ filterForm.dept || '请选择' }}
              </text>
            </view>
          </picker>
        </view>
        <view class="filter-item">
          <text class="filter-label">角色</text>
          <picker :range="roleOptions" @change="e => filterForm.role = roleOptions[e.detail.value]">
            <view class="filter-input filter-picker">
              <text :class="{ placeholder: !filterForm.role || filterForm.role === '全部' }">
                {{ filterForm.role || '请选择' }}
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
        <view class="btn btn-primary" @click="onAdd"><text>新建员工</text></view>
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
            <view class="list-td col-id">工号</view>
            <view class="list-td col-name">姓名</view>
            <view class="list-td col-account">账号</view>
            <view class="list-td col-dept">所属部门</view>
            <view class="list-td col-role">角色</view>
            <view class="list-td col-phone">手机号</view>
            <view class="list-td col-email">邮箱</view>
            <view class="list-td col-status">状态</view>
            <view class="list-td col-time">入职时间</view>
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
            <view class="list-td col-account"><text class="mono">{{ item.account }}</text></view>
            <view class="list-td col-dept"><text>{{ item.deptName }}</text></view>
            <view class="list-td col-role"><text class="role-tag">{{ item.role }}</text></view>
            <view class="list-td col-phone"><text>{{ item.phone }}</text></view>
            <view class="list-td col-email"><text class="email-text">{{ item.email }}</text></view>
            <view class="list-td col-status">
              <text class="status-tag" :class="item.statusKey">{{ item.status }}</text>
            </view>
            <view class="list-td col-time"><text class="time-text">{{ item.joinTime }}</text></view>
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

    <view v-if="formVisible" class="modal-mask" @click="closeForm">
      <view class="modal-box" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ formMode === 'edit' ? '编辑员工' : '新建员工' }}</text>
          <text class="modal-close" @click="closeForm">×</text>
        </view>
        <view class="modal-body">
          <view class="form-row">
            <text class="form-label">工号</text>
            <input class="form-input readonly" v-model="form.id" disabled />
          </view>
          <view class="form-row">
            <text class="form-label">姓名</text>
            <input class="form-input" v-model="form.name" placeholder="请输入姓名" />
          </view>
          <view class="form-row">
            <text class="form-label">账号</text>
            <input class="form-input" v-model="form.account" placeholder="登录账号" />
          </view>
          <view class="form-row">
            <text class="form-label">所属部门</text>
            <picker :range="formDeptOptions" @change="onFormDeptChange">
              <view class="form-input picker"><text>{{ form.deptName || '请选择' }}</text></view>
            </picker>
          </view>
          <view class="form-row">
            <text class="form-label">角色</text>
            <picker :range="formRoleOptions" @change="e => form.role = formRoleOptions[e.detail.value]">
              <view class="form-input picker"><text>{{ form.role }}</text></view>
            </picker>
          </view>
          <view class="form-row">
            <text class="form-label">手机号</text>
            <input class="form-input" v-model="form.phone" placeholder="请输入手机号" />
          </view>
          <view class="form-row">
            <text class="form-label">邮箱</text>
            <input class="form-input" v-model="form.email" placeholder="请输入邮箱" />
          </view>
          <view class="form-row">
            <text class="form-label">状态</text>
            <picker :range="formStatusOptions" @change="e => form.status = formStatusOptions[e.detail.value]">
              <view class="form-input picker"><text>{{ form.status }}</text></view>
            </picker>
          </view>
          <view class="form-row">
            <text class="form-label">入职时间</text>
            <input class="form-input" v-model="form.joinTime" placeholder="YYYY-MM-DD" />
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
const DEPT_NAMES = [
  '阅己美妆总部', '运营中心', '商品中心', '客户服务部', '技术研发部',
  '市场品牌部', '仓储物流部', '财务部', '人力资源部', '活动运营组',
  '店铺装修组', '在线客服组', '内容种草组', '华北仓'
]

const ROLE_NAMES = ['超级管理员', '运营管理员', '商品运营', '客服专员', '技术开发', '市场专员', '仓储专员', '财务专员', 'HR专员']

const STAFF_SEED = [
  { id: 'E10001', name: '林晓薇', account: 'linxw', deptName: '阅己美妆总部', role: '超级管理员', phone: '138****1001', email: 'linxw@yueji.com', status: '在职', statusKey: 'on', joinTime: '2023-03-01', remark: 'CEO' },
  { id: 'E10002', name: '周启明', account: 'zhouqm', deptName: '运营中心', role: '运营管理员', phone: '139****2202', email: 'zhouqm@yueji.com', status: '在职', statusKey: 'on', joinTime: '2023-05-12', remark: '运营负责人' },
  { id: 'E10003', name: '陈思远', account: 'chensy', deptName: '商品中心', role: '商品运营', phone: '137****3303', email: 'chensy@yueji.com', status: '在职', statusKey: 'on', joinTime: '2023-06-18', remark: '' },
  { id: 'E10004', name: '赵婉清', account: 'zhaowq', deptName: '客户服务部', role: '客服专员', phone: '136****4404', email: 'zhaowq@yueji.com', status: '在职', statusKey: 'on', joinTime: '2023-07-01', remark: '客服主管' },
  { id: 'E10005', name: '韩予安', account: 'hanya', deptName: '技术研发部', role: '技术开发', phone: '135****5505', email: 'hanya@yueji.com', status: '在职', statusKey: 'on', joinTime: '2023-08-20', remark: '研发负责人' },
  { id: 'E10006', name: '苏念', account: 'sunian', deptName: '市场品牌部', role: '市场专员', phone: '158****6606', email: 'sunian@yueji.com', status: '在职', statusKey: 'on', joinTime: '2023-09-10', remark: '' },
  { id: 'E10007', name: '马骏', account: 'majun', deptName: '仓储物流部', role: '仓储专员', phone: '159****7707', email: 'majun@yueji.com', status: '在职', statusKey: 'on', joinTime: '2023-10-05', remark: '' },
  { id: 'E10008', name: '何静', account: 'hejing', deptName: '财务部', role: '财务专员', phone: '186****8808', email: 'hejing@yueji.com', status: '在职', statusKey: 'on', joinTime: '2023-11-02', remark: '' },
  { id: 'E10009', name: '顾晴', account: 'guqing', deptName: '人力资源部', role: 'HR专员', phone: '187****9909', email: 'guqing@yueji.com', status: '在职', statusKey: 'on', joinTime: '2023-12-15', remark: '' },
  { id: 'E10010', name: '许澄', account: 'xucheng', deptName: '活动运营组', role: '运营管理员', phone: '133****1010', email: 'xucheng@yueji.com', status: '在职', statusKey: 'on', joinTime: '2024-01-08', remark: '' },
  { id: 'E10011', name: '叶岚', account: 'yelan', deptName: '店铺装修组', role: '运营管理员', phone: '132****1111', email: 'yelan@yueji.com', status: '在职', statusKey: 'on', joinTime: '2024-02-20', remark: '' },
  { id: 'E10012', name: '白柠', account: 'bainin', deptName: '在线客服组', role: '客服专员', phone: '131****1212', email: 'bainin@yueji.com', status: '在职', statusKey: 'on', joinTime: '2024-03-11', remark: '' },
  { id: 'E10013', name: '沈川', account: 'shenchuan', deptName: '技术研发部', role: '技术开发', phone: '188****1313', email: 'shenchuan@yueji.com', status: '离职', statusKey: 'off', joinTime: '2024-04-01', remark: '算法方向' },
  { id: 'E10014', name: '乔薇', account: 'qiaowei', deptName: '内容种草组', role: '市场专员', phone: '185****1414', email: 'qiaowei@yueji.com', status: '在职', statusKey: 'on', joinTime: '2024-05-16', remark: '' },
  { id: 'E10015', name: '唐磊', account: 'tanglei', deptName: '华北仓', role: '仓储专员', phone: '182****1515', email: 'tanglei@yueji.com', status: '在职', statusKey: 'on', joinTime: '2024-06-08', remark: '' },
  { id: 'E10016', name: '陆婉', account: 'luwan', deptName: '商品中心', role: '商品运营', phone: '181****1616', email: 'luwan@yueji.com', status: '在职', statusKey: 'on', joinTime: '2024-07-22', remark: '类目运营' },
  { id: 'E10017', name: '纪安', account: 'jian', deptName: '运营中心', role: '运营管理员', phone: '180****1717', email: 'jian@yueji.com', status: '停用', statusKey: 'off', joinTime: '2024-08-01', remark: '账号暂停' },
  { id: 'E10018', name: '夏禾', account: 'xiahe', deptName: '在线客服组', role: '客服专员', phone: '178****1818', email: 'xiahe@yueji.com', status: '在职', statusKey: 'on', joinTime: '2025-01-06', remark: '' }
]

function cloneStaff(s) {
  return {
    id: s.id,
    name: s.name || '',
    account: s.account || '',
    deptName: s.deptName || '',
    role: s.role || '',
    phone: s.phone || '',
    email: s.email || '',
    status: s.status || '在职',
    statusKey: s.statusKey || (s.status === '在职' ? 'on' : 'off'),
    joinTime: s.joinTime || '',
    remark: s.remark || '',
    _checked: false
  }
}

function statusKeyOf(status) {
  return status === '在职' ? 'on' : 'off'
}

export default {
  name: 'StaffManage',
  data() {
    return {
      statusOptions: ['全部', '在职', '停用', '离职'],
      roleOptions: ['全部'].concat(ROLE_NAMES),
      deptOptions: ['全部'].concat(DEPT_NAMES),
      filterForm: { keyword: '', dept: '', role: '', status: '' },
      applied: { keyword: '', dept: '', role: '', status: '' },
      pageSizeList: ['10 条/页', '20 条/页', '50 条/页'],
      pageSize: '10 条/页',
      pageNum: 1,
      list: STAFF_SEED.map(cloneStaff),
      formVisible: false,
      formMode: 'add',
      formEditId: '',
      formStatusOptions: ['在职', '停用', '离职'],
      formRoleOptions: ROLE_NAMES.slice(),
      formDeptOptions: DEPT_NAMES.slice(),
      form: {
        id: '', name: '', account: '', deptName: '', role: '运营管理员',
        phone: '', email: '', status: '在职', joinTime: '', remark: ''
      }
    }
  },
  computed: {
    filteredList() {
      const f = this.applied
      const kw = (f.keyword || '').trim().toLowerCase()
      return this.list.filter((s) => {
        if (kw) {
          const blob = ((s.name || '') + (s.account || '') + (s.id || '') + (s.phone || '')).toLowerCase()
          if (!blob.includes(kw)) return false
        }
        if (f.dept && f.dept !== '全部' && s.deptName !== f.dept) return false
        if (f.role && f.role !== '全部' && s.role !== f.role) return false
        if (f.status && f.status !== '全部' && s.status !== f.status) return false
        return true
      })
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
      return list.length > 0 && list.every((s) => s._checked)
    }
  },
  methods: {
    applySearch() {
      this.applied = { ...this.filterForm }
      this.pageNum = 1
    },
    resetFilter() {
      this.filterForm = { keyword: '', dept: '', role: '', status: '' }
      this.applied = { keyword: '', dept: '', role: '', status: '' }
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
      this.displayList.forEach((s) => { this.$set(s, '_checked', checked) })
    },
    toggleRow(item) { this.$set(item, '_checked', !item._checked) },
    nextId() {
      let max = 10000
      this.list.forEach((s) => {
        const n = parseInt(String(s.id).replace(/\D/g, ''), 10)
        if (!isNaN(n) && n > max) max = n
      })
      return 'E' + (max + 1)
    },
    onAdd() {
      const now = new Date()
      const p = (n) => String(n).padStart(2, '0')
      this.formMode = 'add'
      this.formEditId = ''
      this.form = {
        id: this.nextId(),
        name: '',
        account: '',
        deptName: DEPT_NAMES[1] || '',
        role: '运营管理员',
        phone: '',
        email: '',
        status: '在职',
        joinTime: now.getFullYear() + '-' + p(now.getMonth() + 1) + '-' + p(now.getDate()),
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
        account: item.account,
        deptName: item.deptName,
        role: item.role,
        phone: item.phone,
        email: item.email,
        status: item.status,
        joinTime: item.joinTime,
        remark: item.remark || ''
      }
      this.formVisible = true
    },
    closeForm() {
      this.formVisible = false
      this.formEditId = ''
    },
    onFormDeptChange(e) {
      this.form.deptName = this.formDeptOptions[e.detail.value] || ''
    },
    submitForm() {
      const name = (this.form.name || '').trim()
      const account = (this.form.account || '').trim()
      if (!name) return uni.showToast({ title: '请输入姓名', icon: 'none' })
      if (!account) return uni.showToast({ title: '请输入账号', icon: 'none' })
      if (!this.form.deptName) return uni.showToast({ title: '请选择部门', icon: 'none' })
      const dup = this.list.find((s) => s.account === account && s.id !== this.formEditId)
      if (dup) return uni.showToast({ title: '账号已存在', icon: 'none' })
      const payload = {
        id: this.form.id,
        name,
        account,
        deptName: this.form.deptName,
        role: this.form.role || '运营管理员',
        phone: (this.form.phone || '').trim() || '—',
        email: (this.form.email || '').trim() || '—',
        status: this.form.status,
        statusKey: statusKeyOf(this.form.status),
        joinTime: (this.form.joinTime || '').trim() || '—',
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
        content: '确定删除员工「' + item.name + '」吗？',
        success: (res) => {
          if (!res.confirm) return
          this.list = this.list.filter((s) => s.id !== item.id)
          uni.showToast({ title: '已删除', icon: 'success' })
        }
      })
    },
    onBatchDelete() {
      const checked = this.list.filter((s) => s._checked)
      if (!checked.length) return uni.showToast({ title: '请先选择员工', icon: 'none' })
      uni.showModal({
        title: '确认删除',
        content: '确定删除选中的 ' + checked.length + ' 名员工吗？',
        success: (res) => {
          if (!res.confirm) return
          const ids = checked.map((s) => s.id)
          this.list = this.list.filter((s) => ids.indexOf(s.id) < 0)
          uni.showToast({ title: '已删除', icon: 'success' })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.staff-manage { width: 100%; }

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
.list-table { min-width: 1680rpx; }
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
.col-name { width: 120rpx; }
.col-account { width: 140rpx; }
.col-dept { width: 200rpx; }
.col-role { width: 160rpx; }
.col-phone { width: 160rpx; }
.col-email { width: 260rpx; }
.col-status { width: 110rpx; }
.col-time { width: 160rpx; }
.mono { font-family: ui-monospace, Consolas, monospace; color: #6B5CAD; font-size: 22rpx; }
.name-text { font-weight: 600; color: #222; }
.email-text { font-size: 22rpx; color: #666; }
.time-text { font-size: 22rpx; color: #888; }
.role-tag {
  font-size: 22rpx; padding: 4rpx 12rpx; border-radius: 8rpx;
  background: #F0EBFF; color: #6B5CAD;
}
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
