<template>
	<view class="detail-page">
		<view class="page-header" :style="{ paddingTop: safeAreaInsets.top + 'px' }">
			<view class="header-left" @click="goBack">
				<text class="back-icon">‹</text>
			</view>
			<text class="header-title">订单详情</text>
			<view class="header-right"></view>
		</view>

		<view v-if="loading" class="loading-state">
			<text>加载中...</text>
		</view>

		<scroll-view v-else-if="order" scroll-y class="detail-body">
			<!-- 订单状态 -->
			<view class="status-section">
				<text class="status-icon">{{ statusIcon(order.status) }}</text>
				<text class="status-label">{{ statusText(order.status) }}</text>
			</view>

			<!-- 门店信息 -->
			<view class="block">
				<view class="block-row">
					<text class="row-label">门店</text>
					<text class="row-value">{{ order.store_name }}</text>
				</view>
				<view class="block-row">
					<text class="row-label">订单类型</text>
					<text class="row-value">{{ order.order_type === 'delivery' ? '外送' : '到店自取' }}</text>
				</view>
			</view>

			<!-- 商品明细 -->
			<view class="block">
				<text class="block-title">商品明细</text>
				<view class="item-row" v-for="(item, i) in order.items" :key="i">
					<image :src="item.image || '/static/logo.png'" class="item-img" mode="aspectFill" />
					<view class="item-info">
						<text class="item-name">{{ item.name }}</text>
						<text class="item-spec" v-if="item.spec">{{ item.spec }}</text>
					</view>
					<view class="item-right">
						<text class="item-price">¥{{ item.price }}</text>
						<text class="item-count">x{{ item.count }}</text>
					</view>
				</view>
			</view>

			<!-- 金额信息 -->
			<view class="block">
				<view class="block-row">
					<text class="row-label">商品总额</text>
					<text class="row-value">¥{{ order.total_amount }}</text>
				</view>
				<view class="block-row" v-if="order.discount_amount > 0">
					<text class="row-label">优惠</text>
					<text class="row-value discount">-¥{{ order.discount_amount }}</text>
				</view>
				<view class="block-row total-row">
					<text class="row-label bold">实付</text>
					<text class="row-value bold primary">¥{{ order.pay_amount }}</text>
				</view>
			</view>

			<!-- 订单信息 -->
			<view class="block">
				<text class="block-title">订单信息</text>
				<view class="block-row">
					<text class="row-label">订单编号</text>
					<text class="row-value mono">{{ order.order_no }}</text>
				</view>
				<view class="block-row">
					<text class="row-label">下单时间</text>
					<text class="row-value">{{ formatTime(order.created_at) }}</text>
				</view>
				<view class="block-row" v-if="order.paid_at">
					<text class="row-label">支付时间</text>
					<text class="row-value">{{ formatTime(order.paid_at) }}</text>
				</view>
			</view>

			<view style="height: 40rpx;"></view>
		</scroll-view>

		<view v-else class="loading-state">
			<text>订单不存在</text>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { fetchOrderDetail } from '@/common/api/order.js';
const { safeAreaInsets } = uni.getSystemInfoSync();

const order = ref(null);
const loading = ref(true);
const orderId = ref(null);

const statusMap = { pending: '待支付', paid: '已支付', making: '制作中', ready: '待取杯', finished: '已完成', cancelled: '已取消' };
const statusText = (s) => statusMap[s] || s;

const statusIconMap = { pending: '⏳', paid: '✅', making: '🔥', ready: '🔔', finished: '🎉', cancelled: '❌' };
const statusIcon = (s) => statusIconMap[s] || '📋';

const formatTime = (t) => {
	if (!t) return '';
	const d = new Date(t);
	const pad = (n) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

onLoad((query) => {
	if (query.id) {
		orderId.value = query.id;
		fetchDetail(query.id);
	} else {
		loading.value = false;
	}
});

const fetchDetail = async (id) => {
	loading.value = true;
	try {
		const d = await fetchOrderDetail(id);
		if (d) {
			order.value = {
				...d,
				total_amount: Number(d.total_amount),
				pay_amount: Number(d.pay_amount),
				discount_amount: Number(d.discount_amount || 0),
			};
		}
	} catch (e) {
		uni.showToast({ title: '加载失败', icon: 'none' });
	} finally {
		loading.value = false;
	}
};

const goBack = () => {
	try { uni.navigateBack(); } catch (e) {
		uni.switchTab({ url: '/pages/mine/mine' });
	}
};
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
	&:last-child {
		border-bottom: none;
	}
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
</style>
