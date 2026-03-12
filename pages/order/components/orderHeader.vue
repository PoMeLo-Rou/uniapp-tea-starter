<template>
	<view class="header" :style="{ paddingTop: safeAreaInsets.top + 'px' }">
		<!-- 顶部模式切换：到店取 / 喜外送 -->
		<view class="mode-toggle">
			<view
				class="mode-item"
				:class="{ active: mode === 'pickup' }"
				@click="setMode('pickup')"
			>
				<text>到店取</text>
			</view>
			<text class="mode-sep">｜</text>
			<view
				class="mode-item"
				:class="{ active: mode === 'delivery' }"
				@click="setMode('delivery')"
			>
				<text>喜外送</text>
			</view>
		</view>

		<!-- 自提模式内容 -->
		<view v-if="mode === 'pickup'" class="pickup-block">
			<view class="pickup-title-row">
				<text class="pickup-title">贵港平南中心购物广场店</text>
				<text class="pickup-arrow">></text>
			</view>
			<text class="pickup-sub">距离您 3km · 步行约 15 分钟</text>
		</view>

		<!-- 外送模式内容 -->
		<view v-else class="delivery-block">
			<view class="delivery-row">
				<text class="loc-icon">📍</text>
				<text class="addr-main">请选择收货地址 ></text>
			</view>
			<text class="store-line">⇄ 贵港平南中心购物广场店 ｜ 送出外卖</text>
			<text class="slogan">new style tea, by inspiration ></text>
		</view>
	</view>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
	orderType: { type: String, default: 'pickup' },
});
const emit = defineEmits(['update:orderType']);

const { safeAreaInsets } = uni.getSystemInfoSync();
const mode = ref(props.orderType);

watch(() => props.orderType, (val) => {
	mode.value = val;
});

const setMode = (val) => {
	mode.value = val;
	emit('update:orderType', val);
};

const handleOrderModeChange = (val) => {
	if (val === 'delivery' || val === 'pickup') {
		setMode(val);
	}
};

onMounted(() => {
	uni.$on('orderModeChange', handleOrderModeChange);
});

onUnmounted(() => {
	uni.$off('orderModeChange', handleOrderModeChange);
});
</script>

<style lang="scss" scoped>
.header {
	background-color: #fff;
	padding: 16rpx 30rpx 24rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	z-index: 10;
}

.mode-toggle {
	flex-direction: row;
	justify-content: flex-start;
	align-items: center;
	display: flex;
	margin-bottom: 16rpx;
}

.mode-item {
	padding: 4rpx 6rpx;
	font-size: 28rpx;
	color: #999;
}
.mode-item.active {
	color: #ffffff;
	font-weight: 600;
}
.mode-item.active text {
	color: #023993;
}
.mode-sep {
	margin: 0 12rpx;
	color: #ccc;
}

.pickup-block {
	margin-top: 6rpx;
}
.pickup-title-row {
	display: flex;
	align-items: center;
}
.pickup-title {
	font-size: 34rpx;
	font-weight: bold;
	color: #000;
}
.pickup-arrow {
	margin-left: 8rpx;
	font-size: 26rpx;
	color: #000;
}
.pickup-sub {
	margin-top: 8rpx;
	font-size: 24rpx;
	color: #e0e0e0;
}

.delivery-block {
	margin-top: 6rpx;
}
.delivery-row {
	display: flex;
	align-items: center;
}
.loc-icon {
	font-size: 30rpx;
	margin-right: 8rpx;
	color: #ffd666;
}
.addr-main {
	font-size: 30rpx;
	color: #000;
}
.store-line {
	margin-top: 6rpx;
	font-size: 24rpx;
	color: #e0e0e0;
}
.slogan {
	margin-top: 10rpx;
	font-size: 22rpx;
	color: #c0c0c0;
}
</style>
