<template>
	<view class="checkout-page">
		<view class="checkout-header" :style="{ paddingTop: safeAreaInsets.top + 'px' }">
			<view class="header-left" @click="cancelCheckout">
				<text class="back-icon">&lt;</text>
			</view>
			<text class="header-title">确认订单</text>
			<view class="header-right"></view>
		</view>

		<view v-if="loading" class="state-box">
			<text class="state-text">正在加载结算信息...</text>
		</view>

		<view v-else-if="!hasItems" class="state-box empty-box">
			<text class="empty-title">当前没有可结算商品</text>
			<text class="empty-desc">请先返回点单页选择商品后再进行结算。</text>
			<button class="empty-btn" @click="goToOrderPage">返回点单</button>
		</view>

		<scroll-view v-else scroll-y class="checkout-body">
			<view class="block pickup-block">
				<view class="pickup-top">
					<text class="pickup-tag">{{ orderTypeLabel }}</text>
					<text class="store-name">{{ resolvedStoreInfo.storeName || '门店信息未配置' }}</text>
				</view>
				<text class="pickup-line">{{ primaryAddressLine }}</text>
				<text v-if="secondaryAddressLine" class="pickup-subline">{{ secondaryAddressLine }}</text>
			</view>

			<view class="block order-type-block">
				<view
					:class="['type-btn', orderType === 'pickup' ? 'active' : '']"
					@click="setOrderType('pickup')"
				>
					<text class="type-main">到店自取</text>
					<text class="type-sub">{{ pickupTypeDesc }}</text>
				</view>
				<view
					:class="['type-btn', orderType === 'delivery' ? 'active' : '']"
					@click="setOrderType('delivery')"
				>
					<text class="type-main">外卖配送</text>
					<text class="type-sub">{{ deliveryTypeDesc }}</text>
				</view>
			</view>

			<view class="block product-block">
				<view class="block-title-row">
					<text class="block-title">商品明细</text>
					<text class="block-count">共 {{ totalCount }} 件</text>
				</view>
				<view class="product-item" v-for="(item, index) in orderItems" :key="`${item.id}-${index}`">
					<image :src="item.image || '/static/order.png'" class="prod-img" mode="aspectFill" />
					<view class="prod-detail">
						<view class="prod-main">
							<text class="prod-name">{{ item.name }}</text>
							<text class="prod-count">x{{ item.count }}</text>
						</view>
						<text v-if="item.spec" class="prod-spec">{{ item.spec }}</text>
						<text v-if="item.cal" class="prod-cal">{{ item.cal }}</text>
						<view class="prod-bottom">
							<text class="prod-unit">单价 ¥{{ formatAmount(item.price) }}</text>
							<text class="prod-price">¥{{ formatAmount(item.price * item.count) }}</text>
						</view>
					</view>
				</view>
			</view>

			<view class="block summary-block">
				<text class="block-title">费用明细</text>
				<view class="summary-row">
					<text class="summary-label">商品金额</text>
					<text class="summary-value">¥{{ totalPriceText }}</text>
				</view>
				<view class="summary-row">
					<text class="summary-label">商品件数</text>
					<text class="summary-value">{{ totalCount }} 件</text>
				</view>
				<view class="summary-row">
					<text class="summary-label">取餐方式</text>
					<text class="summary-value">{{ orderTypeLabel }}</text>
				</view>
				<view class="summary-row total-row">
					<text class="summary-label total-label">应付金额</text>
					<text class="summary-value total-value">¥{{ totalPriceText }}</text>
				</view>
			</view>

			<view :style="{ height: `${safeAreaInsets.bottom + 150}px` }"></view>
		</scroll-view>

		<view v-if="hasItems" class="bottom-bar" :style="{ paddingBottom: `${safeAreaInsets.bottom}px` }">
			<view class="bar-left">
				<text class="bar-label">待支付</text>
				<text class="bar-price">¥{{ totalPriceText }}</text>
			</view>
			<button class="pay-btn" :class="{ disabled: paying }" @click="doPay" :disabled="paying">
				{{ paying ? '支付中...' : '确认支付' }}
			</button>
		</view>
	</view>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { createOrder, payOrder } from '@/common/api/order.js';
import { fetchSiteConfig, fetchStoreDistance } from '@/common/api/site.js';
import { useMemberStore } from '@/stores/modules/member.js';

const memberStore = useMemberStore();
const safeAreaInsets = (() => {
	try {
		return uni.getSystemInfoSync().safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 };
	} catch (_) {
		return { top: 0, bottom: 0, left: 0, right: 0 };
	}
})();

