<template>
	<view class="container">

		<!-- 0. 订单进度（静态演示） -->
		<!-- <view class="order-progress-section">
			<view class="order-card" v-for="order in orderList" :key="order.id">
				<view class="card-header">
					<text class="order-id">订单号：{{ order.id }}</text>
					<text class="order-status">{{ order.statusText }}</text>
				</view>
				<view class="progress-box">
					<uni-steps :options="stepOptions" :active="order.step" active-color="#007aff" deactive-color="#B7BDC6" />
				</view>
				<view class="queue-info" v-if="order.step === 1">
					<text class="icon">⏳</text>
					<text>前方还有 <text class="highlight">3</text> 杯，预计等待 <text class="highlight">8</text> 分钟</text>
				</view>
			</view>
		</view> -->

		<!-- 1. 顶部店铺信息 Header -->
		<!--    <view class="header">
      <view class="header-top">
        <view class="shop-info">
          <text class="shop-name">沁森柠 (Uni-app店) ></text>
          <text class="distance">📍 距离您 1.2km · 步行约 15 分钟</text>
        </view>
        <view class="toggle-btn">
          <view class="btn active">自取</view>
          <view class="btn">外卖</view>
        </view>
      </view>
      <view class="notice">
        <text class="notice-tag">公告</text>
        <text class="notice-text">会员日全场双倍积分，新品“酷黑莓桑”上线！</text>
      </view>
    </view -->
		<orderHeader :orderType="orderType" :storeInfo="storeInfo" @update:orderType="orderType = $event" />
		<view class="search-bar">
			<view class="search-panel">
				<view class="search-copy">
					<text class="search-kicker">点单搜索</text>
					<text class="search-title">{{ hasSearchKeyword ? `正在查找「${searchKeyword.trim()}」` : '今天想喝点什么？' }}</text>
					<text class="search-hint">搜索奶茶、小料或口味，找饮品会更快一点。</text>
				</view>
				<view :class="['search-box', hasSearchKeyword ? 'active' : '']">
					<view class="search-icon-wrap">
						<text class="search-icon">搜</text>
					</view>
				<input
					v-model="searchKeyword"
					class="search-input"
					placeholder="搜索奶茶、小料、口味"
					placeholder-style="color: #90a4c7;"
					confirm-type="search"
				/>
					<text v-if="searchKeyword" class="search-clear" @click="clearSearch">重置</text>
					<text v-else class="search-idle-tag">推荐</text>
				</view>
				<view class="search-tags">
					<text class="search-tags-label">试试这些</text>
					<view class="search-tags-list">
						<text
							v-for="item in searchSuggestions"
							:key="item"
							:class="['search-tag-chip', normalizedSearchKeyword === item.toLowerCase() ? 'active' : '']"
							@click="applySearchKeyword(item)"
						>
							{{ item }}
						</text>
					</view>
				</view>
			</view>
		</view>
		<!-- 2. 中间点单区域 -->
		<view class="main-content">

			<!-- 左侧分类导航 -->
			<scroll-view scroll-y class="left-nav" :scroll-into-view="'nav-' + activeCategory">
				<view v-for="cat in visibleCategories" :key="cat.id" :id="'nav-' + cat.id"
					:class="['nav-item', activeCategory === cat.id ? 'active' : '']" @click="scrollToCategory(cat.id)">
					<view v-if="activeCategory === cat.id" class="active-bar"></view>
					<text class="nav-icon">{{ cat.icon }}</text>
					<text class="nav-name">{{ cat.name }}</text>
				</view>
				<view v-if="!visibleCategories.length" class="nav-empty">无结果</view>
				<!-- 底部占位 -->
				<view style="height: 100rpx;"></view>
			</scroll-view>

			<!-- 右侧商品列表 -->
			<scroll-view scroll-y class="right-content" :scroll-into-view="rightScrollIntoView" @scroll="handleScroll"
				scroll-with-animation>
				<!-- 广告 Banner -->
				<view v-if="!hasSearchKeyword" class="banner-wrapper">
					<image class="banner-img" :src="orderPageBannerImage" mode="aspectFill"></image>
					<text class="banner-text">{{ orderPageBannerText }}</text>
				</view>
				<view v-else class="search-summary">
					<text class="search-summary-text">共找到 {{ matchedProductCount }} 款相关商品</text>
					<text class="search-summary-clear" @click="clearSearch">清空搜索</text>
				</view>

				<!-- 商品分类区块 -->
				<view v-for="cat in visibleCategories" :key="cat.id" :id="'category-' + cat.id" class="category-section">
					<view class="category-title">{{ cat.name }}</view>

					<view v-for="product in getProductsByCategory(cat.id)" :key="product.id" class="product-item">
						<!-- 商品图 -->
						<view class="product-img-box">
							<image :src="product.image" class="product-img" mode="aspectFill"></image>
							<view v-if="product.tag" class="tag">{{ product.tag }}</view>
						</view>

						<!-- 商品信息 -->
						<view class="product-info">
							<view>
								<text class="product-name">{{ product.name }}</text>
								<text class="product-desc">{{ product.desc }}</text>
							</view>

							<view class="price-action">
								<text class="price">¥{{ product.price }}</text>

								<!-- 加减购按钮 -->
								<view class="action-btn">
									<view class="spec-btn theme-bg" @click.stop="openSpecPopup(product)">
										<text class="spec-btn-text">选规格</text>
										<view v-if="getProductCount(product.id)" class="spec-badge">
											{{ getProductCount(product.id) }}
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view v-if="!visibleCategories.length" class="search-empty">
					<text class="search-empty-title">没有找到相关商品</text>
					<text class="search-empty-desc">换个关键词试试，比如奶茶、果茶、珍珠。</text>
				</view>

				<!-- 底部垫高: 购物车高度 + TabBar高度 -->
				<view style="height: 280rpx;"></view>
			</scroll-view>
		</view>

		<!-- 3. 底部购物车栏：有加购时才显示 -->
		<view v-if="totalCount > 0" class="cart-bar-wrapper">
			<view class="cart-bar">
				<view class="cart-icon-wrapper" @click="toggleCartDetail">
					<view class="cart-icon theme-bg">
						<image src="/static/cart.png" class="cart-icon-img" mode="aspectFit"></image>
					</view>
					<view class="total-badge">{{ totalCount }}</view>
				</view>

				<view class="cart-price">
					<text class="total-price">¥{{ totalPrice }}</text>
				</view>

				<button class="pay-btn theme-bg" @click="checkout">去结算</button>
			</view>
		</view>

		<CustomTabBar current-path="/pages/order/order" />

		<!-- 购物车详情弹窗 -->
		<!-- <transition name="slide-up">
      <view v-if="showCartDetail && totalCount > 0" class="mask" @click="showCartDetail = false"
        @touchmove.stop.prevent>
        <view class="cart-popup" @click.stop>
          <view class="cart-header">
            <text class="title">购物车</text>
            <text class="clear-btn" @click="clearCart">🗑 清空</text>
          </view>
          <scroll-view scroll-y class="cart-list">
            <view v-for="(count, pid) in cart" :key="pid" class="cart-item">
              <view class="cart-item-info">
                <text class="name">{{ getProductById(pid).name }}</text>
                <text class="price">¥{{ getProductById(pid).price * count }}</text>
              </view>
              <view class="action-btn">
                <view class="btn-circle outline small" @click="updateCart(pid, -1)">-</view>
                <text class="count-num">{{ count }}</text>
                <view class="btn-circle theme-bg small" @click="updateCart(pid, 1)">+</view>
              </view>
            </view>
          </scroll-view>
          <view class="safe-area-inset"></view>
        </view>
      </view>
    </transition> -->
		<cartPopup :show="showCartDetail" :items="cart" :getProduct="getProductById" @update:show="setShowCartDetail"
			@update="updateCart" @clear="clearCart" />

		<ProductDetailPopup ref="detailPopup" @confirm="onAddToCart" />

	</view>
