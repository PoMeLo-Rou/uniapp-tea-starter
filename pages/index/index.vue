<template>
	<view class="container">
		<bannerBox :banners="bannerData" />


		<memberCard :points="128" level="尊享会员" />

		<!-- 猜你喜欢 - 个性化推荐滑块 -->
		<view class="recommend-section">
			<view class="section-header">
				<text class="title">猜你喜欢</text>
				<text class="subtitle">根据您的口味推荐</text>
			</view>
			<scroll-view class="recommend-scroll" scroll-x="true" show-scrollbar="false">
				<view class="recommend-item" v-for="(item, index) in recommendList" :key="item.id || index"
					@click="onRecommendClick(item)">
					<image :src="normalizeImageUrl(item.image)" mode="aspectFill" class="prod-img"></image>
					<view class="prod-info">
						<text class="prod-name">{{ item.name }}</text>
						<text class="prod-price">￥{{ item.price }}</text>
					</view>
					<button class="add-btn" size="mini" @click.stop="onRecommendClick(item)">+</button>
				</view>
			</scroll-view>
		</view>

		<mainAction @click="goToOrder" />
		<AiChat />
		<CustomTabBar current-path="/pages/index/index" />
	</view>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import bannerBox from './components/bannerBox.vue';
import memberCard from './components/memberCard.vue';
import mainAction from './components/mainAction.vue';
import CustomTabBar from '@/components/custom-tab-bar.vue';
import AiChat from '@/components/AiChat.vue';
import { fetchRecommendProducts } from '@/common/api/product.js';
import { fetchSiteConfig } from '@/common/api/site.js';
import { normalizeImageUrl } from '@/common/api/request.js';

// 轮播图数据（空则使用 bannerBox 内部默认图）
const bannerData = ref([
	'https://images.unsplash.com/photo-1544787210-2211d44b565a?w=800',
	'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800',
]);

// 静态模拟数据（后期通过后端接口获取），id 与点餐页商品对应便于跳转后打开规格弹窗
const recommendList = ref([
	{ id: 101, name: '多肉葡萄', price: 28, image: '/static/logo.png' },
	{ id: 102, name: '芝芝茗茶', price: 19, image: '/static/logo.png' },
	{ id: 201, name: '烤黑糖波波', price: 22, image: '/static/logo.png' },
]);

const loadHomeData = async () => {
	try {
		const [siteConfig, recommendProducts] = await Promise.all([
			fetchSiteConfig(),
			fetchRecommendProducts(),
		]);
		if (Array.isArray(siteConfig?.homeBanners) && siteConfig.homeBanners.length) {
			bannerData.value = siteConfig.homeBanners;
		}
		if (Array.isArray(recommendProducts) && recommendProducts.length) {
			recommendList.value = recommendProducts.map((item) => ({
				id: item.id,
				name: item.name,
				price: item.price,
				image: item.image || '/static/logo.png',
			}));
		}
	} catch (e) {
		// 保底使用本地默认数据，不阻塞页面展示
	}
};

// 跳转到点单页 (因为是 TabBar 页面，需使用 switchTab)
const goToOrder = () => {
	uni.switchTab({
		url: '/pages/order/order',
	});
};

// 点击推荐位：进入点餐页并打开该商品的规格弹窗
const onRecommendClick = (item) => {
	uni.switchTab({
		url: '/pages/order/order',
		success: () => {
			setTimeout(() => {
				uni.$emit('openSpec', { productId: item.id });
			}, 300);
		},
	});
};

onMounted(() => {
	loadHomeData();
});
</script>

<style lang="scss">
@import '@/uni.scss';

.container {
	min-height: 100vh;
	background-color: #f8f8f8;
	padding-bottom: 150rpx;
}

.recommend-section {
	padding: 20rpx;

	.section-header {
		margin-bottom: 20rpx;

		.title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}

		.subtitle {
			font-size: 24rpx;
			color: #999;
			margin-left: 15rpx;
		}
	}

	.recommend-scroll {
		white-space: nowrap;

		.recommend-item {
			display: inline-block;
			width: 240rpx;
			margin-right: 20rpx;
			background: #fff;
			border-radius: 12rpx;
			padding: 15rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

			.prod-img {
				width: 100%;
				height: 200rpx;
				border-radius: 8rpx;
			}

			.prod-name {
				font-size: 26rpx;
				display: block;
				margin: 10rpx 0;
			}

			.prod-price {
				color: $uni-color-primary;
				font-weight: bold;
			}

			.add-btn {
				float: right;
				background: $uni-color-primary;
				color: #fff;
				border-radius: 50%;
				padding: 0 15rpx;
				border: none;

				&::after {
					border: none;
				}
			}
		}
	}
}
</style>