const DEMO_STORE_VALUES = new Set([
	'贵港平南中心购物广场店',
	'距离您 3km · 步行约 15 分钟',
	'请选择收货地址 >',
	'➜ 贵港平南中心购物广场店 · 送出外卖',
	'new style tea, by inspiration >',
]);

const orderItems = ref([]);
const orderType = ref('pickup');
const paying = ref(false);
const loading = ref(true);
const rawStoreInfo = ref({});
const siteConfig = ref({});

const sanitizeStoreValue = (value) => {
	if (!value) return '';
	const text = String(value).trim();
	if (!text || DEMO_STORE_VALUES.has(text)) {
		return '';
	}
	return text;
};

const normalizeItem = (item = {}) => ({
	id: item.id || item.productId || item.product_id || '',
	name: item.name || item.productName || '未命名商品',
	price: Number(item.price || 0),
	image: item.image || '',
	count: Math.max(1, Number(item.count || 1)),
	spec: item.spec || '',
	cal: item.cal || '',
});

const hasItems = computed(() => orderItems.value.length > 0);
const totalCount = computed(() =>
	orderItems.value.reduce((sum, item) => sum + Number(item.count || 0), 0),
);
const totalPrice = computed(() =>
	orderItems.value.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.count || 0), 0),
);
const totalPriceText = computed(() => formatAmount(totalPrice.value));

const resolvedStoreInfo = computed(() => {
	const raw = rawStoreInfo.value || {};
	const cfg = siteConfig.value || {};
	return {
		storeName: sanitizeStoreValue(cfg.storeName) || sanitizeStoreValue(raw.storeName),
		storeAddress: sanitizeStoreValue(cfg.storeAddress) || sanitizeStoreValue(raw.storeAddress),
		pickupDistanceText:
			sanitizeStoreValue(raw.pickupDistanceText) || sanitizeStoreValue(cfg.pickupDistanceText),
		deliveryAddressText:
			sanitizeStoreValue(cfg.deliveryAddressText) ||
			sanitizeStoreValue(raw.deliveryAddressText) ||
			sanitizeStoreValue(cfg.storeAddress) ||
			sanitizeStoreValue(raw.storeAddress),
		deliveryStoreLine:
			sanitizeStoreValue(cfg.deliveryStoreLine) || sanitizeStoreValue(raw.deliveryStoreLine),
		storeSlogan: sanitizeStoreValue(cfg.storeSlogan) || sanitizeStoreValue(raw.storeSlogan),
	};
});

const orderTypeLabel = computed(() =>
	orderType.value === 'delivery' ? '外卖配送' : '到店自取',
);

const primaryAddressLine = computed(() => {
	if (orderType.value === 'delivery') {
		return (
			resolvedStoreInfo.value.deliveryAddressText ||
			resolvedStoreInfo.value.storeAddress ||
			'配送地址信息待完善'
		);
	}
	return (
		resolvedStoreInfo.value.storeAddress ||
		resolvedStoreInfo.value.pickupDistanceText ||
		'门店地址信息待完善'
	);
});

const secondaryAddressLine = computed(() => {
	if (orderType.value === 'delivery') {
		return (
			resolvedStoreInfo.value.deliveryStoreLine ||
			resolvedStoreInfo.value.storeSlogan ||
			''
		);
	}
	return resolvedStoreInfo.value.pickupDistanceText || '';
});

const pickupTypeDesc = computed(
	() => resolvedStoreInfo.value.pickupDistanceText || '到店后由门店出杯',
);
const deliveryTypeDesc = computed(
	() => resolvedStoreInfo.value.deliveryAddressText || '配送地址信息待完善',
);

const formatAmount = (value) => {
	const amount = Number(value);
	return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
};

const persistCheckoutOrder = () => {
	try {
		const current = uni.getStorageSync('checkoutOrder') || {};
		uni.setStorageSync('checkoutOrder', {
			...current,
			items: orderItems.value,
			orderType: orderType.value,
			storeInfo: rawStoreInfo.value,
		});
	} catch (_) {}
};

watch(orderType, async () => {
	if (loading.value) return;
	persistCheckoutOrder();
	if (orderType.value === 'pickup') {
		await updatePickupDistance();
	}
});

const loadSiteDisplayConfig = async () => {
	try {
		const cfg = await fetchSiteConfig();
		siteConfig.value = cfg || {};
	} catch (_) {
		siteConfig.value = {};
	}
};

