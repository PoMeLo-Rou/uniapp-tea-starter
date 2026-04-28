<template>
	<view class="admin-page">
		<view class="page-header" :style="{ paddingTop: safeAreaInsets.top + 'px' }">
			<button class="back-btn" @click="goBack">返回</button>
			<text class="title">管理中心</text>
			<view class="header-placeholder"></view>
		</view>

		<view class="summary-card">
			<view class="summary-top">
				<view>
					<text class="summary-title">订单工作台</text>
					<text class="summary-desc">
						{{ pendingCount > 0 ? `当前有 ${pendingCount} 个新订单待处理` : '暂无新的待处理订单' }}
					</text>
				</view>
				<button class="summary-btn" @click="goToOrderManage">去处理</button>
			</view>
			<view class="summary-stats">
				<view class="stat-item">
					<text class="stat-num danger">{{ pendingCount }}</text>
					<text class="stat-label">待接单</text>
				</view>
				<view class="stat-item">
					<text class="stat-num">{{ makingCount }}</text>
					<text class="stat-label">制作中</text>
				</view>
				<view class="stat-item">
					<text class="stat-num success">{{ readyCount }}</text>
					<text class="stat-label">待取餐</text>
				</view>
			</view>
			<text v-if="lastFetchedText" class="summary-time">最近刷新：{{ lastFetchedText }}</text>
		</view>

		<view v-if="pendingCount > 0" class="alert-card">
			<text class="alert-text">新订单不会自动流转到出餐状态，需要店员在订单看板里手动推进。</text>
			<text class="alert-link" @click="goToOrderManage">立即查看</text>
		</view>

		<scroll-view class="menu-list" scroll-y>
			<view class="menu-item highlight" @click="goToOrderManage">
				<view class="item-icon order">单</view>
				<view class="item-content">
					<view class="item-title-row">
						<text class="item-title">订单处理看板</text>
						<text v-if="pendingCount > 0" class="item-badge">{{ pendingCount }}</text>
					</view>
					<text class="item-desc">
						轮询抓取最新待处理订单，查看杯型与加料明细，并手动推进到制作中/待取餐
					</text>
				</view>
				<text class="arrow">></text>
			</view>

			<view class="menu-item" @click="goToProductManage">
				<view class="item-icon product">品</view>
				<view class="item-content">
					<text class="item-title">商品管理</text>
					<text class="item-desc">维护商品列表、上下架状态、规格与图片</text>
				</view>
				<text class="arrow">></text>
			</view>

			<view class="menu-item" @click="goToSiteConfig">
				<view class="item-icon config">配</view>
				<view class="item-content">
					<text class="item-title">展示配置</text>
					<text class="item-desc">配置点单页 Banner、门店展示与运营文案</text>
				</view>
				<text class="arrow">></text>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { onHide, onShow, onUnload } from '@dcloudio/uni-app';
import { useAdminOrderStore } from '@/stores/modules/admin-order.js';

const orderStore = useAdminOrderStore();

const safeAreaInsets = (() => {
	try {
		const sys = uni.getSystemInfoSync();
		return sys.safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 };
	} catch (_) {
		return { top: 0, bottom: 0, left: 0, right: 0 };
	}
})();

const pageVisible = ref(false);
const pollingAttached = ref(false);
const modalVisible = ref(false);

const pendingCount = computed(() => orderStore.pendingCount);
const makingCount = computed(() => orderStore.makingOrders.length);
const readyCount = computed(() => orderStore.readyOrders.length);
const lastFetchedText = computed(() => formatTime(orderStore.lastFetchedAt));

const attachPolling = () => {
	if (pollingAttached.value) return;
	orderStore.startPolling();
	pollingAttached.value = true;
};

const detachPolling = () => {
	if (!pollingAttached.value) return;
	orderStore.stopPolling();
	pollingAttached.value = false;
};

const formatTime = (time) => {
	if (!time) return '';
	const date = new Date(time);
	if (Number.isNaN(date.getTime())) return '';
	const pad = (value) => String(value).padStart(2, '0');
	return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const goBack = () => {
	try {
		uni.navigateBack();
	} catch (_) {
		uni.switchTab({ url: '/pages/mine/mine' });
	}
};

const goToOrderManage = () => {
	uni.navigateTo({ url: '/pages/admin/order-manage' });
};

const goToProductManage = () => {
	uni.navigateTo({ url: '/pages/admin/product-manage' });
};

const goToSiteConfig = () => {
	uni.navigateTo({ url: '/pages/admin/site-manage' });
};

const handleNewOrder = (payload = {}) => {
	if (!pageVisible.value || modalVisible.value) return;

	const count = Number(payload.count || payload.orders?.length || 1);
	const orderNo = payload.firstOrder?.order_no || '新订单';
	modalVisible.value = true;

	try {
		uni.vibrateLong();
	} catch (_) {}

	uni.showModal({
		title: '新订单提醒',
		content:
			count > 1
				? `刚刚有 ${count} 个新订单进入待处理队列，请尽快接单。`
				: `${orderNo} 已支付成功，请尽快进入订单看板处理。`,
		confirmText: '立即处理',
		cancelText: '稍后',
		success: ({ confirm }) => {
			modalVisible.value = false;
			if (confirm) {
				goToOrderManage();
			}
		},
		fail: () => {
			modalVisible.value = false;
		},
	});
};

onMounted(() => {
	uni.$on('admin:new-order', handleNewOrder);
});

onUnmounted(() => {
	uni.$off('admin:new-order', handleNewOrder);
});

onShow(() => {
	pageVisible.value = true;
	attachPolling();
});

onHide(() => {
	pageVisible.value = false;
	detachPolling();
});

onUnload(() => {
	pageVisible.value = false;
	detachPolling();
});
</script>

<style lang="scss" scoped>
.admin-page {
	min-height: 100vh;
	background: #f5f7fb;
	padding: 32rpx 28rpx 40rpx;
	box-sizing: border-box;
}

.page-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 28rpx;
}

