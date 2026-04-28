<template>
	<view class="detail-page">
		<view class="page-header" :style="{ paddingTop: safeAreaInsets.top + 'px' }">
			<view class="header-left" @click="goBack">
				<text class="back-icon">&lt;</text>
			</view>
			<text class="header-title">订单详情</text>
			<view class="header-right"></view>
		</view>

		<view v-if="loading" class="loading-state">
			<text>加载中...</text>
		</view>

		<scroll-view v-else-if="order" scroll-y class="detail-body">
			<view class="status-section">
				<text class="status-icon">{{ statusIcon(order.status) }}</text>
				<text class="status-label">{{ statusText(order.status) }}</text>
			</view>

			<view class="block">
				<view class="block-row">
					<text class="row-label">门店</text>
					<text class="row-value">{{ order.store_name }}</text>
				</view>
				<view class="block-row">
					<text class="row-label">订单类型</text>
					<text class="row-value">{{ order.order_type === 'delivery' ? '外卖配送' : '到店自取' }}</text>
				</view>
			</view>

			<view class="block">
				<text class="block-title">商品明细</text>
				<view class="item-row" v-for="(item, index) in order.items" :key="index">
					<image :src="item.image || '/static/order.png'" class="item-img" mode="aspectFill" />
					<view class="item-info">
						<text class="item-name">{{ item.name }}</text>
						<text class="item-spec" v-if="item.spec">{{ item.spec }}</text>
					</view>
					<view class="item-right">
						<text class="item-price">¥{{ formatAmount(item.price) }}</text>
						<text class="item-count">x{{ item.count }}</text>
					</view>
				</view>
			</view>

			<view class="block">
				<view class="block-row">
					<text class="row-label">商品总额</text>
					<text class="row-value">¥{{ formatAmount(order.total_amount) }}</text>
				</view>
				<view class="block-row" v-if="order.discount_amount > 0">
					<text class="row-label">优惠</text>
					<text class="row-value discount">-¥{{ formatAmount(order.discount_amount) }}</text>
				</view>
				<view class="block-row total-row">
					<text class="row-label bold">实付</text>
					<text class="row-value bold primary">¥{{ formatAmount(order.pay_amount) }}</text>
				</view>
			</view>

			<view class="block">
				<text class="block-title">订单信息</text>
				<view class="block-row">
					<text class="row-label">订单编号</text>
					<text class="row-value mono">{{ order.order_no }}</text>
				</view>
				<view class="block-row">
					<text class="row-label">下单时间</text>
					<text class="row-value">{{ formatDateTime(order.created_at) }}</text>
				</view>
				<view class="block-row" v-if="order.paid_at">
					<text class="row-label">支付时间</text>
					<text class="row-value">{{ formatDateTime(order.paid_at) }}</text>
				</view>
			</view>

			<view style="height: 40rpx;"></view>
		</scroll-view>

		<view class="fixed-footer" v-if="order && order.status === 'ready'">
			<button class="confirm-btn" :disabled="confirming" @click="confirmPickup">
				{{ confirming ? '确认中...' : '我已取餐，确认完成' }}
			</button>
		</view>

		<view v-if="!loading && !order" class="loading-state">
			<text>订单不存在</text>
		</view>
	</view>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { confirmOrderPickup, fetchOrderDetail } from '@/common/api/order.js';

const safeAreaInsets = (() => {
	try {
		return uni.getSystemInfoSync().safeAreaInsets || {
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,
		};
	} catch (_) {
		return {
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,
		};
	}
})();

const order = ref(null);
const loading = ref(true);
const confirming = ref(false);
const orderId = ref('');

const statusMap = {
	pending: '待支付',
	paid: '已支付',
	making: '制作中',
	ready: '待取餐',
	finished: '已完成',
	cancelled: '已取消',
};

const statusIconMap = {
	pending: '⏳',
	paid: '✅',
	making: '🔥',
	ready: '🔔',
	finished: '🎉',
	cancelled: '❌',
};

const statusText = (status) => statusMap[status] || status;
const statusIcon = (status) => statusIconMap[status] || '📋';

const formatAmount = (value) => {
	const amount = Number(value);
	return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
};

const formatDateTime = (value) => {
	if (!value) return '--';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '--';
	const pad = (part) => String(part).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
		date.getHours(),
	)}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const normalizeItems = (items) => {
	if (Array.isArray(items)) return items;
	if (typeof items === 'string' && items) {
		try {
			const parsed = JSON.parse(items);
			return Array.isArray(parsed) ? parsed : [];
		} catch (_) {
			return [];
		}
	}
	return [];
};

