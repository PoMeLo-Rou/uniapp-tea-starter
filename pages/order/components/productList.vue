<template>
      <!-- 右侧商品列表 -->
      <scroll-view scroll-y class="right-content" :scroll-into-view="rightScrollIntoView" @scroll="handleScroll"
        scroll-with-animation>
        <!-- 广告 Banner -->
        <view class="banner-wrapper">
          <!-- src留空，后续请填入您的图片链接 -->
          <image class="banner-img" src="" mode="aspectFill"></image>
          <text class="banner-text">当季 · 多肉葡萄</text>
        </view>

        <!-- 商品分类区块 -->
        <view v-for="cat in categories" :key="cat.id" :id="'category-' + cat.id" class="category-section">
          <view class="category-title">{{ cat.name }}</view>

          <view v-for="product in getProductsByCategory(cat.id)" :key="product.id" class="product-item">
            <!-- 商品图 -->
            <view class="product-img-box">
              <image :src="product.image" class="product-img" mode="aspectFill"></image>
              <view v-if="product.tag" class="tag">{{ product.tag }}</view>
            </view>

            <!-- 商品信息 -->
            <view class="product-info">
              <view>
                <text class="product-name">{{ product.name }}</text>
                <text class="product-desc">{{ product.desc }}</text>
              </view>

              <view class="price-action">
                <text class="price">¥{{ product.price }}</text>

                <!-- 加减购按钮 -->
                <view class="action-btn">
                  <view v-if="cart[product.id]" class="btn-circle outline" @click.stop="updateCart(product.id, -1)">-
                  </view>
                  <text v-if="cart[product.id]" class="count-num">{{ cart[product.id] }}</text>
                  <view class="btn-circle theme-bg" @click.stop="updateCart(product.id, 1)">选规格</view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 底部垫高: 购物车高度 + TabBar高度 -->
        <view style="height: 280rpx;"></view>
      </scroll-view>
  </template>
  
  <script setup>
  defineProps(['categories', 'rightScrollTop']);
  defineEmits(['add', 'scroll']);
  </script>
  
  <style lang="scss" scoped>
  /* 引用原 scss 中的右侧列表样式 */
  .right-content {
    flex: 1;
    background-color: #fff;
    height: 100%;
  }
  .category-title {
    padding: 20rpx 30rpx;
    font-size: 24rpx;
    color: #999;
    background-color: #fafafa;
  }
  .product-item {
    display: flex;
    padding: 30rpx;
    border-bottom: 1rpx solid #f2f2f2;
  }
  .product-img { width: 140rpx; height: 140rpx; border-radius: 10rpx; background-color: #eee; }
  .product-info {
    flex: 1;
    margin-left: 20rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .product-info .name { font-size: 30rpx; font-weight: bold; }
  .product-info .desc { font-size: 22rpx; color: #999; line-height: 1.4; margin: 10rpx 0; }
  .price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .price-row .price { font-size: 32rpx; font-weight: bold; color: #ff4d4f; }
  .btn-circle {
    width: 44rpx; height: 44rpx; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; font-size: 36rpx;
  }
  .theme-bg { background-color: #023993; color: #fff; }
  .bottom-safe-area { height: 120rpx; }
  </style>