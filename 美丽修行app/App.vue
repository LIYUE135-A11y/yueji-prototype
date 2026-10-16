<script>
export default {
  onLaunch() {
    console.log('阅己美妆 App 启动')
  },
  onShow() {},
  onHide() {}
}
</script>

<style lang="scss">
@import './uni.scss';

page {
  background-color: $primary-bg;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  color: $text-primary;
  font-size: 28rpx;
  line-height: 1.5;
}

/* 全局紫色主题工具类 */
.text-primary {
  color: $primary-color;
}

.bg-primary {
  background-color: $primary-color;
}

.bg-gradient {
  background: linear-gradient(135deg, $primary-gradient-start, $primary-gradient-end);
}

/* 全局：固定高度页面内主滚动区 */
.page {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.page > .scroll,
.page > .feed-scroll,
.page > .list-scroll,
.page > .page-scroll {
  flex: 1;
  min-height: 0;
}
</style>
