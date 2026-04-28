<template>
	<view class="order-manage-page">
		<view class="page-header" :style="{ paddingTop: safeAreaInsets.top + 'px' }">
			<view class="header-left" @click="goBack">
				<text class="back-icon">&lt;</text>
			</view>
			<view class="header-center">
				<text class="header-title">订单处理看板</text>
				<text class="header-subtitle">轮询刷新中，手动推进订单状态</text>
			</view>
			<view class="header-right" @click="manualRefresh">
				<text class="refresh-text">刷新</text>
			</view>
		</view>

		<view class="summary-panel">
			<view class="summary-item warning">
				<text class="summary-num">{{ orderStore.pendingCount }}</text>
				<text class="summary-label">待接单</text>
			</view>
			<view class="summary-item primary">
				<text class="summary-num">{{ orderStore.makingOrders.length }}</text>
				<text class="summary-label">制作中</text>
			</view>
			<view class="summary-item success">
				<text class="summary-num">{{ orderStore.readyOrders.length }}</text>
				<text class="summary-label">待取餐</text>
			</view>
		</view>

		<view class="board-hint">
			<text class="hint-text">
				支付后的订单会进入“待接单”，只有店员点击“开始制作”或“已出餐”后，才会同步变更给用户端。
			</text>
			<text v-if="lastFetchedText" class="hint-time">最近刷新：{{ lastFetchedText }}</text>
		</view>

		<scroll-view scroll-x class="tab-scroll" show-scrollbar="false">
			<view class="tab-row">
				<view
					v-for="tab in tabs"
					:key="tab.key"
					:class="['tab-item', activeTab === tab.key ? 'active' : '']"
					@click="activeTab = tab.key"
				>
					<text class="tab-label">{{ tab.label }}</text>
					<text v-if="tabCount(tab.key) > 0" class="tab-count">{{ tabCount(tab.key) }}</text>
				</view>
			</view>
		</scroll-view>

		<view v-if="orderStore.errorMessage" class="error-bar">
			<text class="error-text">{{ orderStore.errorMessage }}</text>
		</view>

		<scroll-view scroll-y class="order-list">
			<view v-if="!visibleOrders.length && !orderStore.loading" class="empty-state">
				<text class="empty-title">当前没有需要处理的订单</text>
				<text class="empty-desc">新的支付订单进入后，这里会自动提醒并展示。</text>
			</view>

			<view v-for="order in visibleOrders" :key="order.id" class="order-card">
				<view class="card-top">
					<view>
						<text class="order-no">{{ order.order_no }}</text>
						<text class="order-meta">
							{{ order.order_type === 'delivery' ? '外卖配送' : '到店自取' }} · {{ order.store_name }}
						</text>
					</view>
					<text :class="['status-tag', order.status]">{{ statusText(order.status) }}</text>
				</view>

				<view class="time-row">
					<text>下单时间：{{ formatDateTime(order.created_at) }}</text>
					<text>实付：¥{{ formatAmount(order.pay_amount || order.total_amount) }}</text>
				</view>

				<view class="item-list">
					<view v-for="(item, index) in order.items" :key="`${order.id}-${index}`" class="item-row">
						<image class="item-image" :src="item.image || '/static/order.png'" mode="aspectFill" />
						<view class="item-main">
							<view class="item-header">
								<text class="item-name">{{ item.name }}</text>
								<text class="item-count">x{{ item.count || 1 }}</text>
							</view>
							<view v-if="getItemTags(item).length" class="tag-list">
								<text v-for="tag in getItemTags(item)" :key="tag" class="option-tag">{{ tag }}</text>
							</view>
						</view>
					</view>
				</view>

				<view class="action-row">
					<button
						v-if="order.status === 'paid'"
						class="action-btn primary"
						:disabled="orderStore.isUpdating(order.id)"
						@click="handleStatusChange(order, 'making')"
					>
						{{ orderStore.isUpdating(order.id) ? '处理中...' : '开始制作' }}
					</button>

					<button
						v-else-if="order.status === 'making'"
						class="action-btn success"
						:disabled="orderStore.isUpdating(order.id)"
						@click="handleStatusChange(order, 'ready')"
					>
						{{ orderStore.isUpdating(order.id) ? '处理中...' : '已出餐' }}
					</button>

					<view v-else class="status-tip">
						<text v-if="order.status === 'ready'">顾客端已收到“待取餐”状态，请等待取餐。</text>
						<text v-else>订单状态已完成同步。</text>
					</view>
				</view>
			</view>

			<view class="safe-space" :style="{ height: `${safeAreaInsets.bottom + 40}px` }"></view>
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

const tabs = [
	{ key: 'all', label: '全部' },
	{ key: 'paid', label: '待接单' },
	{ key: 'making', label: '制作中' },
	{ key: 'ready', label: '待取餐' },
];

const activeTab = ref('paid');
const pageVisible = ref(false);
const pollingAttached = ref(false);

