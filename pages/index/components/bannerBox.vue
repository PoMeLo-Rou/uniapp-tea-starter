<template>
    <view class="banner-box" :style="{ paddingTop: safeAreaInsets.top + 'px' }">
      <swiper 
        class="banner-swiper" 
        circular 
        autoplay 
        interval="5000" 
        :current="current" 
        @change="onSwiperChange"
      >
        <swiper-item v-for="(item, index) in banners" :key="index">
          <image class="banner-img" :src="item" mode="aspectFill"></image>
        </swiper-item>
      </swiper>
  
      <view class="indicator-wrapper" v-if="banners.length > 1">
        <view class="indicator-track">
          <view 
            class="indicator-active" 
            :style="{
              width: (100 / banners.length) + '%',
              transform: `translateX(${current * 100}%)`
            }"
          ></view>
        </view>
      </view>
    </view>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  const { safeAreaInsets } = uni.getSystemInfoSync();
  const props = defineProps({
    banners: { 
      type: Array, 
      default: () => [
        'https://images.unsplash.com/photo-1544787210-2211d44b565a?w=800',
        'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800',
        'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800',
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
        'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?w=800'
      ] 
    }
  });
  
  const current = ref(0);
  
  const onSwiperChange = (e) => {
    current.value = e.detail.current;
  };
  </script>
  
  <style lang="scss" scoped>
  .banner-box {
    /* 移除原本的 padding，或者确保指示器能撑满宽度 */
    padding: 30rpx 30rpx 0; // 左右不留边距，让线能贴边
    background-color: transparent;
  
    .banner-swiper {
      height: 350rpx; // 只有图片缩进，线不缩进
      border-radius: 20rpx;
      overflow: hidden;
      transform: translateY(0); 
      box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.08);
  
      .banner-img {
        width: 100%;
        height: 100%;
      }
    }
  
    .indicator-wrapper {
      width: 100%; // 强制容器撑满屏幕
      margin-top: 24rpx;
    }
  
    .indicator-track {
      position: relative;
      width: 100%; // 轨道宽度为 100% 屏幕宽
      height: 4rpx;
      background-color: #f0f0f0; // 底色线段
    }
  
    .indicator-active {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background-color: #023993; // 你的品牌蓝色
      /* 动画过渡 */
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }
  </style>