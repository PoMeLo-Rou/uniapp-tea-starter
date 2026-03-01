<template>
    <view class="member-bar">
      <view class="member-info">
        <text class="welcome">你好，茶友</text>
        <view class="level">
          <text class="icon">💎</text>
          <text>{{ level }}</text>
        </view>
      </view>
      <view class="points">
        <text class="num">{{ points }}</text>
        <text class="label">积分</text>
      </view>
    </view>
  </template>
  
  <script setup>
  defineProps({
    level: { type: String, default: '尊享会员' },
    points: { type: Number, default: 0 }
  });
  </script>
  
  <style lang="scss" scoped>
  .member-bar {
    margin: 30rpx;
    background-color: #fff;
    padding: 30rpx;
    border-radius: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
    .welcome { font-size: 32rpx; font-weight: bold; }
    .level {
      font-size: 24rpx; color: #666; margin-top: 10rpx;
      .icon { margin-right: 6rpx; }
    }
    .points {
      text-align: right;
      .num { font-size: 40rpx; font-weight: bold; color: #023993; display: block; }
      .label { font-size: 22rpx; color: #999; }
    }
  }
  </style>