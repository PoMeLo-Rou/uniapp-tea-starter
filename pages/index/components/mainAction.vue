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
      <view class="action-card" @click="goToOrder('takeout')">
        <image class="action-icon" src="https://img.icons8.com/color/96/delivery-man.png" mode="aspectFit"></image>
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
      url: '/pages/order/order'
    });
    uni.switchTab({ url: '/pages/order/order' });
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
      .action-text {
        text-align: center;
        .title { font-size: 34rpx; font-weight: bold; display: block; }
        .desc { font-size: 24rpx; color: #999; margin-top: 8rpx; }
      }
    }
    .divider { width: 2rpx; height: 120rpx; background-color: #eee; }
  }
  </style>