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
									<view v-if="cart[product.id]" class="btn-circle outline"
										@click.stop="updateCart(product.id, -1)">-
									</view>
									<text v-if="cart[product.id]" class="count-num">{{ cart[product.id] }}</text>
									<view class="btn-circle theme-bg" @click.stop="openSpecPopup(product)">+</view>
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

	// --- 数据定义 ---
	const activeCategory = ref(1);
	const rightScrollIntoView = ref('');
	const cart = ref({});
	const showCartDetail = ref(false);
	const categoryPositions = ref([]); // 右侧每个分类在滚动容器中的位置

	const categories = [{
			id: 1,
			name: '当季限定',
			icon: '🌟'
		},
		{
			id: 2,
			name: '人气必喝',
			icon: '🔥'
		},
		{
			id: 3,
			name: '清爽果茶',
			icon: '🍇'
		},
		{
			id: 4,
			name: '浓郁奶茶',
			icon: '🥤'
		},
		{
			id: 5,
			name: '纯茶系列',
			icon: '🍵'
		},
		{
			id: 6,
			name: '热麦面包',
			icon: '🥯'
		},
	];

	const products = [{
			id: 101,
			categoryId: 1,
			name: '多肉葡萄冻',
			price: 29,
			desc: '鲜剥葡萄肉，搭配清新绿茶底',
			image: '',
			tag: '人气TOP'
		},
		{
			id: 102,
			categoryId: 1,
			name: '酷黑莓桑',
			price: 19,
			desc: '桑葚与草莓的奇妙碰撞',
			image: '',
			tag: '新品'
		},
		{
			id: 201,
			categoryId: 2,
			name: '烤黑糖波波牛乳',
			price: 21,
			desc: '焦香黑糖，Q弹波波',
			image: '',
			tag: '推荐'
		},
		{
			id: 202,
			categoryId: 2,
			name: '芝芝莓莓',
			price: 28,
			desc: '精选草莓，搭配浓郁芝士奶盖',
			image: '',
			tag: null
		},
		{
			id: 301,
			categoryId: 3,
			name: '满杯红柚',
			price: 23,
			desc: '满满红柚果肉，清新解腻',
			image: '',
			tag: null
		},
		{
			id: 401,
			categoryId: 4,
			name: '雪山纯奶',
			price: 18,
			desc: '纯净高原奶源',
			image: '',
			tag: null
		},
		{
			id: 501,
			categoryId: 5,
			name: '金凤茶王',
			price: 16,
			desc: '独家定制乌龙茶底',
			image: '',
			tag: null
		},
	];

	// --- 计算属性 ---
	const getProductsByCategory = (catId) => products.filter(p => p.categoryId === catId);
	const getProductById = (pid) => products.find(p => p.id == pid);

	const totalCount = computed(() => Object.values(cart.value).reduce((a, b) => a + b, 0));
	const totalPrice = computed(() => {
		return Object.entries(cart.value).reduce((total, [pid, count]) => {
			const p = getProductById(pid);
			return total + (p ? p.price * count : 0);
		}, 0);
	});

	const getCategoryCount = (catId) => {
		const catProducts = getProductsByCategory(catId);
		let count = 0;
		catProducts.forEach(p => {
			if (cart.value[p.id]) count += cart.value[p.id];
		});
		return count;
	};

	// --- 方法 ---
	const updateCart = (productId, delta) => {
		const current = cart.value[productId] || 0;
		const next = current + delta;
		if (next <= 0) {
			delete cart.value[productId]; // Vue 3 reactivity handles this
		} else {
			cart.value[productId] = next;
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
	};

	const handleScroll = (e) => {
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

	onMounted(() => {
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
		updateCart(data.id, 1);
	};
</script>

<!-- 在这里引入外部样式，注意加上 lang="scss" -->
<style lang="scss">
	@import "@/assets/order.scss";
</style>