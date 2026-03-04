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
		<orderHeader />
		<!-- 2. 中间点单区域 -->
		<view class="main-content">

			<!-- 左侧分类导航 -->
			<scroll-view scroll-y class="left-nav" :scroll-into-view="'nav-' + activeCategory">
				<view v-for="cat in categories" :key="cat.id" :id="'nav-' + cat.id"
					:class="['nav-item', activeCategory === cat.id ? 'active' : '']" @click="scrollToCategory(cat.id)">
					<view v-if="activeCategory === cat.id" class="active-bar"></view>
					<text class="nav-icon">{{ cat.icon }}</text>
					<text class="nav-name">{{ cat.name }}</text>
				</view>
				<!-- 底部占位 -->
				<view style="height: 100rpx;"></view>
			</scroll-view>

			<!-- 右侧商品列表 -->
			<scroll-view scroll-y class="right-content" :scroll-into-view="rightScrollIntoView" @scroll="handleScroll"
				scroll-with-animation>
				<!-- 广告 Banner -->
				<view class="banner-wrapper">
					<!-- src留空，后续请填入您的图片链接 -->
					<image class="banner-img" src="" mode="aspectFill"></image>
					<text class="banner-text">当季 · 多肉葡萄</text>
				</view>

				<!-- 商品分类区块 -->
				<view v-for="cat in categories" :key="cat.id" :id="'category-' + cat.id" class="category-section">
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
									<view
										class="spec-btn theme-bg"
										@click.stop="openSpecPopup(product)"
									>
										<text class="spec-btn-text">选规格</text>
										<view
											v-if="getProductCount(product.id)"
											class="spec-badge"
										>
											{{ getProductCount(product.id) }}
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
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
		<cartPopup :show="showCartDetail" :items="cart" :getProduct="getProductById"
			@update:show="setShowCartDetail" @update="updateCart" @clear="clearCart" />

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
		nextTick
	} from 'vue';
	import orderHeader from './components/orderHeader.vue';
	import categoryNav from './components/categoryNav.vue';
	import productList from './components/productList.vue';
	import cartBar from './components/cartBar.vue';
	import cartPopup from './components/cartPopup.vue';
	import ProductDetailPopup from './components/ProductDetailPopup.vue';
	import CustomTabBar from '@/components/custom-tab-bar.vue';

	const API_BASE = 'http://localhost:3000'; // 后端接口地址

	// --- 数据定义 ---
	const activeCategory = ref(1);
	const rightScrollIntoView = ref('');
	const cart = ref({});
	const showCartDetail = ref(false);
	const categoryPositions = ref([]); // 右侧每个分类在滚动容器中的位置
	const isClickScrolling = ref(false); // 标记是否为点击左侧分类触发的滚动

	const categories = ref([]);
	const products = ref([]);

	// --- 计算属性 ---
	const getProductsByCategory = (catId) => products.value.filter(p => p.category_id === catId);
	const getProductById = (pid) => products.value.find(p => p.id == pid);

	const buildCartKey = (id, specs = {}) => {
		return `${id}__${specs.sweet || ''}__${specs.ice || ''}`;
	};

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

	const scrollToCategory = (catId) => {
		activeCategory.value = catId;
		rightScrollIntoView.value = 'category-' + catId;
		isClickScrolling.value = true;
		setTimeout(() => {
			isClickScrolling.value = false;
		}, 400);
	};

	const handleScroll = (e) => {
		if (isClickScrolling.value) return;
		const scrollTop = e.detail.scrollTop || 0;
		if (!categoryPositions.value.length) return;

		// 从下往上找，找到当前滚动位置对应的分类
		for (let i = categoryPositions.value.length - 1; i >= 0; i--) {
			const item = categoryPositions.value[i];
			// 给一点阈值，避免来回抖动
			if (scrollTop + 10 >= item.top) {
				if (activeCategory.value !== item.id) {
					activeCategory.value = item.id;
				}
				break;
			}
		}
	};

	const checkout = () => {
		if (totalCount.value === 0) return;
		uni.showToast({
			title: '结算功能演示',
			icon: 'none'
		});
	};

	// 计算右侧每个分类块在滚动容器内的偏移，用于联动左侧导航
	const fetchCategories = () => {
		return new Promise((resolve, reject) => {
			uni.request({
				url: `${API_BASE}/api/categories`,
				success: (res) => {
					const list = res.data || [];
					categories.value = list;
					if (list.length > 0) {
						activeCategory.value = list[0].id;
					}
					resolve();
				},
				fail: reject,
			});
		});
	};

	const fetchProducts = () => {
		return new Promise((resolve, reject) => {
			uni.request({
				url: `${API_BASE}/api/products`,
				success: (res) => {
					products.value = res.data || [];
					resolve();
				},
				fail: reject,
			});
		});
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

				categoryPositions.value = rects.map((rect, index) => ({
					id: categories[index]?.id,
					// 记录相对 scroll-view 顶部的偏移
					top: rect.top - rightRect.top,
				})).filter(item => item.id);
			});
		});
	};

	onMounted(async () => {
		await fetchCategories();
		await fetchProducts();
		calcCategoryPositions();
		uni.$on('openSpec', onOpenSpecFromHome);
	});
	onUnmounted(() => {
		uni.$off('openSpec', onOpenSpecFromHome);
	});

	// 首页推荐位点击后跳转过来，打开对应商品的规格弹窗
	const onOpenSpecFromHome = ({ productId }) => {
		const product = getProductById(productId);
		if (product) openSpecPopup(product);
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
		const key = buildCartKey(data.id, data.specs || {});
		const existing = cart.value[key];
		const nextCount = (existing?.count || 0) + 1;
		cart.value[key] = {
			id: data.id,
			specs: data.specs || {},
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
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
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
  background-color: #f0f6ff; /* 浅蓝色背景适配主题色 */
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
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.3);
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
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.15);
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
  background-color: rgba(0,0,0,0.5);
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
  box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.1);
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