.back-btn {
	width: 132rpx;
	height: 64rpx;
	line-height: 64rpx;
	border-radius: 32rpx;
	border: none;
	background: #ffffff;
	color: #1f2937;
	font-size: 28rpx;
	margin: 0;

	&::after {
		border: none;
	}
}

.title {
	font-size: 36rpx;
	font-weight: 700;
	color: #111827;
}

.header-placeholder {
	width: 132rpx;
}

.summary-card {
	background: linear-gradient(135deg, #0f3b8f 0%, #0a57d1 100%);
	border-radius: 28rpx;
	padding: 32rpx;
	color: #ffffff;
	box-shadow: 0 18rpx 36rpx rgba(15, 59, 143, 0.18);
}

.summary-top {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 24rpx;
}

.summary-title {
	display: block;
	font-size: 34rpx;
	font-weight: 700;
}

.summary-desc {
	display: block;
	margin-top: 12rpx;
	font-size: 24rpx;
	line-height: 1.6;
	color: rgba(255, 255, 255, 0.82);
}

.summary-btn {
	flex-shrink: 0;
	min-width: 176rpx;
	height: 72rpx;
	line-height: 72rpx;
	border-radius: 999rpx;
	border: none;
	background: #ffffff;
	color: #0f3b8f;
	font-size: 28rpx;
	font-weight: 600;
	margin: 0;

	&::after {
		border: none;
	}
}

.summary-stats {
	display: flex;
	gap: 20rpx;
	margin-top: 28rpx;
}

.stat-item {
	flex: 1;
	background: rgba(255, 255, 255, 0.12);
	border-radius: 20rpx;
	padding: 22rpx 18rpx;
	text-align: center;
}

.stat-num {
	display: block;
	font-size: 38rpx;
	font-weight: 700;
	color: #ffffff;
}

.stat-num.danger {
	color: #ffd6d6;
}

.stat-num.success {
	color: #d1ffe0;
}

.stat-label {
	display: block;
	margin-top: 10rpx;
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.78);
}

.summary-time {
	display: block;
	margin-top: 20rpx;
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.72);
}

.alert-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20rpx;
	background: #fff6ea;
	border: 1rpx solid #ffd9aa;
	border-radius: 22rpx;
	padding: 22rpx 24rpx;
	margin-top: 20rpx;
}

.alert-text {
	flex: 1;
	font-size: 24rpx;
	line-height: 1.6;
	color: #9a4d00;
}

.alert-link {
	flex-shrink: 0;
	font-size: 26rpx;
	font-weight: 600;
	color: #d97706;
}

.menu-list {
	margin-top: 24rpx;
	background: #ffffff;
	border-radius: 24rpx;
	box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.06);
	overflow: hidden;
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 30rpx 28rpx;
	border-bottom: 1rpx solid #eef2f7;
}

.menu-item:last-child {
	border-bottom: none;
}

.menu-item.highlight {
	background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.item-icon {
	width: 72rpx;
	height: 72rpx;
	border-radius: 22rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 30rpx;
	font-weight: 700;
	color: #ffffff;
	flex-shrink: 0;
}

.item-icon.order {
	background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
}

.item-icon.product {
	background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
}

.item-icon.config {
	background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.item-content {
	flex: 1;
	margin-left: 22rpx;
	min-width: 0;
}

.item-title-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.item-title {
	font-size: 31rpx;
	font-weight: 600;
	color: #111827;
}

.item-badge {
	min-width: 40rpx;
	height: 40rpx;
	padding: 0 12rpx;
	line-height: 40rpx;
	border-radius: 999rpx;
	background: #ef4444;
	color: #ffffff;
	font-size: 22rpx;
	text-align: center;
}

.item-desc {
	display: block;
	margin-top: 10rpx;
	font-size: 24rpx;
	line-height: 1.6;
	color: #6b7280;
}

.arrow {
	margin-left: 18rpx;
	font-size: 28rpx;
	color: #9ca3af;
}
</style>