const visibleOrders = computed(() => {
	if (activeTab.value === 'all') return orderStore.orders;
	return orderStore.orders.filter((item) => item.status === activeTab.value);
});

const lastFetchedText = computed(() => formatDateTime(orderStore.lastFetchedAt));

const tabCount = (tabKey) => {
	if (tabKey === 'all') return orderStore.orders.length;
	return orderStore.orders.filter((item) => item.status === tabKey).length;
};

const statusText = (status) => {
	const map = {
		pending: '待支付',
		paid: '待接单',
		making: '制作中',
		ready: '待取餐',
		finished: '已完成',
		cancelled: '已取消',
	};
	return map[status] || status;
};

const formatDateTime = (value) => {
	if (!value) return '--';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '--';
	const pad = (part) => String(part).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
		date.getHours(),
	)}:${pad(date.getMinutes())}`;
};

const formatAmount = (value) => {
	const amount = Number(value);
	return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
};

const getItemTags = (item = {}) => {
	const values = [
		item.size,
		item.cupSize,
		item.temperature,
		item.temp,
		item.sweet,
		item.sweetness,
		item.spec,
	];

	if (Array.isArray(item.toppings)) {
		values.push(...item.toppings);
	}
	if (Array.isArray(item.addons)) {
		values.push(...item.addons);
	}

	const tags = [];
	values.forEach((value) => {
		if (!value) return;
		String(value)
			.split(/[、,，/|]/)
			.map((part) => part.trim())
			.filter(Boolean)
			.forEach((part) => {
				if (!tags.includes(part)) {
					tags.push(part);
				}
			});
	});

	return tags.slice(0, 6);
};

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

const manualRefresh = async () => {
	try {
		await orderStore.refreshOrders();
		uni.showToast({ title: '订单已刷新', icon: 'success' });
	} catch (_) {
		uni.showToast({ title: '刷新失败，请稍后重试', icon: 'none' });
	}
};

const handleStatusChange = async (order, status) => {
	const actionText = status === 'making' ? '开始制作' : '标记已出餐';
	try {
		await orderStore.updateOrderStatus(order.id, status);
		uni.showToast({
			title: `${actionText}成功`,
			icon: 'success',
		});
	} catch (error) {
		uni.showToast({
			title: error?.message || `${actionText}失败`,
			icon: 'none',
		});
	}
};

const handleNewOrder = (payload = {}) => {
	if (!pageVisible.value) return;

	const count = Number(payload.count || payload.orders?.length || 1);
	const orderNo = payload.firstOrder?.order_no || '新订单';
	activeTab.value = 'paid';

	try {
		uni.vibrateLong();
	} catch (_) {}

	uni.showToast({
		title: count > 1 ? `有 ${count} 个新订单待接单` : `${orderNo} 已进入待接单`,
		icon: 'none',
		duration: 3000,
	});
};

const goBack = () => {
	try {
		uni.navigateBack();
	} catch (_) {
		uni.navigateTo({ url: '/pages/admin/index' });
	}
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
.order-manage-page {
	min-height: 100vh;
	background: #f5f7fb;
	display: flex;
	flex-direction: column;
}

.page-header {
	display: flex;
	align-items: center;
	padding: 16rpx 24rpx 20rpx;
	background: #ffffff;
	box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.05);
}

.header-left,
.header-right {
	width: 96rpx;
	flex-shrink: 0;
}

.header-left {
	display: flex;
	align-items: center;
	justify-content: flex-start;
}

.header-right {
	display: flex;
	align-items: center;
	justify-content: flex-end;
}

.back-icon {
	font-size: 40rpx;
	color: #111827;
}

.header-center {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.header-title {
	font-size: 32rpx;
	font-weight: 700;
	color: #111827;
}

.header-subtitle {
	margin-top: 6rpx;
	font-size: 22rpx;
	color: #6b7280;
}

.refresh-text {
	font-size: 26rpx;
	font-weight: 600;
	color: #0f62fe;
}

.summary-panel {
	display: flex;
	gap: 18rpx;
	padding: 24rpx 24rpx 0;
}

.summary-item {
	flex: 1;
	background: #ffffff;
	border-radius: 22rpx;
	padding: 24rpx 18rpx;
	text-align: center;
	box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.05);
}

.summary-item.warning {
	background: linear-gradient(180deg, #fff4f2 0%, #ffffff 100%);
}

.summary-item.primary {
	background: linear-gradient(180deg, #eef5ff 0%, #ffffff 100%);
}

.summary-item.success {
	background: linear-gradient(180deg, #eefcf5 0%, #ffffff 100%);
}

.summary-num {
	display: block;
	font-size: 40rpx;
	font-weight: 700;
	color: #111827;
}

.summary-label {
	display: block;
	margin-top: 8rpx;
	font-size: 24rpx;
	color: #6b7280;
}

.board-hint {
	margin: 20rpx 24rpx 0;
	padding: 22rpx 24rpx;
	border-radius: 20rpx;
	background: #fff9ec;
	border: 1rpx solid #ffe0a3;
}

.hint-text {
	display: block;
	font-size: 24rpx;
	line-height: 1.7;
	color: #8a4b08;
}

.hint-time {
	display: block;
	margin-top: 10rpx;
	font-size: 22rpx;
	color: #b36b16;
}

.tab-scroll {
	margin-top: 20rpx;
	padding: 0 24rpx;
	white-space: nowrap;
}

.tab-row {
	display: inline-flex;
	gap: 16rpx;
}

.tab-item {
	display: inline-flex;
	align-items: center;
	gap: 10rpx;
	padding: 18rpx 28rpx;
	border-radius: 999rpx;
	background: #ffffff;
	color: #4b5563;
	box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.05);
}

.tab-item.active {
	background: #0f62fe;
	color: #ffffff;
}

.tab-label {
	font-size: 26rpx;
	font-weight: 600;
}

.tab-count {
	min-width: 36rpx;
	height: 36rpx;
	padding: 0 10rpx;
	line-height: 36rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.22);
	text-align: center;
	font-size: 22rpx;
}

.error-bar {
	margin: 16rpx 24rpx 0;
	padding: 18rpx 22rpx;
	border-radius: 18rpx;
	background: #fff1f2;
}

.error-text {
	font-size: 24rpx;
	color: #dc2626;
}

.order-list {
	flex: 1;
	padding: 20rpx 24rpx 0;
	box-sizing: border-box;
}

.order-card {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 26rpx 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 12rpx 28rpx rgba(15, 23, 42, 0.06);
}

.card-top {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 20rpx;
}

.order-no {
	display: block;
	font-size: 30rpx;
	font-weight: 700;
	color: #111827;
}

.order-meta {
	display: block;
	margin-top: 10rpx;
	font-size: 23rpx;
	line-height: 1.5;
	color: #6b7280;
}

.status-tag {
	flex-shrink: 0;
	padding: 10rpx 18rpx;
	border-radius: 999rpx;
	font-size: 22rpx;
	font-weight: 600;
}

.status-tag.paid {
	background: #fff1f2;
	color: #dc2626;
}

.status-tag.making {
	background: #eef5ff;
	color: #2563eb;
}

.status-tag.ready {
	background: #ecfdf3;
	color: #059669;
}

.status-tag.finished,
.status-tag.cancelled,
.status-tag.pending {
	background: #f3f4f6;
	color: #6b7280;
}

.time-row {
	display: flex;
	justify-content: space-between;
	gap: 20rpx;
	margin-top: 18rpx;
	font-size: 23rpx;
	color: #6b7280;
}

.item-list {
	margin-top: 22rpx;
	padding-top: 22rpx;
	border-top: 1rpx solid #eef2f7;
}

.item-row {
	display: flex;
	align-items: flex-start;
	gap: 18rpx;
	margin-bottom: 18rpx;
}

.item-row:last-child {
	margin-bottom: 0;
}

.item-image {
	width: 88rpx;
	height: 88rpx;
	border-radius: 18rpx;
	background: #f3f4f6;
	flex-shrink: 0;
}

.item-main {
	flex: 1;
	min-width: 0;
}

.item-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 18rpx;
}

.item-name {
	flex: 1;
	font-size: 27rpx;
	font-weight: 600;
	color: #1f2937;
}

.item-count {
	flex-shrink: 0;
	font-size: 24rpx;
	color: #6b7280;
}

.tag-list {
	display: flex;
	flex-wrap: wrap;
	gap: 10rpx;
	margin-top: 12rpx;
}

.option-tag {
	padding: 8rpx 14rpx;
	border-radius: 999rpx;
	background: #f3f7ff;
	color: #335caa;
	font-size: 22rpx;
}

.action-row {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	margin-top: 24rpx;
	padding-top: 22rpx;
	border-top: 1rpx solid #eef2f7;
}

.action-btn {
	min-width: 220rpx;
	height: 76rpx;
	line-height: 76rpx;
	border-radius: 999rpx;
	border: none;
	font-size: 28rpx;
	font-weight: 600;
	margin: 0;

	&::after {
		border: none;
	}
}

.action-btn.primary {
	background: #0f62fe;
	color: #ffffff;
}

.action-btn.success {
	background: #10b981;
	color: #ffffff;
}

.status-tip {
	font-size: 24rpx;
	line-height: 1.6;
	color: #6b7280;
	text-align: right;
}

.empty-state {
	margin-top: 120rpx;
	padding: 0 40rpx;
	text-align: center;
}

.empty-title {
	display: block;
	font-size: 30rpx;
	font-weight: 600;
	color: #111827;
}

.empty-desc {
	display: block;
	margin-top: 12rpx;
	font-size: 24rpx;
	line-height: 1.7;
	color: #6b7280;
}
</style>
