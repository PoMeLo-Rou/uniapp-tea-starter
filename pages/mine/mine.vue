<template>
	<view class="container">
	  <view class="user-section">
		<view class="user-info">
		  <image class="avatar" src="https://img.icons8.com/color/96/user-male-circle--v1.png" mode="aspectFill"></image>
		  <view class="meta">
			<text class="nickname">茶友_8293</text>
			<text class="level-tag">V2 黄金会员</text>
		  </view>
		</view>
		<view class="settings-icon">⚙️</view>
	  </view>
  
	  <view class="asset-card">
		<view class="asset-item">
		  <text class="num">128</text>
		  <text class="label">积分</text>
		</view>
		<view class="divider"></view>
		<view class="asset-item">
		  <text class="num">5</text>
		  <text class="label">优惠券</text>
		</view>
		<view class="divider"></view>
		<view class="asset-item">
		  <text class="num">0.00</text>
		  <text class="label">余额</text>
		</view>
	  </view>
  
	  <view class="menu-list">
		<view class="menu-item" @click="handleMenuClick('order')">
		  <view class="left">
			<text class="icon">📜</text>
			<text class="text">历史订单</text>
		  </view>
		  <text class="arrow">></text>
		</view>
		
		<view class="menu-item" @click="handleMenuClick('address')">
		  <view class="left">
			<text class="icon">📍</text>
			<text class="text">收货地址</text>
		  </view>
		  <text class="arrow">></text>
		</view>
  
		<view class="menu-item" @click="handleMenuClick('service')">
		  <view class="left">
			<text class="icon">🎧</text>
			<text class="text">联系客服</text>
		  </view>
		  <text class="arrow">></text>
		</view>
  
		<view class="menu-item" @click="handleMenuClick('about')">
		  <view class="left">
			<text class="icon">ℹ️</text>
			<text class="text">关于我们</text>
		  </view>
		  <text class="arrow">></text>
		</view>
	  </view>
	  
	  <button class="logout-btn">退出登录</button>
	</view>
  </template>
  
  <script setup>
  const handleMenuClick = (type) => {
	uni.showToast({
	  title: `点击了 ${type} 功能`,
	  icon: 'none'
	});
  };
  </script>
  
  <style lang="scss">
	@import "@/assets/mine.scss";
  </style>