<template>
	<view v-if="show" class="drawer-wrap" @click.self="close">
		<view class="drawer-mask" :class="{ 'mask-show': panelVisible }" @click="close"></view>
		<view class="drawer-panel" :class="{ 'panel-show': panelVisible }">
			<view class="drawer-header" :style="{ paddingTop: safeAreaInsets.top + 'px' }">
				<view class="drawer-close" @click="close"><</view>
				<text class="drawer-title">历史订单</text>
			</view>
			<scroll-view scroll-y class="drawer-body">
				<view
					v-for="(order, index) in orderList"
					:key="order.order_no"
					class="order-row"
					@click="goDetail(index)"
				>
					<view class="order-row-top">
						<text class="order-no">{{ order.order_no }}</text>
						<text class="order-status">{{ order.status === 'paid' ? '已支付' : order.status }}</text>
					</view>
					<view class="order-row-mid">
						<text class="order-store">{{ order.store_name }}</text>
						<text class="order-type">{{ order.order_type === 'takeout' ? '外带' : '堂食' }}</text>
					</view>
					<view class="order-row-bottom">
						<text class="order-time">{{ formatTime(order.created_at) }}</text>
						<text class="order-price">¥{{ order.total_amount }}</text>
					</view>
				</view>
				<view v-if="orderList.length === 0" class="empty-tip">暂无订单</view>
				<view class="safe-bottom" :style="{ height: safeAreaInsets.bottom + 20 + 'px' }"></view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
	show: { type: Boolean, default: false },
});

const emit = defineEmits(['update:show']);

// 兼容部分环境无 safeAreaInsets
const safeAreaInsets = (() => {
	try {
		const sys = uni.getSystemInfoSync();
		return sys.safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 };
	} catch (e) {
		return { top: 0, bottom: 0, left: 0, right: 0 };
	}
})();
const orderList = ref([]);
const panelVisible = ref(false);
const closeTimer = ref(null);

function loadHistory() {
	try {
		const list = uni.getStorageSync('orderHistory') || [];
		orderList.value = Array.isArray(list) ? list : [];
	} catch (e) {
		orderList.value = [];
	}
}

function formatTime(ts) {
	if (!ts) return '';
	const d = new Date(ts);
	const m = d.getMonth() + 1;
	const day = d.getDate();
	const h = d.getHours();
	const min = d.getMinutes();
	return `${m}/${day} ${h}:${min < 10 ? '0' + min : min}`;
}

function close() {
	panelVisible.value = false;
	if (closeTimer.value) clearTimeout(closeTimer.value);
	closeTimer.value = setTimeout(() => {
		emit('update:show', false);
		closeTimer.value = null;
	}, 320);
}

function goDetail(index) {
	close();
	uni.navigateTo({ url: '/pages/order/detail?id=local_' + index });
}

watch(() => props.show, (val) => {
	if (val) {
		loadHistory();
		panelVisible.value = false;
		nextTick(() => {
			setTimeout(() => {
				panelVisible.value = true;
			}, 30);
		});
	} else {
		panelVisible.value = false;
	}
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
	right: 0;
	width: 100%;
	height: 100%;
	background: #fff;
	box-shadow: -4rpx 0 20rpx rgba(0, 0, 0, 0.1);
	transform: translateX(100%);
	-webkit-transform: translateX(100%);
	transition: transform 0.3s ease;
	-webkit-transition: transform 0.3s ease;
	display: flex;
	flex-direction: column;
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
.drawer-title { font-size: 34rpx; font-weight: 600; color: #333; }
.drawer-close { font-size: 36rpx; color: #999; padding: 10rpx; }

.drawer-body {
	flex: 1;
	height: 0;
	padding: 0 24rpx;
}

.order-row {
	padding: 24rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}
.order-row-top {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8rpx;
}
.order-no { font-size: 26rpx; color: #666; }
.order-status { font-size: 24rpx; color: #023993; font-weight: 500; }
.order-row-mid {
	display: flex;
	justify-content: space-between;
	margin-bottom: 8rpx;
}
.order-store { font-size: 28rpx; color: #333; }
.order-type { font-size: 24rpx; color: #999; }
.order-row-bottom {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.order-time { font-size: 24rpx; color: #999; }
.order-price { font-size: 28rpx; font-weight: 600; color: #333; }

.empty-tip {
	padding: 80rpx 0;
	text-align: center;
	color: #999;
	font-size: 28rpx;
}
</style>
