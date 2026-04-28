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
import { onShow } from '@dcloudio/uni-app';
import { useMemberStore } from '@/stores/modules/member.js';

import bannerBox from './components/bannerBox.vue';
import memberCard from './components/memberCard.vue';
import mainAction from './components/mainAction.vue';
import CustomTabBar from '@/components/custom-tab-bar.vue';
import AiChat from '@/components/AiChat.vue';
import { fetchProducts, fetchRecommendProducts } from '@/common/api/product.js';
import { fetchOrderDetail, fetchOrderList } from '@/common/api/order.js';
import { fetchSiteConfig } from '@/common/api/site.js';
import { normalizeImageUrl } from '@/common/api/request.js';

const memberStore = useMemberStore();
const bannerData = ref([]);
const recommendList = ref([]);
const MIN_HISTORY_ITEM_COUNT = 2;
const RECOMMEND_LIMIT = 8;

const normalizeList = (payload) => {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.list)) return payload.list;
	if (Array.isArray(payload?.rows)) return payload.rows;
	if (Array.isArray(payload?.records)) return payload.records;
	if (Array.isArray(payload?.data)) return payload.data;
	if (payload?.data && typeof payload.data === 'object') return normalizeList(payload.data);
	return [];
};

const toRecommendItem = (item = {}) => ({
	id: item.id || item.productId || item.product_id,
	name: item.name || item.productName || item.product_name || '',
	price: item.price || 0,
	image: item.image || '/static/logo.png',
});

const isProductOnSale = (product) => {
	if (product?.status === undefined || product?.status === null) return true;
	if (typeof product.status === 'number') return product.status === 1;
	return ['1', 'on', 'onsale', 'on_sale', 'active'].includes(String(product.status).toLowerCase());
};

const tokenize = (value) =>
	String(value || '')
		.toLowerCase()
		.split(/[^a-z0-9\u4e00-\u9fa5]+/i)
		.map((item) => item.trim())
		.filter((item) => item.length >= 2);

const getOrderItems = (order = {}) => {
	if (order?.data && typeof order.data === 'object') return getOrderItems(order.data);
	const source = order.items || order.orderItems || order.products || order.details || order.order_details || order.productList || [];
	if (Array.isArray(source)) return source;
	if (typeof source === 'string') {
		try {
			return JSON.parse(source);
		} catch (_) {
			return [];
		}
	}
	return [];
};

const loadHistoryItems = async () => {
	if (!memberStore.isLoggedIn || !memberStore.userId) return [];
	const orderPayload = await fetchOrderList({ userId: memberStore.userId });
	const orders = normalizeList(orderPayload).slice(0, 10);
	const detailList = await Promise.all(
		orders.map(async (order) => {
			const id = order.id || order.orderId || order.order_id;
			if (!id || getOrderItems(order).length) return order;
			try {
				return await fetchOrderDetail(id);
			} catch (_) {
				return order;
			}
		}),
	);
	return detailList.flatMap(getOrderItems);
};

const buildPersonalizedRecommend = (products, historyItems) => {
	if (historyItems.length < MIN_HISTORY_ITEM_COUNT) return [];
	const productById = new Map(products.map((item) => [String(item.id), item]));
	const purchasedIds = new Set();
	const categoryScore = new Map();
	const tokenScore = new Map();

	historyItems.forEach((item) => {
		const id = item.id || item.productId || item.product_id;
		const product = productById.get(String(id)) || products.find((p) => p.name === item.name || p.name === item.productName);
		const count = Math.max(1, Number(item.count || item.quantity || 1));
		if (product?.id) purchasedIds.add(String(product.id));
		if (product?.category_id) categoryScore.set(product.category_id, (categoryScore.get(product.category_id) || 0) + count * 3);
		tokenize([product?.name, product?.desc, product?.tag, item.spec].join(' ')).forEach((token) => {
			tokenScore.set(token, (tokenScore.get(token) || 0) + count);
		});
	});

	return products
		.filter((item) => item.id && isProductOnSale(item) && !purchasedIds.has(String(item.id)))
		.map((item) => {
			let score = categoryScore.get(item.category_id) || 0;
			tokenize([item.name, item.desc, item.tag].join(' ')).forEach((token) => {
				score += tokenScore.get(token) || 0;
			});
			return { ...item, score };
		})
		.filter((item) => item.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, RECOMMEND_LIMIT)
		.map(toRecommendItem);
};

const loadDefaultRecommend = async () => normalizeList(await fetchRecommendProducts()).map(toRecommendItem);

const loadRecommendProducts = async () => {
	try {
		const [allProducts, historyItems] = await Promise.all([fetchProducts(), loadHistoryItems()]);
		const personalized = buildPersonalizedRecommend(normalizeList(allProducts), historyItems);
		if (personalized.length) return personalized;
	} catch (error) {
		console.warn('[home] personalized recommend fallback:', error);
	}
	return loadDefaultRecommend();
};

const loadHomeData = async () => {
	try {
		const [siteConfig, products] = await Promise.all([fetchSiteConfig(), loadRecommendProducts()]);
		if (Array.isArray(siteConfig?.homeBanners) && siteConfig.homeBanners.length) {
			bannerData.value = siteConfig.homeBanners;
		}
		recommendList.value = products;
	} catch (e) {
		console.error('load home data failed:', e);
		uni.showToast({ title: '数据加载异常', icon: 'none' });
	}
};

const refreshUserInfo = () => {
	if (memberStore.isLoggedIn && typeof memberStore.fetchUserInfo === 'function') {
		memberStore.fetchUserInfo();
	}
};

const goToOrder = () => {
	uni.switchTab({
		url: '/pages/order/order',
	});
};

const onRecommendClick = (item) => {
	if (!item?.id) return;
	uni.setStorageSync('pendingOpenSpecProductId', item.id);
	uni.switchTab({
		url: '/pages/order/order',
		success: () => {
			setTimeout(() => {
				uni.$emit('openSpec', { productId: item.id });
			}, 450);
		},
	});
};

onMounted(() => {
	loadHomeData();
	refreshUserInfo();
});

onShow(() => {
	loadHomeData();
	refreshUserInfo();
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
				width: 48rpx;
				height: 48rpx;
				min-width: 48rpx;
				line-height: 48rpx;
				background: $uni-color-primary;
				color: #fff;
				border-radius: 50%;
				padding: 0;
				border: none;
				font-size: 32rpx;
				font-weight: 700;
				text-align: center;

				&::after {
					border: none;
				}
			}
		}
	}
}
</style>
