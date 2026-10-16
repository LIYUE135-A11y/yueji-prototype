<template>
  <view class="role-manage">
    <view class="role-layout">
      <!-- 左侧角色列表 -->
      <view class="role-sider">
        <view class="role-sider-head">
          <text class="role-sider-title">角色列表</text>
        </view>
        <view class="btn btn-primary role-add-btn" @click="onAddRole"><text>+ 新增角色</text></view>
        <scroll-view scroll-y class="role-sider-list" :show-scrollbar="false">
          <view
            v-for="role in list"
            :key="role.id"
            class="role-sider-item"
            :class="{ active: selectedId === role.id }"
            @click="selectRole(role.id)"
          >
            <text class="role-sider-name">{{ role.name }}</text>
            <text class="role-sider-status" :class="role.status === '已启用' ? 'on' : 'off'">{{ role.status }}</text>
          </view>
        </scroll-view>
      </view>

      <!-- 右侧权限详情 -->
      <view class="role-main" v-if="currentRole">
        <view class="role-main-head">
          <view class="role-main-info">
            <text class="role-main-name">{{ currentRole.name }}</text>
            <text class="role-main-desc">{{ currentRole.desc || '—' }} · 关联员工 {{ currentRole.staffCount || 0 }} · 编码 {{ currentRole.code || '—' }}</text>
          </view>
          <view class="role-main-actions">
            <view
              class="btn btn-default"
              :class="{ disabled: currentRole.locked }"
              @click="onEditRole"
            ><text>编辑角色</text></view>
            <view
              class="btn btn-default"
              :class="{ disabled: currentRole.locked }"
              @click="onDeleteRole"
            ><text>删除</text></view>
            <view class="btn btn-primary" @click="onSavePerms"><text>保存权限</text></view>
          </view>
        </view>

        <view class="perm-section">
          <view class="perm-section-head">
            <view>
              <text class="perm-section-title">功能页面权限</text>
              <text class="perm-section-tip">自动映射侧栏一级菜单；页面内含 Tab 二级菜单时自动同步子页面并匹配对应操作权限</text>
            </view>
            <label class="perm-check-all">
              <checkbox :checked="allChecked" @change="toggleAll" color="#8B7CF6" style="transform:scale(0.85);" />
              <text>全选</text>
            </label>
          </view>

          <scroll-view scroll-y class="perm-list" :show-scrollbar="false">
            <view
              v-for="mod in modules"
              :key="mod.id"
              class="perm-card"
              :class="{ expanded: expandedId === mod.id }"
            >
              <view class="perm-card-row" @click="toggleExpand(mod.id)">
                <view class="perm-card-left" @click.stop>
                  <checkbox
                    :checked="isModuleOn(mod)"
                    @change="toggleModule(mod, $event)"
                    color="#8B7CF6"
                    style="transform:scale(0.85);"
                  />
                  <text class="perm-mod-name">{{ mod.name }}</text>
                  <text v-if="mod.subMenus && mod.subMenus.length" class="perm-sub-hint">
                    含 {{ mod.subMenus.length }} 个二级菜单
                  </text>
                </view>
                <view class="perm-card-right">
                  <text class="perm-page-count">{{ pageCountText(mod) }}</text>
                  <text class="perm-arrow" :class="{ open: expandedId === mod.id }">▾</text>
                </view>
              </view>

              <view v-if="expandedId === mod.id" class="perm-card-body">
                <view v-if="mod.subMenus && mod.subMenus.length" class="perm-block">
                  <text class="perm-block-title">二级菜单</text>
                  <view class="perm-chip-row">
                    <label
                      v-for="(sub, si) in mod.subMenus"
                      :key="mod.id + '-sub-' + si"
                      class="perm-chip"
                    >
                      <checkbox
                        :checked="!!draftPerms[mod.id + '::sub::' + si]"
                        @change="toggleKey(mod.id + '::sub::' + si, $event)"
                        color="#8B7CF6"
                        style="transform:scale(0.8);"
                      />
                      <text>{{ sub }}</text>
                    </label>
                  </view>
                </view>
                <view class="perm-block">
                  <view class="perm-block-head">
                    <text class="perm-block-title">操作权限配置</text>
                    <label class="perm-mini-all">
                      <checkbox
                        :checked="isActionsAllOn(mod)"
                        @change="toggleActionsAll(mod, $event)"
                        color="#8B7CF6"
                        style="transform:scale(0.8);"
                      />
                      <text>模块全选 ({{ actionCountText(mod) }})</text>
                    </label>
                  </view>
                  <view class="perm-chip-row">
                    <label
                      v-for="act in mod.actions"
                      :key="mod.id + '::' + act"
                      class="perm-chip"
                    >
                      <checkbox
                        :checked="!!draftPerms[mod.id + '::' + act]"
                        @change="toggleKey(mod.id + '::' + act, $event)"
                        color="#8B7CF6"
                        style="transform:scale(0.8);"
                      />
                      <text>{{ act }}</text>
                    </label>
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>

      <view v-else class="role-main empty">
        <text class="empty-tip">请选择左侧角色</text>
      </view>
    </view>
  </view>
