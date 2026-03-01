<template>
      <!-- 左侧分类导航 -->
      <scroll-view scroll-y class="left-nav" :scroll-into-view="'nav-' + activeCategory">
        <view v-for="cat in categories" :key="cat.id" :id="'nav-' + cat.id"
          :class="['nav-item', activeCategory === cat.id ? 'active' : '']" @click="scrollToCategory(cat.id)">
          <view v-if="activeCategory === cat.id" class="active-bar"></view>
          <text class="nav-icon">{{ cat.icon }}</text>
          <text class="nav-name">{{ cat.name }}</text>
        </view>
        <!-- 底部占位 -->
        <view style="height: 100rpx;"></view>
      </scroll-view>
  </template>
  
  <script setup>
  defineProps(['categories', 'activeCategory']);
  defineEmits(['select']);
  </script>
  
  <style lang="scss" scoped>
  .left-nav {
    width: 160rpx;
    background-color: #f8f8f8;
    height: 100%;
  }
  .nav-item {
    padding: 30rpx 10rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  .nav-item.active {
    background-color: #fff;
  }
  .nav-item.active .nav-name {
    color: #333;
    font-weight: bold;
  }
  .active-bar {
    position: absolute;
    left: 0;
    top: 30rpx;
    bottom: 30rpx;
    width: 8rpx;
    background-color: #023993;
    border-radius: 0 4rpx 4rpx 0;
  }
  .nav-icon { font-size: 36rpx; margin-bottom: 6rpx; }
  .nav-name { font-size: 24rpx; color: #666; }
  </style>