</template>

<script setup>
import {
	ref,
	computed,
	onMounted,
	onUnmounted,
	getCurrentInstance,
	nextTick,
	watch
} from 'vue';
import { onShow } from '@dcloudio/uni-app';
import orderHeader from './components/orderHeader.vue';
import categoryNav from './components/categoryNav.vue';
import productList from './components/productList.vue';
import cartBar from './components/cartBar.vue';
import cartPopup from './components/cartPopup.vue';
import ProductDetailPopup from './components/ProductDetailPopup.vue';
import CustomTabBar from '@/components/custom-tab-bar.vue';
import { fetchCategories as apiFetchCategories, fetchProducts as apiFetchProducts } from '@/common/api/product.js';
import { fetchSiteConfig, fetchStoreDistance } from '@/common/api/site.js';
import { buildCartKey, formatSpecText, normalizeOrderSpecs } from '@/common/utils/order-spec.js';

// --- 数据定义 ---
const activeCategory = ref(1);
const rightScrollIntoView = ref('');
const cart = ref({});
const showCartDetail = ref(false);
const isClickScrolling = ref(false);
const rightScrollTop = ref(0);
const rightViewportHeight = ref(0);
const categoryPositions = ref([]); // 右侧每个分类在滚动容器中的位置

const categories = ref([]);
const products = ref([]);
const searchKeyword = ref('');
const orderType = ref('pickup');
const searchSuggestions = ['奶茶', '果茶', '珍珠', '少糖'];
const storeInfo = ref({
	storeName: '贵港平南中心购物广场店',
	storeAddress: '',
	pickupDistanceText: '距离您 3km · 步行约 15 分钟',
	deliveryAddressText: '请选择收货地址 >',
	deliveryStoreLine: '⇄ 贵港平南中心购物广场店 ｜ 送出外卖',
	storeSlogan: 'new style tea, by inspiration >',
});
const orderPageBannerImage = ref('https://dummyimage.com/750x280/f3f4f6/9ca3af&text=Order+Banner');
const orderPageBannerText = ref('当季 · 多肉葡萄');

