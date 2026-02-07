<template>
  <view class="custom-tabbar-container">
    <view class="tabbar-glass">
      <view 
        v-for="(item, index) in tabList" 
        :key="index" 
        class="tab-item"
        @click="switchTab(item.pagePath)"
      >
        <image :src="currentPath === item.pagePath ? item.selectedIconPath : item.iconPath" class="icon" />
        <text :class="['text', currentPath === item.pagePath ? 'active' : '']">{{ item.text }}</text>
      </view>
    </view>
    <view class="safe-area"></view>
  </view>
</template>

<script setup>
const tabList = [
  {
    pagePath: "pages/index/index",
    text: "点单",
    iconPath: "/static/tabBar/index.png",
    selectedIconPath: "/static/tabBar/index-selected.png"
  },
  {
    pagePath: "pages/order/order",
    text: "订单",
    iconPath: "/static/tabBar/order.png",
    selectedIconPath: "/static/tabBar/order-selected.png"
  },
  {
    pagePath: "pages/mine/mine",
    text: "我的",
    iconPath: "/static/tabBar/mine.png",
    selectedIconPath: "/static/tabBar/mine-selected.png"
  }
];

const props = defineProps(['currentPath']);

const switchTab = (url) => {
  uni.switchTab({ url: '/' + url });
};
</script>

<style lang="scss">
.custom-tabbar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  padding: 10rpx 30rpx;
  
  /* 毛玻璃核心样式 */
  .tabbar-glass {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 110rpx;
    background: rgba(255, 255, 255, 0.6); /* 半透明背景 */
    backdrop-filter: blur(20px); /* 模糊滤镜 */
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 40rpx; /* 圆角悬浮效果 */
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  }

  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    .icon { width: 44rpx; height: 44rpx; }
    .text {
      font-size: 20rpx;
      color: #999;
      margin-top: 4rpx;
      &.active { color: #023993; font-weight: bold; }
    }
  }

  .safe-area {
    height: constant(safe-area-inset-bottom);
    height: env(safe-area-inset-bottom);
  }
}
</style>