<template>
  <view class="settings-panel">
    <scroll-view scroll-x class="settings-tabs-scroll" :show-scrollbar="false">
      <view class="settings-tabs">
        <view
          v-for="item in menus"
          :key="item.id"
          class="settings-tab"
          :class="{ active: modelValue === item.id }"
          @click="onSelect(item.id)"
        >
          <text class="settings-tab-icon">{{ item.icon }}</text>
          <text class="settings-tab-label">{{ item.name }}</text>
        </view>
      </view>
    </scroll-view>

    <view class="settings-body">
      <BrandManage v-if="modelValue === 'brand'" />
      <CategoryManage v-else-if="modelValue === 'category'" />
      <TagManage v-else-if="modelValue === 'tag'" />
      <DeptManage v-else-if="modelValue === 'dept'" />
      <StaffManage v-else-if="modelValue === 'staff'" />
      <RoleManage v-else-if="modelValue === 'role'" />
      <LlmManage v-else-if="modelValue === 'llm'" />
      <view v-else class="settings-empty">
        <text class="settings-empty-title">{{ currentName }}</text>
        <text class="settings-empty-tip">页面内容为空</text>
      </view>
    </view>
  </view>
</template>

<script>
import BrandManage from './BrandManage.vue'
import CategoryManage from './CategoryManage.vue'
import TagManage from './TagManage.vue'
import DeptManage from './DeptManage.vue'
import StaffManage from './StaffManage.vue'
import RoleManage from './RoleManage.vue'
import LlmManage from './LlmManage.vue'

export const SETTINGS_MENUS = [
  { id: 'brand', name: '品牌管理', icon: '🏷' },
  { id: 'category', name: '分类管理', icon: '📂' },
  { id: 'tag', name: '标签分类管理', icon: '🔖' },
  { id: 'dept', name: '部门管理', icon: '🏢' },
  { id: 'staff', name: '员工管理', icon: '👤' },
  { id: 'role', name: '角色权限管理', icon: '🛡' },
  { id: 'llm', name: '大模型配置', icon: '✦' },
  { id: 'kb', name: '知识库管理', icon: '📚' }
]

export default {
  name: 'SettingsPanel',
  components: { BrandManage, CategoryManage, TagManage, DeptManage, StaffManage, RoleManage, LlmManage },
  props: {
    modelValue: { type: String, default: 'brand' }
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return { menus: SETTINGS_MENUS }
  },
  computed: {
    currentName() {
      const hit = this.menus.find((m) => m.id === this.modelValue)
      return hit ? hit.name : '系统设置'
    }
  },
  methods: {
    onSelect(id) {
      this.$emit('update:modelValue', id)
      this.$emit('change', id)
    }
  }
}
</script>

<style lang="scss" scoped>
.settings-panel {
  min-height: 640rpx;
  background: #fff;
  border-radius: 20rpx;
  border: 1px solid #EEEAF5;
  box-shadow: 0 2rpx 8rpx rgba(45, 42, 58, 0.06);
  overflow: hidden;
}

.settings-tabs-scroll {
  width: 100%;
  white-space: nowrap;
  border-bottom: 1px solid #EEEAF5;
  background: #FAFAFC;
}

.settings-tabs {
  display: inline-flex;
  align-items: stretch;
  min-width: 100%;
  padding: 0 16rpx;
  box-sizing: border-box;
}

.settings-tab {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  padding: 28rpx 24rpx;
  border-bottom: 4rpx solid transparent;
  flex-shrink: 0;
  cursor: pointer;
}

.settings-tab:hover {
  background: rgba(139, 124, 246, 0.04);
}

.settings-tab.active {
  border-bottom-color: #8B7CF6;
}

.settings-tab-icon {
  font-size: 26rpx;
}

.settings-tab-label {
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

.settings-tab.active .settings-tab-label {
  color: #6B5CAD;
  font-weight: 600;
}

.settings-body {
  min-height: 640rpx;
  padding: 28rpx;
}

.settings-empty {
  min-height: 520rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.settings-empty-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #222;
}

.settings-empty-tip {
  font-size: 26rpx;
  color: #AAA;
}
</style>