// --- 计算属性 ---
const isProductOnSale = (product) => {
	if (product?.status === undefined || product?.status === null) return true;
	if (typeof product.status === 'number') return product.status === 1;
	const status = String(product.status).toLowerCase();
	return status === '1' || status === 'on' || status === 'onsale' || status === 'on_sale' || status === 'active';
};

const normalizedSearchKeyword = computed(() => searchKeyword.value.trim().toLowerCase());
const hasSearchKeyword = computed(() => Boolean(normalizedSearchKeyword.value));
const searchableProducts = computed(() =>
	products.value.filter((product) => isProductOnSale(product)),
);
const productMatchesKeyword = (product, keyword) => {
	if (!keyword) return true;
	const text = [product?.name, product?.desc, product?.tag]
		.map((item) => String(item || '').toLowerCase())
		.join(' ');
	return text.includes(keyword);
};
const visibleProducts = computed(() => {
	const keyword = normalizedSearchKeyword.value;
	return searchableProducts.value.filter((product) => productMatchesKeyword(product, keyword));
});
const visibleCategoryIds = computed(() => new Set(visibleProducts.value.map((product) => product.category_id)));
const visibleCategories = computed(() =>
	categories.value.filter((category) => visibleCategoryIds.value.has(category.id)),
);
const matchedProductCount = computed(() => visibleProducts.value.length);

const getProductsByCategory = (catId) =>
	visibleProducts.value.filter((p) => p.category_id === catId);
const getProductById = (pid) => products.value.find(p => p.id == pid);

const totalCount = computed(() => {
	return Object.values(cart.value).reduce((sum, item) => {
		return sum + (item?.count || 0);
	}, 0);
});

const totalPrice = computed(() => {
	return Object.values(cart.value).reduce((total, item) => {
		if (!item) return total;
		const p = getProductById(item.id);
		return total + (p ? p.price * (item.count || 0) : 0);
	}, 0);
});

const getCategoryCount = (catId) => {
	const catProducts = getProductsByCategory(catId);
	const ids = catProducts.map(p => p.id);
	let count = 0;
	Object.values(cart.value).forEach((item) => {
		if (item && ids.includes(item.id)) {
			count += (item.count || 0);
		}
	});
	return count;
};

const getProductCount = (productId) => {
	let total = 0;
	Object.values(cart.value).forEach((item) => {
		if (item && item.id === productId) {
			total += (item.count || 0);
		}
	});
	return total;
};

// --- 方法 ---
const updateCart = (keyOrProductId, delta) => {
	// 1. 优先按 key 精确匹配（来自购物车弹窗）
	const itemByKey = cart.value[keyOrProductId];
	if (itemByKey) {
		const next = (itemByKey.count || 0) + delta;
		if (next <= 0) {
			delete cart.value[keyOrProductId];
		} else {
			cart.value[keyOrProductId] = {
				...itemByKey,
				count: next,
			};
		}
		return;
	}

	// 2. 按商品 id 聚合匹配（来自商品列表减号）
	const entries = Object.entries(cart.value).filter(
		([, item]) => item && item.id === keyOrProductId,
	);
	if (!entries.length) return;
	const [targetKey, item] = entries[0];
	const next = (item.count || 0) + delta;
	if (next <= 0) {
		delete cart.value[targetKey];
	} else {
		cart.value[targetKey] = {
			...item,
			count: next,
		};
	}
};

