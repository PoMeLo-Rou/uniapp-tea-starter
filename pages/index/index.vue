<template>
	<view class="container">  
  <view class="banner-box">
		<swiper
      class="banner-swiper"
      circular
      autoplay
      interval="5000"
      :current="current"
      :indicator-dots="false"
      @change="onSwiperChange"
    >
		  <swiper-item v-for="(item, index) in banners" :key="index">
			<image class="banner-img" :src="item" mode="aspectFill"></image>
		  </swiper-item>
		</swiper>

    <!-- 自定义线型指示器：灰色底线 + 等分小线段 + 可滑动蓝色条 -->
    <view class="banner-indicator-line" v-if="banners.length > 1">
      <view class="line-bg"></view>
      <view class="line-segments">
        <view
          v-for="(item, index) in banners"
          :key="index"
          class="line-segment"
          :style="{ width: (100 / banners.length) + '%' }"
        ></view>
      </view>
      <view
        class="line-active"
        :style="{
          width: (100 / banners.length) + '%',
          left: (100 / banners.length * current) + '%'
        }"
      ></view>
    </view>
	  </view>
  
	  <view class="member-bar">
		<view class="member-info">
		  <text class="welcome">你好，茶友</text>
		  <view class="level">
			<text class="icon">💎</text>
			<text>尊享会员</text>
		  </view>
		</view>
		<view class="points">
		  <text class="num">128</text>
		  <text class="label">积分</text>
		</view>
	  </view>
  
	  <view class="main-actions">
		<view class="action-card" @click="goToOrder">
		  <image class="action-icon" src="https://img.icons8.com/color/96/tea-cup.png" mode="aspectFit"></image>
		  <view class="action-text">
			<text class="title">到店自取</text>
			<text class="desc">下单免排队</text>
		  </view>
		</view>
		
		<view class="divider"></view>
		
		<view class="action-card" @click="goToOrder">
		  <image class="action-icon" src="https://img.icons8.com/color/96/delivery-man.png" mode="aspectFit"></image>
		  <view class="action-text">
			<text class="title">外送</text>
			<text class="desc">送货上门</text>
		  </view>
		</view>
	  </view>
  
	  <view class="featured-section">
		<view class="section-header">
		  <text class="section-title">精选推荐</text>
		</view>
		<scroll-view scroll-x class="featured-list">
		  <view class="featured-item" v-for="i in 3" :key="i">
			<image class="featured-img" src="" mode="aspectFill"></image>
			<text class="name">人气多肉葡萄</text>
			<text class="price">¥29起</text>
		  </view>
		</scroll-view>
	  </view>
	</view>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  // 模拟轮播图数据（5 张幻灯片）
  const banners = ref([
	'https://images.unsplash.com/photo-1544787210-2211d44b565a?w=800', // 幻灯片 1
	'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800', // 幻灯片 2
  'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800', // 幻灯片 3
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800', // 幻灯片 4
  'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?w=800'  // 幻灯片 5
  ]);

  const current = ref(0);
  const onSwiperChange = (e) => {
    current.value = e.detail.current || 0;
  };
  
  // 跳转到点单页 (因为是 TabBar 页面，需使用 switchTab)
  const goToOrder = () => {
	uni.switchTab({
	  url: '/pages/order/order'
	});
  };
  </script>
  
  <style lang="scss">
  .container {
	min-height: 100vh;
	background-color: #f8f8f8;
	position: relative;
  }
  
  
  .banner-box {
	padding: 30rpx 30rpx 0;
	position: relative;
	z-index: 1;
	.banner-swiper {
	  height: 350rpx;
	  border-radius: 20rpx;
	  overflow: hidden;
	  box-shadow: 0 10rpx 20rpx rgba(0,0,0,0.1);
	  .banner-img {
		width: 100%;
		height: 100%;
	  }
	}

  .banner-indicator-line {
    position: relative;
    margin: 16rpx 0 0;
    height: 4rpx;
  }

  .banner-indicator-line .line-bg {
    position: absolute;
    left: 0;
    right: 0;
    top: 1rpx;
    height: 2rpx;
    background-color: #e5e5e5;
    border-radius: 2rpx;
  }

  /* 等分的小灰线段（覆盖在灰线之上，方便看出分段） */
  .banner-indicator-line .line-segments {
    position: absolute;
    left: 0;
    right: 0;
    top: 1rpx;
    height: 2rpx;
    display: flex;
  }

  .banner-indicator-line .line-segment {
    height: 2rpx;
    background-color: transparent;
    border-radius: 2rpx;
  }

  /* 蓝色活动条，带左右滑动过渡 */
  .banner-indicator-line .line-active {
    position: absolute;
    top: 1rpx;
    height: 2rpx;
    background-color: #023993;
    border-radius: 2rpx;
    transition: left 0.25s ease;
  }
  }
  
  .member-bar {
	margin: 30rpx;
	background-color: #fff;
	padding: 30rpx;
	border-radius: 20rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	position: relative;
	z-index: 1;
	
	.welcome { font-size: 32rpx; font-weight: bold; }
	.level {
	  font-size: 24rpx;
	  color: #666;
	  margin-top: 10rpx;
	  .icon { margin-right: 6rpx; }
	}
	.points {
	  text-align: right;
	  .num { font-size: 40rpx; font-weight: bold; color: #023993; display: block; }
	  .label { font-size: 22rpx; color: #999; }
	}
  }
  
  .main-actions {
	margin: 0 30rpx;
	background-color: #fff;
	border-radius: 20rpx;
	display: flex;
	padding: 40rpx 0;
	align-items: center;
	
	.action-card {
	  flex: 1;
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  justify-content: center;
	  
	  .action-icon { width: 100rpx; height: 100rpx; margin-bottom: 20rpx; }
	  .action-text {
		text-align: center;
		.title { font-size: 34rpx; font-weight: bold; display: block; }
		.desc { font-size: 24rpx; color: #999; margin-top: 8rpx; }
	  }
	}
	
	.divider {
	  width: 2rpx;
	  height: 120rpx;
	  background-color: #eee;
	}
  }
  
  .featured-section {
	padding: 40rpx 30rpx;
	.section-header {
	  margin-bottom: 20rpx;
	  .section-title { font-size: 32rpx; font-weight: bold; }
	}
	.featured-list {
		overflow: scroll;
		scrollbar-width: none;
		-ms-overflow-style: none;
		::-webkit-scrollbar {
			display: none;
		}

	  white-space: nowrap;
	  .featured-item {
		display: inline-block;
		width: 260rpx;
		margin-right: 20rpx;
		background-color: #fff;
		border-radius: 15rpx;
		padding: 15rpx;
		.featured-img { width: 100%; height: 200rpx; border-radius: 10rpx; background-color: #f0f0f0; }
		.name { font-size: 26rpx; margin-top: 15rpx; display: block; overflow: hidden; text-overflow: ellipsis; }
		.price { font-size: 26rpx; color: #023993; font-weight: bold; margin-top: 10rpx; display: block; }
	  }
	}
  }
  </style>