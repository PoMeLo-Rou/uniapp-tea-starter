<template>
    <view class="main-actions">
      <view class="action-card" @click="goToOrder('self')">
        <image class="action-icon" src="https://img.icons8.com/color/96/tea-cup.png" mode="aspectFit"></image>
        <view class="action-text">
          <text class="title">到店自取</text>
          <text class="desc">下单免排队</text>
        </view>
      </view>
      <view class="divider"></view>
      <view class="action-card" @click="goToOrder('delivery')">
        <view class="action-icon delivery-icon">
          <view class="delivery-box"></view>
          <view class="delivery-front"></view>
          <view class="delivery-wheel left"></view>
          <view class="delivery-wheel right"></view>
        </view>
        <view class="action-text">
          <text class="title">外送</text>
          <text class="desc">送货上门</text>
        </view>
      </view>
    </view>
  </template>
  
  <script setup>
  const goToOrder = (type) => {
    uni.switchTab({
      url: '/pages/order/order',
      success: () => {
        // 通过全局事件通知点单页的 header 切换模式
        const mode = type;
        setTimeout(() => {
          uni.$emit('orderModeChange', mode);
        }, 200);
      }
    });
  };
  </script>
  
  <style lang="scss" scoped>
  .main-actions {
    margin: 0 30rpx;
    background-color: #fff;
    border-radius: 20rpx;
    display: flex;
    padding: 40rpx 0;
    .action-card {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      .action-icon { width: 100rpx; height: 100rpx; margin-bottom: 20rpx; }
      .delivery-icon { position: relative; box-sizing: border-box; }
      .delivery-box {
        position: absolute;
        left: 12rpx;
        top: 30rpx;
        width: 46rpx;
        height: 34rpx;
        border-radius: 8rpx;
        background: #16b8cf;
        box-shadow: inset 0 -8rpx 0 #0790ac;
      }
      .delivery-box::before {
        content: '';
        position: absolute;
        left: 8rpx;
        top: 8rpx;
        width: 8rpx;
        height: 8rpx;
        border-radius: 50%;
        background: #ffe36e;
        box-shadow: 16rpx 0 0 #ffe36e;
      }
      .delivery-front {
        position: absolute;
        left: 56rpx;
        top: 38rpx;
        width: 26rpx;
        height: 26rpx;
        border-radius: 6rpx 12rpx 8rpx 4rpx;
        background: #f8b400;
      }
      .delivery-wheel {
        position: absolute;
        top: 62rpx;
        width: 16rpx;
        height: 16rpx;
        border-radius: 50%;
        background: #023993;
        border: 4rpx solid #e5f6fb;
        box-sizing: border-box;
      }
      .delivery-wheel.left { left: 20rpx; }
      .delivery-wheel.right { left: 64rpx; }
      .action-text {
        text-align: center;
        .title { font-size: 34rpx; font-weight: bold; display: block; }
        .desc { font-size: 24rpx; color: #999; margin-top: 8rpx; }
      }
    }
    .divider { width: 2rpx; height: 120rpx; background-color: #eee; }
  }
  </style>