const clearCart = () => {
	cart.value = {};
	showCartDetail.value = false;
};

const toggleCartDetail = () => {
	if (totalCount.value > 0) showCartDetail.value = !showCartDetail.value;
};
const setShowCartDetail = (v) => {
	showCartDetail.value = !!v;
};

const clearSearch = () => {
	searchKeyword.value = '';
};

const applySearchKeyword = (keyword) => {
	searchKeyword.value = String(keyword || '').trim();
};

const scrollToCategory = (catId) => {
	activeCategory.value = catId;
	rightScrollIntoView.value = 'category-' + catId;
	isClickScrolling.value = true;
	setTimeout(() => {
		isClickScrolling.value = false;
	}, 400);
};

const handleScroll = (e) => {
	rightScrollTop.value = e.detail.scrollTop || 0;
	if (isClickScrolling.value) return;
	const scrollTop = rightScrollTop.value;
	if (!categoryPositions.value.length) return;
	const activationOffset = Math.max(80, rightViewportHeight.value * 0.25);

	// 从下往上找，找到当前滚动位置对应的分类
	for (let i = categoryPositions.value.length - 1; i >= 0; i--) {
		const item = categoryPositions.value[i];
		// 给一点阈值，避免来回抖动
		if (scrollTop + activationOffset >= item.top) {
			if (activeCategory.value !== item.id) {
				activeCategory.value = item.id;
			}
			break;

		}
	}
};

const checkout = () => {

	if (totalCount.value === 0) return;
	// 将购物车转为结算页需要的格式 { items: [{ id, name, price, image, count, spec }, ...] }

	// === 【结合 4.2.1 的鉴权拦截】 ===
	const token = uni.getStorageSync('token');
	if (!token) {
		uni.showToast({ title: '请先登录后再结算', icon: 'none' });
		setTimeout(() => {
			uni.navigateTo({ url: '/pages/login/login' });
		}, 500);
		return;
	}

	const items = [];
	Object.values(cart.value).forEach((item) => {
		if (!item || !item.count) return;
		const p = getProductById(item.id);
		if (!p) return;
		const spec = formatSpecText(item.specs || {});
		items.push({
			id: p.id,
			name: p.name,
			price: p.price,
			image: p.image || '',
			count: item.count,
			spec,
		});
	});
	if (items.length === 0) {
		uni.showToast({ title: '购物车为空', icon: 'none' });
		return;
	}
	uni.setStorageSync('checkoutOrder', {
		items,
		orderType: orderType.value,
		storeInfo: {
			storeName: storeInfo.value.storeName || '',
			storeAddress: storeInfo.value.storeAddress || '',
			pickupDistanceText: storeInfo.value.pickupDistanceText || '',
			deliveryAddressText: storeInfo.value.deliveryAddressText || '',
			deliveryStoreLine: storeInfo.value.deliveryStoreLine || '',
			storeSlogan: storeInfo.value.storeSlogan || '',
		},
	});
	uni.navigateTo({ url: '/pages/checkout/checkout' });
};

// 计算右侧每个分类块在滚动容器内的偏移，用于联动左侧导航
const fetchCategories = () => {
	return apiFetchCategories().then((list) => {
		const arr = list || [];
		categories.value = arr;
		if (arr.length > 0) {
			activeCategory.value = arr[0].id;
		}
	});
};

const fetchProducts = () => {
	return apiFetchProducts().then((list) => {
		products.value = list || [];
	});
};

const fetchSiteDisplayConfig = () => {
	return fetchSiteConfig().then((cfg) => {
		if (!cfg) return;
		storeInfo.value = {
			storeName: cfg.storeName || storeInfo.value.storeName,
			storeAddress: cfg.storeAddress || storeInfo.value.storeAddress,
			pickupDistanceText: cfg.pickupDistanceText || storeInfo.value.pickupDistanceText,
			deliveryAddressText: cfg.deliveryAddressText || cfg.storeAddress || storeInfo.value.deliveryAddressText,
			deliveryStoreLine: cfg.deliveryStoreLine || storeInfo.value.deliveryStoreLine,
			storeSlogan: cfg.storeSlogan || storeInfo.value.storeSlogan,
		};
		orderPageBannerImage.value = cfg.orderPageBanner || orderPageBannerImage.value;
		orderPageBannerText.value = cfg.orderPageBannerText || orderPageBannerText.value;
	});
};