</template>

<script>
import {
  PERM_MODULES,
  loadRoleList,
  saveRoleList,
  cloneRole,
  moduleCheckedCount,
  setModuleChecked,
  isAllModulesChecked,
  setAllModules
} from '../../common/role-data.js'

export default {
  name: 'RoleManage',
  data() {
    return {
      modules: PERM_MODULES,
      list: [],
      selectedId: '',
      expandedId: 'product',
      draftPerms: {}
    }
  },
  computed: {
    currentRole() {
      return this.list.find((r) => r.id === this.selectedId) || null
    },
    allChecked() {
      return isAllModulesChecked(this.draftPerms)
    }
  },
  mounted() {
    this.reloadFromStaff()
  },
  activated() {
    this.reloadFromStaff()
  },
  methods: {
    resolveStaffList() {
      const parent = this.$parent
      if (parent && Array.isArray(parent.staffList) && parent.staffList.length) {
        return parent.staffList
      }
      // 无共享员工实例时，loadRoleList 会用员工角色枚举兜底
      return null
    },
    reloadFromStaff() {
      const staff = this.resolveStaffList()
      this.list = loadRoleList(staff)
      if (this.list.length) {
        const keep = this.list.find((r) => r.id === this.selectedId)
        this.selectRole(keep ? keep.id : this.list[0].id)
      } else {
        this.selectedId = ''
        this.draftPerms = {}
      }
    },
    selectRole(id) {
      this.selectedId = id
      const role = this.list.find((r) => r.id === id)
      this.draftPerms = Object.assign({}, (role && role.perms) || {})
      this.expandedId = 'product'
    },
    isModuleOn(mod) {
      return !!this.draftPerms[mod.id]
    },
    pageCountText(mod) {
      const c = moduleCheckedCount(mod, this.draftPerms)
      return c.page + '/' + c.pageTotal + ' 页面'
    },
    actionCountText(mod) {
      const c = moduleCheckedCount(mod, this.draftPerms)
      return c.action + '/' + c.actionTotal
    },
    isActionsAllOn(mod) {
      return (mod.actions || []).every((a) => this.draftPerms[mod.id + '::' + a])
    },
    toggleExpand(id) {
      this.expandedId = this.expandedId === id ? '' : id
    },
    checkboxOn(e) {
      return !!(e && e.detail && e.detail.value && e.detail.value.length)
    },
    toggleAll(e) {
      this.draftPerms = setAllModules(this.draftPerms, this.checkboxOn(e))
    },
    toggleModule(mod, e) {
      this.draftPerms = setModuleChecked(mod, this.draftPerms, this.checkboxOn(e))
    },
    toggleKey(key, e) {
      const on = this.checkboxOn(e)
      const next = Object.assign({}, this.draftPerms)
      if (on) next[key] = true
      else delete next[key]
      if (on && key.indexOf('::') > 0) {
        const mid = key.split('::')[0]
        next[mid] = true
      }
      this.draftPerms = next
    },
    toggleActionsAll(mod, e) {
      const on = this.checkboxOn(e)
      const next = Object.assign({}, this.draftPerms)
      if (on) next[mod.id] = true
      ;(mod.actions || []).forEach((a) => {
        if (on) next[mod.id + '::' + a] = true
        else delete next[mod.id + '::' + a]
      })
      this.draftPerms = next
    },
    persist() {
      saveRoleList(this.list)
      this.reloadFromStaff()
    },
    onSavePerms() {
      if (!this.currentRole) return
      const idx = this.list.findIndex((r) => r.id === this.selectedId)
      if (idx < 0) return
      this.$set(this.list, idx, cloneRole({
        ...this.list[idx],
        perms: Object.assign({}, this.draftPerms)
      }))
      this.persist()
      uni.showToast({ title: '权限已保存', icon: 'success' })
    },
    onAddRole() {
      uni.showToast({ title: '角色来自员工管理，请在员工中维护角色后自动同步', icon: 'none' })
    },
    onEditRole() {
      if (!this.currentRole) return
      if (this.currentRole.locked) {
        return uni.showToast({ title: '系统内置角色不可编辑', icon: 'none' })
      }
      const newCode = typeof window !== 'undefined' && window.prompt
        ? window.prompt('角色编码', this.currentRole.code || '')
        : this.currentRole.code
      if (newCode === null) return
      const newDesc = typeof window !== 'undefined' && window.prompt
        ? window.prompt('角色说明', this.currentRole.desc || '')
        : this.currentRole.desc
      if (newDesc === null) return
      const newStatus = typeof window !== 'undefined' && window.prompt
        ? window.prompt('状态（已启用/已停用）', this.currentRole.status || '已启用')
        : this.currentRole.status
      if (newStatus === null) return
      const idx = this.list.findIndex((r) => r.id === this.selectedId)
      if (idx < 0) return
      this.$set(this.list, idx, cloneRole({
        ...this.list[idx],
        code: String(newCode || '').trim(),
        desc: String(newDesc || '').trim(),
        status: String(newStatus || '').trim() === '已停用' ? '已停用' : '已启用'
      }))
      this.persist()
      uni.showToast({ title: '已保存', icon: 'success' })
    },
    onDeleteRole() {
      if (!this.currentRole) return
      if (this.currentRole.locked) {
        return uni.showToast({ title: '系统内置角色不可删除', icon: 'none' })
      }
      if (Number(this.currentRole.staffCount) > 0) {
        return uni.showToast({
          title: '该角色下仍有员工，请先在员工管理中调整',
          icon: 'none'
        })
      }
      uni.showToast({
        title: '角色来自员工管理枚举，无法在此删除',
        icon: 'none'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.role-manage { min-height: 640rpx; }

.role-layout {
  display: flex;
  min-height: 720rpx;
  border: 1px solid #EEEAF5;
  border-radius: 16rpx;
  overflow: hidden;
  background: #fff;
}

.role-sider {
  width: 280rpx;
  flex-shrink: 0;
  background: #FAFAFC;
  border-right: 1px solid #EEEAF5;
  padding: 24rpx 20rpx;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.role-sider-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #222;
}

.role-add-btn {
  margin: 20rpx 0 16rpx;
  width: 100%;
  box-sizing: border-box;
}

.role-sider-list {
  flex: 1;
  max-height: 620rpx;
}

.role-sider-item {
  padding: 20rpx 18rpx;
  border-radius: 12rpx;
  margin-bottom: 8rpx;
  border-left: 4rpx solid transparent;
}
.role-sider-item.active {
  background: #F0EBFF;
  border-left-color: #8B7CF6;
}
.role-sider-name {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
}
.role-sider-status {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  &.on { color: #8B7CF6; }
  &.off { color: #AAA; }
}

.role-main {
  flex: 1;
  min-width: 0;
  padding: 28rpx 32rpx;
  display: flex;
  flex-direction: column;
  &.empty {
    align-items: center;
    justify-content: center;
  }
}

.empty-tip { color: #AAA; font-size: 28rpx; }

.role-main-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 24rpx;
  flex-wrap: wrap;
}

.role-main-name {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #222;
}
.role-main-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.role-main-actions {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.perm-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.perm-section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.perm-section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #222;
}
.perm-section-tip {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #AAA;
  line-height: 1.5;
  max-width: 900rpx;
}

.perm-check-all {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #555;
  flex-shrink: 0;
}

.perm-list {
  flex: 1;
  max-height: 560rpx;
}

.perm-card {
  border: 1px solid #EEEAF5;
  border-radius: 14rpx;
  background: #fff;
  margin-bottom: 12rpx;
  overflow: hidden;
}
.perm-card.expanded {
  border-color: #E0D8F8;
  box-shadow: 0 2rpx 8rpx rgba(139, 124, 246, 0.06);
}

.perm-card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22rpx 20rpx;
  gap: 12rpx;
}

.perm-card-left, .perm-card-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.perm-mod-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
}
.perm-sub-hint {
  font-size: 22rpx;
  color: #8B7CF6;
}
.perm-page-count {
  font-size: 22rpx;
  color: #888;
}
.perm-arrow {
  font-size: 22rpx;
  color: #BBB;
  transform: rotate(-90deg);
  transition: transform 0.15s;
  &.open {
    transform: rotate(0deg);
    color: #8B7CF6;
  }
}

.perm-card-body {
  padding: 0 20rpx 20rpx;
  border-top: 1px solid #F5F2FA;
}

.perm-block { margin-top: 16rpx; }
.perm-block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}
.perm-block-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #555;
}
.perm-mini-all {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  font-size: 22rpx;
  color: #666;
}

.perm-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx 20rpx;
}
.perm-chip {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  font-size: 24rpx;
  color: #444;
}

.btn {
  min-width: 120rpx;
  height: 64rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  &.disabled { opacity: 0.45; pointer-events: none; }
}
.btn-primary { background: #8B7CF6; color: #fff; }
.btn-default {
  background: #fff;
  color: #666;
  border: 1px solid #E5E5E5;
}
</style>
