<template>
    <view v-if="totalCount > 0" class="cart-bar-wrapper">
      <view class="cart-bar">
        <view class="cart-icon-wrapper" @click="toggleCartDetail">
          <view class="cart-icon theme-bg">
            <image src="/static/cart.png" class="cart-icon-img" mode="aspectFit"></image>
          </view>
          <view class="total-badge">{{ totalCount }}</view>
        </view>

        <view class="cart-price">
          <text class="total-price">¥{{ totalPrice }}</text>
        </view>

        <button class="pay-btn theme-bg" @click="checkout">去结算</button>
      </view>
    </view>
  </template>
  
  <script setup>
  defineProps(['totalCount', 'totalPrice']);
  defineEmits(['toggle', 'checkout']);
  </script>
  
  <style lang="scss" scoped>
  .cart-bar {
    position: fixed;
    bottom: calc(110rpx + env(safe-area-inset-bottom));
    left: 20rpx;
    right: 20rpx;
    height: 100rpx;
    background-color: rgba(50, 50, 50, 0.9);
    border-radius: 50rpx;
    display: flex;
    z-index: 100;
    transition: all 0.3s;
  }
  .cart-bar.active { background-color: #333; }
  .cart-left {
    flex: 1;
    display: flex;
    align-items: center;
    padding-left: 30rpx;
  }
  .cart-icon-wrapper {
    position: relative;
    width: 80rpx; height: 80rpx;
    margin-top: -30rpx;
  }
  .cart-icon { width: 100%; height: 100%; }
  .badge {
    position: absolute;
    top: 0; right: -10rpx;
    background-color: #ff4d4f;
    color: #fff;
    font-size: 20rpx;
    padding: 0 10rpx;
    border-radius: 20rpx;
    border: 2rpx solid #333;
  }
  .price-box {
    margin-left: 20rpx;
    display: flex;
    flex-direction: column;
  }
  .total-price { color: #fff; font-size: 36rpx; font-weight: bold; }
  .delivery-fee { color: #999; font-size: 20rpx; }
  .settle-btn {
    width: 200rpx;
    background-color: #444;
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 28rpx; font-weight: bold;
    border-radius: 0 50rpx 50rpx 0;
  }
  .cart-bar.active .settle-btn { background-color: #023993; }
  </style>