const updateStoreDistanceByLocation = async () => {
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
			storeInfo.value.pickupDistanceText = distance.distanceText;
		}
	} catch (_) {
		// 用户拒绝定位或定位失败时，保留后台配置文案
	}
};

const calcCategoryPositions = () => {
	const instance = getCurrentInstance();
	if (!instance) return;

	nextTick(() => {
		const query = uni.createSelectorQuery().in(instance.proxy);

		// 先获取右侧 scroll-view 本身的位置
		query.select('.right-content').boundingClientRect();
		// 再获取每个分类 section 的位置
		query.selectAll('.category-section').boundingClientRect();

		query.exec((res) => {
			const rightRect = res[0];
			const rects = res[1] || [];
			if (!rightRect || !rects.length) return;
			rightViewportHeight.value = rightRect.height || 0;

			categoryPositions.value = rects.map((rect, index) => ({
				id: visibleCategories.value[index]?.id,
				// 记录相对 scroll-view 顶部的偏移
				top: rect.top - rightRect.top + rightScrollTop.value,
			})).filter(item => item.id);
		});
	});
};

watch(
	() => ({
		keyword: normalizedSearchKeyword.value,
		categoryIds: visibleCategories.value.map((category) => category.id).join(','),
	}),
	({ keyword }) => {
		const nextCategories = visibleCategories.value;
		if (!nextCategories.length) {
			activeCategory.value = 0;
			rightScrollIntoView.value = '';
			categoryPositions.value = [];
			return;
		}

		if (!nextCategories.some((category) => category.id === activeCategory.value)) {
			activeCategory.value = nextCategories[0].id;
		}

		nextTick(() => {
			calcCategoryPositions();
			if (keyword) {
				rightScrollIntoView.value = '';
				nextTick(() => {
					rightScrollIntoView.value = 'category-' + nextCategories[0].id;
				});
			}
		});
	},
	{ immediate: true },
);

onMounted(async () => {
	await fetchCategories();
	await fetchProducts();
	await fetchSiteDisplayConfig();
	await updateStoreDistanceByLocation();
	calcCategoryPositions();
	uni.$on('openSpec', onOpenSpecFromHome);
	nextTick(processPendingOpenSpec);
});
onUnmounted(() => {
	uni.$off('openSpec', onOpenSpecFromHome);
});

onShow(() => {
	nextTick(processPendingOpenSpec);
	if (uni.getStorageSync('justPaid')) {
		cart.value = {};
		showCartDetail.value = false;
		uni.removeStorageSync('justPaid');

		const lastOrder = uni.getStorageSync('lastPaidOrder');
		if (lastOrder) {
			uni.showToast({
				title: `订单 ¥${lastOrder.totalPrice} 已支付`,
				icon: 'success',
				duration: 2000,
			});
			uni.removeStorageSync('lastPaidOrder');
		}
	}
});

// 首页推荐位点击后跳转过来，打开对应商品的规格弹窗
const onOpenSpecFromHome = ({ productId }) => {
	const product = getProductById(productId);
	if (product) openSpecPopup(product);
};

const processPendingOpenSpec = () => {
	const productId = uni.getStorageSync('pendingOpenSpecProductId');
	if (!productId) return;
	const product = getProductById(productId);
	if (!product) return;
	uni.removeStorageSync('pendingOpenSpecProductId');
	openSpecPopup(product);
};


const detailPopup = ref(null);

// 规格步骤条选项（订单进度）
const stepOptions = [
	{ title: '已下单' },
	{ title: '制作中' },
	{ title: '待取杯' },
	{ title: '已完成' },
];
const orderList = ref([
	{ id: 'TEA123456', statusText: '制作中', step: 1 },
]);

// 点击商品加号：打开规格弹窗
const openSpecPopup = (product) => {
	detailPopup.value?.open(product);
};

