<template>
	<view class="checkout-page">
		<!-- 顶部返回 + 标题 -->
		<view class="checkout-header" :style="{ paddingTop: safeAreaInsets.top + 'px' }">
			<view class="header-left" @click="cancelCheckout">
				<text class="back-icon">‹</text>
			</view>
			<text class="header-title">确认订单</text>
			<view class="header-right"></view>
		</view>

		<!-- 取茶信息 -->
		<view class="block pickup-block">
			<view class="pickup-row">
				<text class="tag">到店取</text>
				<text class="store-name">贵港平南中心购物广场店</text>
				<text class="arrow">></text>
				<text class="distance">2.9km</text>
				<image class="map-icon" src="/static/logo.png" mode="aspectFit" />
			</view>
			<view class="pickup-tip">现在下单,预计7分钟后取茶</view>
		</view>

		<!-- 堂食/外带 -->
		<view class="block order-type-block">
			<view
				:class="['type-btn', orderType === 'dine' ? 'active' : '']"
				@click="orderType = 'dine'"
			>
				<text class="type-main">堂食</text>
				<text class="type-sub">店内现喝</text>
			</view>
			<view
				:class="['type-btn', orderType === 'takeout' ? 'active' : '']"
				@click="orderType = 'takeout'"
			>
				<text class="type-main">外带</text>
				<text class="type-sub">纸袋打包 ></text>
			</view>
		</view>

		<!-- DIY 喜贴 -->
		<view class="block diy-block" @click="goDiy">
			<text class="diy-title">DIY喜贴|邀你灵感一现</text>
			<text class="diy-link">去定制 ></text>
		</view>

		<!-- 商品明细 -->
		<view class="block product-block">
			<view class="block-title">商品明细</view>
			<view class="product-item" v-for="(item, index) in orderItems" :key="index">
				<view class="prod-img-wrap">
					<image :src="item.image || '/static/logo.png'" class="prod-img" mode="aspectFill" />
					<text class="prod-cal" v-if="item.cal">{{ item.cal }} 大卡/杯</text>
				</view>
				<view class="prod-detail">
					<text class="prod-name">{{ item.name }}</text>
					<text class="prod-spec">{{ item.spec || '' }}</text>
					<view class="prod-right">
						<text class="prod-price">¥{{ item.price }}</text>
						<text class="prod-num">x{{ item.count }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 精选搭配 -->
		<view class="block match-block">
			<view class="block-title">精选搭配</view>
			<scroll-view scroll-x class="match-scroll" show-scrollbar="false">
				<view class="match-item" v-for="(m, i) in matchList" :key="i" @click="addMatch(m)">
					<image :src="m.image || '/static/logo.png'" class="match-img" mode="aspectFill" />
					<text class="match-name">{{ m.name }}</text>
					<text class="match-price">¥{{ m.price }}</text>
					<view class="match-add">+</view>
				</view>
			</scroll-view>
		</view>

		<!-- 优惠信息 -->
		<view class="block coupon-block">
			<view class="coupon-card" @click="openCard">
				<view class="coupon-row">
					<text class="coupon-title">开「金喜卡」本单可减8元></text>
					<text class="coupon-tag">¥8.8/90天</text>
				</view>
				<text class="coupon-desc">享90天最高可省98元</text>
			</view>
			<view class="coupon-row plain" @click="openCoupon">
				<text class="coupon-label">喜茶券</text>
				<text class="coupon-value">暂无可用 ></text>
			</view>
		</view>

		<!-- 底部支付栏 -->
		<view class="bottom-bar">
			<view class="bar-left">
				<text class="bar-label">待支付</text>
				<text class="bar-price">¥{{ totalPrice }}</text>
			</view>
			<button class="pay-btn" @click="doPay">支付</button>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
const { safeAreaInsets } = uni.getSystemInfoSync();

// 从 storage 读取点餐页传入的结算数据
const orderItems = ref([]);
const orderType = ref('dine'); // dine | takeout

const totalPrice = computed(() => {
	return orderItems.value.reduce((sum, it) => sum + it.price * it.count, 0).toFixed(2);
});

// 精选搭配静态数据
const matchList = ref([
	{ id: 1, name: '茉莉绿妍凤梨...', price: 32.8, image: '' },
	{ id: 2, name: '绿妍蝴蝶酥', price: 3.5, image: '' },
	{ id: 3, name: '金凤茶酥', price: 1.9, image: '' },
]);

onMounted(() => {
	try {
		const raw = uni.getStorageSync('checkoutOrder');
		if (raw && raw.items && raw.items.length) {
			orderItems.value = raw.items;
			return;
		}
	} catch (e) {}
	// 无数据时静态演示
	orderItems.value = [
		{
			id: 101,
			name: '奇兰苹果杏(无柠檬叶版)',
			price: 19,
			image: '',
			count: 1,
			spec: '冰(推荐),推荐,少甜(推荐),可降解吸管',
			cal: '65',
		},
	];
});

const goDiy = () => {
	uni.showToast({ title: '去定制', icon: 'none' });
};

const addMatch = () => {
	uni.showToast({ title: '已加入搭配', icon: 'none' });
};

const openCard = () => {
	uni.showToast({ title: '金喜卡', icon: 'none' });
};

const openCoupon = () => {
	uni.showToast({ title: '喜茶券', icon: 'none' });
};

const cancelCheckout = () => {
	// 返回上一页（点单页），保留原来的购物车数据
	try {
		uni.navigateBack();
	} catch (e) {
		// 如果栈中没有上一页，则兜底跳转到点单页 Tab
		uni.switchTab({ url: '/pages/order/order' });
	}
};

const doPay = () => {
	uni.showToast({ title: '支付演示', icon: 'none' });
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.checkout-page {
	min-height: 100vh;
	background: #f5f5f5;
	padding-bottom: 140rpx;
}

.checkout-header {
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
	justify-content: flex-start;
}
.back-icon {
	font-size: 40rpx;
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
	height: 80rpx;
}

.block {
	background: #fff;
	margin-bottom: 20rpx;
	padding: 24rpx 30rpx;
}

.block-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
}

/* 取茶信息 */
.pickup-block {
	.pickup-row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		.tag {
			background: #333;
			color: #fff;
			font-size: 22rpx;
			padding: 4rpx 12rpx;
			border-radius: 4rpx;
			margin-right: 16rpx;
		}
		.store-name {
			flex: 1;
			font-size: 28rpx;
			color: #333;
			min-width: 0;
		}
		.arrow {
			font-size: 24rpx;
			color: #999;
			margin-right: 12rpx;
		}
		.distance {
			font-size: 24rpx;
			color: #999;
			margin-right: 8rpx;
		}
		.map-icon {
			width: 28rpx;
			height: 28rpx;
		}
	}
	.pickup-tip {
		margin-top: 16rpx;
		font-size: 24rpx;
		color: #666;
	}
}