const fetchDetail = async (id) => {
	loading.value = true;
	try {
		const detail = await fetchOrderDetail(id);
		if (!detail) {
			order.value = null;
			uni.showToast({ title: '订单不存在', icon: 'none' });
			return;
		}

		order.value = {
			...detail,
			id: detail.id || detail.orderId || detail.order_id || id,
			items: normalizeItems(detail.items),
			total_amount: Number(detail.total_amount || detail.totalPrice || 0),
			pay_amount: Number(detail.pay_amount || detail.total_amount || detail.totalPrice || 0),
			discount_amount: Number(detail.discount_amount || 0),
			order_no: detail.order_no || detail.orderNo || `NO-${id}`,
			store_name: detail.store_name || detail.storeName || '默认门店',
			order_type: detail.order_type || detail.orderType || 'pickup',
		};
	} catch (error) {
		console.error('[fetchDetail] error:', error);
		uni.showToast({ title: '加载失败，请稍后重试', icon: 'none' });
	} finally {
		loading.value = false;
	}
};

const confirmPickup = async () => {
	if (!order.value || order.value.status !== 'ready') return;

	confirming.value = true;
	try {
		const result = await confirmOrderPickup(orderId.value);
		if (result && (result.ok || result.status === 'finished')) {
			order.value.status = 'finished';
			uni.showToast({ title: '已确认取餐', icon: 'success' });
			uni.$emit('order:status-changed', {
				orderId: orderId.value,
				status: 'finished',
				source: 'pickup-confirm',
			});
			return;
		}
		uni.showToast({ title: '确认失败，请重试', icon: 'none' });
	} catch (error) {
		console.error('[confirmPickup] error:', error);
		uni.showToast({ title: error?.message || '网络异常', icon: 'none' });
	} finally {
		confirming.value = false;
	}
};

const extractEventOrderId = (payload = {}) =>
	String(payload.orderId || payload.order_id || payload.id || payload?.data?.orderId || '');

const handleOrderStatusChanged = (payload = {}) => {
	if (!orderId.value) return;
	if (extractEventOrderId(payload) !== String(orderId.value)) return;
	fetchDetail(orderId.value);
};

const goBack = () => {
	try {
		uni.navigateBack();
	} catch (_) {
		uni.switchTab({ url: '/pages/mine/mine' });
	}
};

onLoad((query) => {
	if (!query?.id) {
		loading.value = false;
		return;
	}

	orderId.value = String(query.id);
	fetchDetail(orderId.value);
});

onMounted(() => {
	uni.$on('order:status-changed', handleOrderStatusChanged);
});

onUnmounted(() => {
	uni.$off('order:status-changed', handleOrderStatusChanged);
});
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.detail-page {
	min-height: 100vh;
	background: #f5f5f5;
	display: flex;
	flex-direction: column;
}

.page-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16rpx 24rpx;
	background: #fff;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.header-left {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
}

.back-icon {
	font-size: 44rpx;
	color: #333;
}

.header-title {
	flex: 1;
	text-align: center;
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.header-right {
	width: 80rpx;
}

.loading-state {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #999;
	font-size: 28rpx;
}

.detail-body {
	flex: 1;
	padding-bottom: 160rpx;
}

.status-section {
	background: $uni-color-primary;
	padding: 40rpx 30rpx;
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.status-icon {
	font-size: 48rpx;
}

.status-label {
	font-size: 36rpx;
	font-weight: bold;
	color: #fff;
}

.block {
	background: #fff;
	margin-top: 20rpx;
	padding: 24rpx 30rpx;
}

.block-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
	display: block;
}

.block-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12rpx 0;
}

.row-label {
	font-size: 26rpx;
	color: #999;
}

.row-value {
	font-size: 26rpx;
	color: #333;
}

.row-value.mono {
	font-family: monospace;
	font-size: 24rpx;
}

.row-value.discount {
	color: #ff4d4f;
}

.row-value.primary {
	color: $uni-color-primary;
}

.bold {
	font-weight: bold;
	font-size: 30rpx !important;
}

.total-row {
	margin-top: 12rpx;
	padding-top: 16rpx;
	border-top: 1rpx solid #f0f0f0;
}

.item-row {
	display: flex;
	align-items: center;
	padding: 16rpx 0;
	border-bottom: 1rpx solid #f8f8f8;
}

.item-row:last-child {
	border-bottom: none;
}

.item-img {
	width: 100rpx;
	height: 100rpx;
	border-radius: 12rpx;
	background: #f0f0f0;
	margin-right: 20rpx;
	flex-shrink: 0;
}

.item-info {
	flex: 1;
	min-width: 0;
}

.item-name {
	font-size: 28rpx;
	color: #333;
	display: block;
}

.item-spec {
	font-size: 22rpx;
	color: #999;
	display: block;
	margin-top: 6rpx;
}

.item-right {
	text-align: right;
	flex-shrink: 0;
	margin-left: 16rpx;
}

.item-price {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
	display: block;
}

.item-count {
	font-size: 22rpx;
	color: #999;
	display: block;
	margin-top: 4rpx;
}

.confirm-btn {
	width: 100%;
	height: 84rpx;
	border-radius: 42rpx;
	background: $uni-color-primary;
	color: #fff;
	font-size: 30rpx;
	font-weight: 600;
	border: none;
}

.fixed-footer {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 20rpx 24rpx 24rpx;
	background: #fff;
	box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
}
</style>
