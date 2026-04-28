<template>
	<view v-if="show" class="drawer-wrap" @click.self="close">
		<view class="drawer-mask" :class="{ 'mask-show': panelVisible }" @click="close"></view>
		<view class="drawer-panel" :class="{ 'panel-show': panelVisible }">
			<view class="drawer-header" :style="{ paddingTop: safeAreaInsets.top + 'px' }">
				<view class="drawer-close" @click="close">
					<text>‹</text>
				</view>
				<text class="drawer-title">历史订单</text>
			</view>
			<scroll-view scroll-y class="drawer-body">
				<view
					v-for="order in orderList"
					:key="order.id || order.order_no"
					class="order-row"
					@click="goDetail(order)"
				>
					<view class="order-row-top">
						<text class="order-no">{{ order.order_no }}</text>
						<text class="order-status">{{ statusText(order.status) }}</text>
					</view>
					<view class="order-row-mid">
						<text class="order-store">{{ order.store_name }}</text>
						<text class="order-type">{{ order.order_type === 'delivery' ? '外卖配送' : '到店自取' }}</text>
					</view>
					<view class="order-row-bottom">
						<text class="order-time">{{ formatTime(order.created_at) }}</text>
						<text class="order-price">¥{{ formatAmount(order.total_amount) }}</text>
					</view>
				</view>
				<view v-if="orderList.length === 0" class="empty-tip">暂无订单</view>
				<view class="safe-bottom" :style="{ height: safeAreaInsets.bottom + 20 + 'px' }"></view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { fetchOrderList } from '@/common/api/order.js';
import { useMemberStore } from '@/stores/modules/member.js';

const props = defineProps({
	show: { type: Boolean, default: false },
});

const emit = defineEmits(['update:show']);

const safeAreaInsets = (() => {
	try {
		const sys = uni.getSystemInfoSync();
		return sys.safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 };
	} catch (_) {
		return { top: 0, bottom: 0, left: 0, right: 0 };
	}
})();

const orderList = ref([]);
const panelVisible = ref(false);
const closeTimer = ref(null);

const statusMap = {
	pending: '待支付',
	paid: '已支付',
	making: '制作中',
	ready: '待取餐',
	finished: '已完成',
	cancelled: '已取消',
};

const statusText = (status) => statusMap[status] || status;

const formatTime = (value) => {
	if (!value) return '--';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '--';
	const pad = (part) => String(part).padStart(2, '0');
	return `${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(
		date.getMinutes(),
	)}`;
};

const formatAmount = (value) => {
	const amount = Number(value);
	return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
};

const loadHistory = async () => {
	try {
		const memberStore = useMemberStore();
		if (!memberStore.userId) {
			orderList.value = [];
			uni.showToast({ title: '请先登录', icon: 'none' });
			return;
		}

		const list = await fetchOrderList({ userId: memberStore.userId });
		orderList.value = Array.isArray(list) ? list : list?.list || list?.rows || [];
	} catch (_) {
		orderList.value = [];
	}
};

const close = () => {
	panelVisible.value = false;
	if (closeTimer.value) clearTimeout(closeTimer.value);
	closeTimer.value = setTimeout(() => {
		emit('update:show', false);
		closeTimer.value = null;
	}, 320);
};

const goDetail = (order) => {
	const targetId = order.id || order.orderId || order.order_id;
	if (!targetId) return;
	uni.navigateTo({ url: `/pages/order/detail?id=${targetId}` });
	close();
};

const handleOrderStatusChanged = () => {
	if (!props.show) return;
	loadHistory();
};

watch(
	() => props.show,
	(value) => {
		if (value) {
			loadHistory();
			panelVisible.value = false;
			nextTick(() => {
				setTimeout(() => {
					panelVisible.value = true;
				}, 30);
			});
			return;
		}
		panelVisible.value = false;
	},
);

onMounted(() => {
	uni.$on('order:status-changed', handleOrderStatusChanged);
});

onUnmounted(() => {
	uni.$off('order:status-changed', handleOrderStatusChanged);
});
</script>

<style lang="scss" scoped>
.drawer-wrap {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1000;
}

.drawer-mask {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0);
	transition: background 0.25s ease;
}

.drawer-mask.mask-show {
	background: rgba(0, 0, 0, 0.4);
}

.drawer-panel {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 100%;
	background: #fff;
	transform: translateX(100%);
	-webkit-transform: translateX(100%);
	transition: transform 0.3s ease;
	-webkit-transition: transform 0.3s ease;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.drawer-panel.panel-show {
	transform: translateX(0);
	-webkit-transform: translateX(0);
}

.drawer-header {
	display: flex;
	align-items: center;
	gap: 20rpx;
	padding: 24rpx 30rpx 20rpx;
	border-bottom: 1rpx solid #eee;
	flex-shrink: 0;
}

.drawer-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #333;
}

.drawer-close {
	font-size: 36rpx;
	color: #999;
	padding: 10rpx;
}

.drawer-body {
	flex: 1;
	height: 0;
	padding: 0 30rpx;
	box-sizing: border-box;
	width: 100%;
}

.order-row {
	padding: 24rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
	overflow: hidden;
}

.order-row-top {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8rpx;
}

.order-no {
	font-size: 26rpx;
	color: #666;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	margin-right: 16rpx;
}

.order-status {
	font-size: 24rpx;
	color: #023993;
	font-weight: 500;
	flex-shrink: 0;
}

.order-row-mid {
	display: flex;
	justify-content: space-between;
	margin-bottom: 8rpx;
}

.order-store {
	font-size: 28rpx;
	color: #333;
}

.order-type {
	font-size: 24rpx;
	color: #999;
	flex-shrink: 0;
}

.order-row-bottom {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.order-time {
	font-size: 24rpx;
	color: #999;
}

.order-price {
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
	flex-shrink: 0;
}

.empty-tip {
	padding: 80rpx 0;
	text-align: center;
	color: #999;
	font-size: 28rpx;
}
</style>
