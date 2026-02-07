<template>
	<view class="container">
		<view class="banner-box">
			<swiper class="banner-swiper" circular autoplay interval="5000" :current="current" :indicator-dots="false"
				@change="onSwiperChange">
				<swiper-item v-for="(item, index) in banners" :key="index">
					<image class="banner-img" :src="item" mode="aspectFill"></image>
				</swiper-item>
			</swiper>

			<!-- 自定义线型指示器：灰色底线 + 等分小线段 + 可滑动蓝色条 -->
			<view class="banner-indicator-line" v-if="banners.length > 1">
				<view class="line-bg"></view>
				<view class="line-segments">
					<view v-for="(item, index) in banners" :key="index" class="line-segment"
						:style="{ width: (100 / banners.length) + '%' }"></view>
				</view>
				<view class="line-active" :style="{
					width: (100 / banners.length) + '%',
					left: (100 / banners.length * current) + '%'
				}"></view>
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
				<image class="action-icon" src="https://img.icons8.com/color/96/delivery-man.png" mode="aspectFit">
				</image>
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

		<!-- 卡片放在 container 内，才能随页面一起显示和滚动 -->
		<view class="card-wrap">
			<uni-card title="基础卡片" sub-title="副标题" extra="额外信息"
				thumbnail="https://qiniu-web-assets.dcloud.net.cn/unidoc/zh/unicloudlogo.png">
				<text>这是一个带头像和双标题的基础卡片，此示例展示了一个完整的卡片。</text>
			</uni-card>
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

<!-- 在这里引入外部样式，注意加上 lang="scss" -->
<style lang="scss">
@import "@/assets/index.scss";
</style>