const updatePickupDistance = async () => {
	if (orderType.value !== 'pickup') return;
	try {
		const location = await new Promise((resolve, reject) => {
			uni.getLocation({
				type: 'gcj02',
				success: resolve,
				fail: reject,
			});
		});
		const userLat = Number(location.latitude);
		const userLng = Number(location.longitude);
		if (!Number.isFinite(userLat) || !Number.isFinite(userLng)) return;
		const distance = await fetchStoreDistance({ userLat, userLng });
		if (distance?.distanceText) {
			rawStoreInfo.value = {
				...rawStoreInfo.value,
				pickupDistanceText: distance.distanceText,
			};
			persistCheckoutOrder();
		}
	} catch (_) {}
};

const loadCheckoutData = async () => {
	loading.value = true;
	try {
		const raw = uni.getStorageSync('checkoutOrder') || {};
		orderItems.value = Array.isArray(raw.items) ? raw.items.map(normalizeItem).filter((item) => item.id) : [];
		orderType.value = raw.orderType === 'delivery' ? 'delivery' : 'pickup';
		rawStoreInfo.value = raw.storeInfo && typeof raw.storeInfo === 'object' ? { ...raw.storeInfo } : {};
		await loadSiteDisplayConfig();
		await updatePickupDistance();
	} finally {
		loading.value = false;
	}
};

const setOrderType = (type) => {
	orderType.value = type === 'delivery' ? 'delivery' : 'pickup';
};

const cancelCheckout = () => {
	try {
		uni.navigateBack();
	} catch (_) {
		goToOrderPage();
	}
};

const goToOrderPage = () => {
	uni.switchTab({ url: '/pages/order/order' });
};

const doPay = async () => {
	if (paying.value || !hasItems.value) return;

	const userId = Number(memberStore.userId || 0);
	if (!userId) {
		uni.showToast({ title: '请先登录后再结算', icon: 'none' });
		setTimeout(() => {
			uni.navigateTo({ url: '/pages/login/login' });
		}, 500);
		return;
	}

	paying.value = true;
	uni.showLoading({ title: '正在创建订单...', mask: true });

	try {
		const orderRes = await createOrder({
			userId,
			items: orderItems.value,
			orderType: orderType.value,
			totalPrice: Number(totalPrice.value),
		});

		const { orderId, orderNo } = orderRes || {};

		uni.showLoading({ title: '支付中...', mask: true });
		await payOrder(orderId);
		uni.hideLoading();

		const deltaPoints = Math.max(0, Math.round(Number(totalPrice.value) || 0));
		if (deltaPoints > 0) {
			memberStore.points = Number(memberStore.points || 0) + deltaPoints;
		}

		uni.removeStorageSync('checkoutOrder');
		uni.setStorageSync('justPaid', true);
		uni.setStorageSync('lastPaidOrder', {
			orderId,
			orderNo,
			totalPrice: totalPriceText.value,
			items: orderItems.value,
			orderType: orderType.value,
			paidAt: new Date().toISOString(),
		});

		uni.showToast({ title: '支付成功', icon: 'success', duration: 1500 });
		setTimeout(() => {
			uni.switchTab({ url: '/pages/order/order' });
		}, 1500);
	} catch (error) {
		uni.hideLoading();
		console.error('[checkout] pay error:', error);
		uni.showModal({
			title: '支付失败',
			content: error?.message || '网络异常，请稍后重试',
			showCancel: false,
		});
	} finally {
		paying.value = false;
	}
};

onLoad(() => {
	loadCheckoutData();
});
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.checkout-page {
	min-height: 100vh;
	background: #f5f7fb;
}

.checkout-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16rpx 24rpx;
	background: #fff;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.header-left,
.header-right {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
}

.header-left {
	justify-content: flex-start;
}

.header-right {
	justify-content: flex-end;
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

.checkout-body {
	height: calc(100vh - 112rpx);
	padding: 20rpx 24rpx 0;
	box-sizing: border-box;
}

.block {
	background: #fff;
	border-radius: 24rpx;
	padding: 28rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.04);
}

