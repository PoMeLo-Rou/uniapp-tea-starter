<template>
    <view class="header">
      <view class="header-top">
        <view class="shop-info">
          <text class="shop-name">沁森柠 (Uni-app店) ></text>
          <text class="distance">📍 距离您 1.2km · 步行约 15 分钟</text>
        </view>
        <view class="toggle-btn">
          <view class="btn active">自取</view>
          <view class="btn">外卖</view>
        </view>
      </view>
      <view class="notice">
        <text class="notice-tag">公告</text>
        <text class="notice-text">会员日全场双倍积分，新品“酷黑莓桑”上线！</text>
      </view>
    </view>
</template>

<style lang="scss" scoped>
/* 直接引用你 order.scss 中的相关部分 */
.header {
  background-color: #fff;
  padding: 20rpx 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
  z-index: 10;
}
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.shop-name { font-size: 34rpx; font-weight: bold; }
.distance { font-size: 24rpx; color: #999; margin-top: 8rpx; display: block; }
.toggle-btn {
  display: flex;
  background-color: #f5f5f5;
  border-radius: 30rpx;
  padding: 4rpx;
}
.toggle-btn .btn {
  padding: 6rpx 24rpx;
  font-size: 24rpx;
  border-radius: 30rpx;
  color: #666;
}
.toggle-btn .btn.active {
  background-color: #023993; /* 这里写死或引用你的变量 */
  color: #fff;
}
.notice {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
  background-color: #fffaf0;
  padding: 10rpx 20rpx;
  border-radius: 8rpx;
}
.notice-tag {
  font-size: 20rpx;
  color: #ff9900;
  border: 1rpx solid #ff9900;
  padding: 2rpx 8rpx;
  margin-right: 12rpx;
  border-radius: 4rpx;
}
.notice-text { font-size: 22rpx; color: #666; }
</style>