/* 堂食/外带 */
.order-type-block {
	display: flex;
	gap: 20rpx;
	.type-btn {
		flex: 1;
		border: 2rpx solid #e0e0e0;
		border-radius: 12rpx;
		padding: 24rpx;
		.type-main {
			display: block;
			font-size: 30rpx;
			font-weight: bold;
			color: #333;
		}
		.type-sub {
			font-size: 22rpx;
			color: #999;
			margin-top: 8rpx;
		}
		&.active {
			border-color: $uni-color-primary;
			background: rgba($uni-color-primary, 0.06);
			.type-main,
			.type-sub {
				color: $uni-color-primary;
			}
		}
	}
}

/* DIY */
.diy-block {
	display: flex;
	justify-content: space-between;
	align-items: center;
	.diy-title {
		font-size: 28rpx;
		color: #333;
	}
	.diy-link {
		font-size: 26rpx;
		color: $uni-color-primary;
	}
}

/* 商品明细 */
.product-block {
	.product-item {
		display: flex;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
		&:last-child {
			border-bottom: none;
		}
	}
	.prod-img-wrap {
		width: 160rpx;
		margin-right: 20rpx;
		.prod-img {
			width: 160rpx;
			height: 160rpx;
			border-radius: 12rpx;
			background: #f0f0f0;
		}
		.prod-cal {
			display: block;
			font-size: 20rpx;
			color: #999;
			margin-top: 8rpx;
			text-align: center;
		}
	}
	.prod-detail {
		flex: 1;
		.prod-name {
			font-size: 28rpx;
			font-weight: bold;
			color: #333;
			display: block;
		}
		.prod-spec {
			font-size: 22rpx;
			color: #999;
			display: block;
			margin-top: 8rpx;
		}
		.prod-right {
			margin-top: 16rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			.prod-price {
				font-size: 30rpx;
				font-weight: bold;
				color: #333;
			}
			.prod-num {
				font-size: 24rpx;
				color: #999;
			}
		}
	}
}

/* 精选搭配 */
.match-block {
	.match-scroll {
		white-space: nowrap;
	}
	.match-item {
		display: inline-block;
		width: 200rpx;
		margin-right: 20rpx;
		text-align: center;
		.match-img {
			width: 200rpx;
			height: 200rpx;
			border-radius: 12rpx;
			background: #f0f0f0;
		}
		.match-name {
			display: block;
			font-size: 24rpx;
			color: #333;
			margin-top: 12rpx;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.match-price {
			font-size: 26rpx;
			color: #333;
			font-weight: bold;
		}
		.match-add {
			width: 56rpx;
			height: 56rpx;
			border-radius: 50%;
			background: #333;
			color: #fff;
			text-align: center;
			line-height: 56rpx;
			font-size: 36rpx;
			margin: 12rpx auto 0;
		}
	}
}

/* 优惠 */
.coupon-block {
	.coupon-card {
		background: linear-gradient(135deg, #fff8e6 0%, #e8f5e9 100%);
		border-radius: 12rpx;
		padding: 20rpx 24rpx;
		margin-bottom: 20rpx;
		.coupon-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
		.coupon-title {
			font-size: 28rpx;
			color: #333;
			font-weight: 500;
		}
		.coupon-tag {
			font-size: 24rpx;
			color: #666;
		}
		.coupon-desc {
			display: block;
			font-size: 22rpx;
			color: #999;
			margin-top: 8rpx;
		}
	}
	.coupon-row.plain {
		padding: 16rpx 0;
		.coupon-label {
			font-size: 28rpx;
			color: #333;
		}
		.coupon-value {
			font-size: 26rpx;
			color: #999;
		}
	}
}

/* 底部支付栏 */
.bottom-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	height: 100rpx;
	padding-bottom: env(safe-area-inset-bottom);
	background: #fff;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-left: 30rpx;
	padding-right: 30rpx;
	box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
	.bar-left {
		.bar-label {
			font-size: 24rpx;
			color: #999;
			margin-right: 8rpx;
		}
		.bar-price {
			font-size: 36rpx;
			font-weight: bold;
			color: $uni-color-primary;
		}
	}
	.pay-btn {
		background: $uni-color-primary;
		color: #fff;
		font-size: 30rpx;
		width: 220rpx;
		height: 72rpx;
		line-height: 72rpx;
		text-align: center;
		border-radius: 36rpx;
		border: none;
		margin:0;
		&::after {
			border: none;
		}
	}
}
</style>