.pickup-block {
	background: linear-gradient(135deg, #0f3b8f 0%, #0a57d1 100%);
	color: #fff;
}

.pickup-top {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.pickup-tag {
	flex-shrink: 0;
	padding: 8rpx 16rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.18);
	font-size: 22rpx;
}

.store-name {
	font-size: 32rpx;
	font-weight: 700;
	line-height: 1.4;
}

.pickup-line {
	display: block;
	margin-top: 18rpx;
	font-size: 26rpx;
	line-height: 1.6;
	color: rgba(255, 255, 255, 0.92);
}

.pickup-subline {
	display: block;
	margin-top: 8rpx;
	font-size: 23rpx;
	line-height: 1.6;
	color: rgba(255, 255, 255, 0.72);
}

.order-type-block {
	display: flex;
	gap: 16rpx;
}

.type-btn {
	flex: 1;
	border: 2rpx solid #e5e7eb;
	border-radius: 18rpx;
	padding: 22rpx 20rpx;
}

.type-btn.active {
	border-color: $uni-color-primary;
	background: rgba($uni-color-primary, 0.06);
}

.type-main {
	display: block;
	font-size: 28rpx;
	font-weight: 700;
	color: #1f2937;
}

.type-sub {
	display: block;
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 1.5;
	color: #6b7280;
}

.type-btn.active .type-main,
.type-btn.active .type-sub {
	color: $uni-color-primary;
}

.block-title-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8rpx;
}

.block-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #111827;
}

.block-count {
	font-size: 24rpx;
	color: #6b7280;
}

.product-item {
	display: flex;
	align-items: flex-start;
	padding: 24rpx 0;
	border-bottom: 1rpx solid #f0f2f5;
}

.product-item:last-child {
	border-bottom: none;
	padding-bottom: 0;
}

.prod-img {
	width: 144rpx;
	height: 144rpx;
	border-radius: 18rpx;
	background: #f3f4f6;
	flex-shrink: 0;
	margin-right: 20rpx;
}

.prod-detail {
	flex: 1;
	min-width: 0;
}

.prod-main {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
}

.prod-name {
	flex: 1;
	font-size: 28rpx;
	font-weight: 700;
	color: #1f2937;
	line-height: 1.5;
}

.prod-count {
	flex-shrink: 0;
	font-size: 24rpx;
	color: #6b7280;
}

.prod-spec,
.prod-cal {
	display: block;
	margin-top: 10rpx;
	font-size: 22rpx;
	line-height: 1.6;
	color: #6b7280;
}

.prod-bottom {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 18rpx;
}

.prod-unit {
	font-size: 22rpx;
	color: #9ca3af;
}

.prod-price {
	font-size: 28rpx;
	font-weight: 700;
	color: #111827;
}

.summary-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16rpx 0;
	font-size: 26rpx;
	color: #374151;
}

.total-row {
	margin-top: 6rpx;
	padding-top: 24rpx;
	border-top: 1rpx solid #f0f2f5;
}

.total-label {
	font-weight: 700;
	color: #111827;
}

.total-value {
	font-size: 34rpx;
	font-weight: 700;
	color: $uni-color-primary;
}

.summary-label {
	color: #6b7280;
}

.summary-value {
	color: #111827;
}

.bottom-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 18rpx 24rpx 18rpx;
	background: rgba(255, 255, 255, 0.98);
	box-shadow: 0 -6rpx 24rpx rgba(15, 23, 42, 0.08);
}

.bar-left {
	display: flex;
	flex-direction: column;
}

.bar-label {
	font-size: 22rpx;
	color: #9ca3af;
}

.bar-price {
	margin-top: 6rpx;
	font-size: 38rpx;
	font-weight: 700;
	color: $uni-color-primary;
}

.pay-btn {
	width: 236rpx;
	height: 78rpx;
	line-height: 78rpx;
	border-radius: 999rpx;
	border: none;
	background: $uni-color-primary;
	color: #fff;
	font-size: 30rpx;
	font-weight: 600;
	margin: 0;
}

.pay-btn::after {
	border: none;
}

.pay-btn.disabled {
	opacity: 0.65;
}

.state-box {
	min-height: calc(100vh - 112rpx);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40rpx;
	box-sizing: border-box;
}

.state-text {
	font-size: 28rpx;
	color: #6b7280;
}

.empty-box {
	text-align: center;
}

.empty-title {
	font-size: 34rpx;
	font-weight: 700;
	color: #111827;
}

.empty-desc {
	margin-top: 14rpx;
	font-size: 24rpx;
	line-height: 1.7;
	color: #6b7280;
}

.empty-btn {
	margin-top: 36rpx;
	min-width: 220rpx;
	height: 76rpx;
	line-height: 76rpx;
	border-radius: 999rpx;
	border: none;
	background: $uni-color-primary;
	color: #fff;
	font-size: 28rpx;
	font-weight: 600;
}

.empty-btn::after {
	border: none;
}
</style>