// 确认加入购物车（来自规格弹窗）
const onAddToCart = (data) => {
	const normalizedSpecs = normalizeOrderSpecs(data.specs || {});
	const key = buildCartKey(data.id, normalizedSpecs);
	const existing = cart.value[key];
	const addCount = Math.max(1, Number(data.count || 1));
	const nextCount = (existing?.count || 0) + addCount;
	cart.value[key] = {
		id: data.id,
		specs: normalizedSpecs,
		count: nextCount,
	};
};
</script>

<style lang="scss" scoped>
/* --- 变量定义 (必须写在最前面) --- */
$theme-color: #023993;

/* 基础容器 */
.container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: #f5f5f5;
	color: #334;
}

/* 1. 顶部 Header */
.header {
	background-color: #fff;
	padding: 20rpx 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	z-index: 10;
}

.header-top {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.shop-name {
	font-size: 34rpx;
	font-weight: bold;
}

.distance {
	font-size: 24rpx;
	color: #999;
	margin-top: 8rpx;
	display: block;
}

.toggle-btn {
	display: flex;
	background-color: #f5f5f5;
	border-radius: 30rpx;
	padding: 4rpx;
}

.toggle-btn .btn {
	padding: 6rpx 24rpx;
	font-size: 24rpx;
	border-radius: 26rpx;
	color: #666;
}

/* 使用变量 */
.toggle-btn .btn.active {
	background-color: $theme-color;
	color: #fff;
}

.notice {
	margin-top: 20rpx;
	background-color: #f0f6ff;
	/* 浅蓝色背景适配主题色 */
	padding: 10rpx 20rpx;
	border-radius: 8rpx;
	display: flex;
	align-items: center;
}

/* 使用变量 */
.notice-tag {
	background-color: $theme-color;
	color: #fff;
	font-size: 20rpx;
	padding: 2rpx 8rpx;
	border-radius: 4rpx;
	margin-right: 10rpx;
}

.notice-text {
	font-size: 24rpx;
	color: #666;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.search-bar {
	padding: 18rpx 20rpx 14rpx;
	background: linear-gradient(180deg, rgba(2, 57, 147, 0.08) 0%, rgba(245, 245, 245, 0) 100%);
}

.search-panel {
	padding: 24rpx;
	border-radius: 28rpx;
	background: linear-gradient(145deg, #eef4ff 0%, #ffffff 72%);
	border: 1rpx solid rgba(2, 57, 147, 0.08);
	box-shadow: 0 14rpx 32rpx rgba(2, 57, 147, 0.08);
}

.search-copy {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.search-kicker {
	font-size: 20rpx;
	font-weight: 700;
	letter-spacing: 2rpx;
	color: $theme-color;
}

.search-title {
	font-size: 34rpx;
	font-weight: 700;
	line-height: 1.35;
	color: #1b3567;
}

.search-hint {
	font-size: 23rpx;
	line-height: 1.6;
	color: #70809d;
}

.search-box {
	margin-top: 22rpx;
	min-height: 92rpx;
	padding: 10rpx 12rpx 10rpx 14rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.9);
	border: 2rpx solid rgba(2, 57, 147, 0.1);
	display: flex;
	align-items: center;
	box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.85);
}

.search-box.active {
	border-color: rgba(2, 57, 147, 0.24);
	box-shadow: 0 10rpx 24rpx rgba(2, 57, 147, 0.1);
}

.search-icon-wrap {
	width: 68rpx;
	height: 68rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, $theme-color 0%, #2f6be0 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.search-icon {
	color: #fff;
	font-size: 24rpx;
	font-weight: 700;
	letter-spacing: 2rpx;
}

.search-input {
	flex: 1;
	height: 72rpx;
	min-width: 0;
	margin: 0 16rpx;
	font-size: 28rpx;
	color: #1e3a6f;
	background: transparent;
}

.search-clear,
.search-idle-tag {
	flex-shrink: 0;
	min-width: 92rpx;
	height: 56rpx;
	line-height: 56rpx;
	padding: 0 24rpx;
	border-radius: 999rpx;
	text-align: center;
	font-size: 22rpx;
}

.search-clear {
	background: rgba(2, 57, 147, 0.1);
	color: $theme-color;
	font-weight: 600;
}

.search-idle-tag {
	background: #eff4ff;
	color: #6e7ea1;
}

.search-tags {
	margin-top: 18rpx;
	display: flex;
	align-items: center;
	gap: 16rpx;
	flex-wrap: wrap;
}

.search-tags-label {
	font-size: 22rpx;
	color: #6e7b96;
	flex-shrink: 0;
}

.search-tags-list {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.search-tag-chip {
	padding: 10rpx 20rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.92);
	border: 1rpx solid rgba(2, 57, 147, 0.1);
	color: #355286;
	font-size: 22rpx;
}

.search-tag-chip.active {
	background: $theme-color;
	border-color: $theme-color;
	color: #fff;
	box-shadow: 0 8rpx 18rpx rgba(2, 57, 147, 0.2);
}

/* 2. 中间内容区 */
.main-content {
	flex: 1;
	display: flex;
	overflow: hidden;
}

/* 左侧导航 */
.left-nav {
	width: 180rpx;
	background-color: #f8f8f8;
	height: 100%;
}

.nav-item {
	height: 140rpx;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	font-size: 24rpx;
	color: #666;
	position: relative;
}

/* 使用变量 */
.nav-item.active {
	background-color: #fff;
	color: $theme-color;
	font-weight: bold;
}

/* 使用变量 */
.active-bar {
	position: absolute;
	left: 0;
	top: 40rpx;
	bottom: 40rpx;
	width: 8rpx;
	background-color: $theme-color;
	border-radius: 0 4rpx 4rpx 0;
}

.nav-icon {
	font-size: 36rpx;
	margin-bottom: 8rpx;
}

.nav-empty {
	margin-top: 36rpx;
	font-size: 22rpx;
	color: #98a2b3;
	text-align: center;
}

.badge {
	position: absolute;
	top: 10rpx;
	right: 10rpx;
	background-color: #ff4d4f;
	color: #fff;
	font-size: 20rpx;
	width: 32rpx;
	height: 32rpx;
	border-radius: 50%;
	text-align: center;
	line-height: 32rpx;
}

/* 右侧内容 */
.right-content {
	flex: 1;
	background-color: #fff;
	height: 100%;
}

.banner-wrapper {
	padding: 20rpx;
	position: relative;
}

.banner-img {
	width: 100%;
	height: 240rpx;
	border-radius: 12rpx;
	background-color: #eee;
}

.banner-text {
	position: absolute;
	left: 30rpx;
	bottom: 30rpx;
	color: #fff;
	font-weight: bold;
	font-size: 28rpx;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.search-summary {
	margin: 20rpx;
	padding: 22rpx 24rpx;
	border-radius: 20rpx;
	background: linear-gradient(135deg, rgba(2, 57, 147, 0.1) 0%, rgba(255, 255, 255, 0.96) 100%);
	border: 1rpx solid rgba(2, 57, 147, 0.1);
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 18rpx;
	box-shadow: 0 10rpx 24rpx rgba(2, 57, 147, 0.06);
}

.search-summary-text {
	font-size: 24rpx;
	font-weight: 600;
	color: #22427d;
}

.search-summary-clear {
	flex-shrink: 0;
	padding: 10rpx 20rpx;
	border-radius: 999rpx;
	background: #fff;
	color: $theme-color;
	font-size: 22rpx;
	box-shadow: 0 8rpx 18rpx rgba(2, 57, 147, 0.08);
}

.category-section {
	padding-bottom: 20rpx;
}

.category-title {
	padding: 20rpx 30rpx;
	font-size: 28rpx;
	font-weight: bold;
	background-color: #fff;
}

.product-item {
	display: flex;
	padding: 20rpx 30rpx;
}

.product-img-box {
	width: 180rpx;
	height: 180rpx;
	margin-right: 20rpx;
	position: relative;
}

.product-img {
	width: 100%;
	height: 100%;
	border-radius: 12rpx;
	background-color: #f5f5f5;
}

.tag {
	position: absolute;
	top: 0;
	left: 0;
	background-color: #ffc107;
	font-size: 20rpx;
	padding: 4rpx 10rpx;
	border-bottom-right-radius: 12rpx;
	font-weight: bold;
}

.product-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.product-name {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
}

.product-desc {
	font-size: 22rpx;
	color: #999;
	margin-top: 10rpx;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
}

.search-empty {
	margin: 36rpx 20rpx 0;
	padding: 56rpx 32rpx;
	border-radius: 24rpx;
	text-align: center;
	background: linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%);
	border: 1rpx solid rgba(2, 57, 147, 0.08);
	box-shadow: 0 16rpx 32rpx rgba(2, 57, 147, 0.08);
}

.search-empty-title {
	display: block;
	font-size: 30rpx;
	font-weight: 700;
	color: #173467;
}

.search-empty-desc {
	display: block;
	margin-top: 12rpx;
	font-size: 24rpx;
	line-height: 1.7;
	color: #7b88a1;
}

.price-action {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.price {
	font-size: 34rpx;
	font-weight: bold;
	color: #333;
}

.action-btn {
	display: flex;
	align-items: center;
}

.spec-btn {
	position: relative;
	min-width: 140rpx;
	height: 64rpx;
	padding: 0;
	border-radius: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 26rpx;
	color: #fff;
}

/* 使用变量：与主题色保持一致 */
.spec-btn.theme-bg {
	background-color: $theme-color;
	color: #fff;
}

.spec-btn-text {
	font-size: 26rpx;
}

.spec-badge {
	position: absolute;
	top: -10rpx;
	right: -10rpx;
	width: 36rpx;
	height: 36rpx;
	border-radius: 50%;
	background-color: $theme-color;
	color: #fff;
	font-size: 22rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.btn-circle {
	width: 48rpx;
	height: 48rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 36rpx;
	padding-bottom: 4rpx;
}

/* 使用变量 */
.btn-circle.theme-bg {
	background-color: $theme-color;
	color: #fff;
}

.btn-circle.outline {
	border: 1px solid #ddd;
	color: #666;
	background-color: #fff;
}

.count-num {
	margin: 0 20rpx;
	font-size: 28rpx;
	font-weight: bold;
}

/* 3. 悬浮购物车栏：紧贴自定义 TabBar 上方 */
.cart-bar-wrapper {
	position: fixed;
	left: 0;
	right: 0;
	bottom: calc(100rpx + constant(safe-area-inset-bottom));
	bottom: calc(100rpx + env(safe-area-inset-bottom));
	z-index: 100;
	background-color: transparent;
	pointer-events: none;
}

.cart-bar {
	pointer-events: auto;
	height: 100rpx;
	display: flex;
	align-items: center;
	padding: 0 30rpx;
	// margin: 0 20rpx;
	background-color: #fff;
	// border-radius: 50rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
	position: relative;
}

.cart-icon-wrapper {
	position: relative;
	margin-right: 20rpx;
}

.cart-icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
}

.cart-icon-img {
	width: 100%;
	height: 100%;
	display: block;
	object-fit: cover;
	padding: 10rpx;
}

.total-badge {
	position: absolute;
	left: 50%;
	top: 60%;
	transform: translate(-50%, -50%);
	color: $theme-color;
	font-size: 28rpx;
	font-weight: bold;
}

.cart-price {
	flex: 1;
}

.total-price {
	font-size: 36rpx;
	font-weight: bold;
}

.empty-text {
	font-size: 24rpx;
	color: #999;
}

.pay-btn {
	border-radius: 40rpx;
	font-size: 28rpx;
	padding: 0 40rpx;
	height: 64rpx;
	line-height: 64rpx;
	margin: 0;
}

/* 使用变量 */
.pay-btn.theme-bg {
	background-color: $theme-color;
	color: #fff;
}

.pay-btn.disabled {
	background-color: #ccc;
	color: #fff;
}

/* 底部 TabBar 已使用 components/custom-tab-bar.vue，不再在此写样式 */

/* 购物车弹窗 */
.mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 80;
}

.cart-popup {
	position: absolute;
	bottom: 0px;
	left: 0;
	right: 0;
	background-color: #fff;
	border-radius: 20rpx 20rpx 0 0;
	padding: 30rpx 30rpx 100rpx;
	box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.cart-header {
	display: flex;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.cart-header .title {
	font-weight: bold;
	font-size: 30rpx;
}

.cart-header .clear-btn {
	font-size: 24rpx;
	color: #999;
}

.cart-list {
	max-height: 500rpx;
}

.cart-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f5f5f5;
}

.cart-item-info .name {
	font-size: 28rpx;
	font-weight: bold;
	display: block;
}

.cart-item-info .price {
	font-size: 28rpx;
	font-weight: bold;
	margin-top: 6rpx;
	display: block;
}

.btn-circle.small {
	width: 40rpx;
	height: 40rpx;
	font-size: 30rpx;
}
</style>
