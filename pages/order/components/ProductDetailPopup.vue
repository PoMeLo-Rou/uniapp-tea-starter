<template>
	<view class="product-detail-popup-root">
		<uni-popup ref="popupRef" type="bottom" background-color="#fff" @maskClick="close">
			<view class="spec-container">
				<view class="spec-header">
					<text class="spec-title">{{ selectedProd.name }}</text>
				</view>

				<!-- 甜度（从接口 sweet 分组读取） -->
				<view v-if="sweetGroup" class="spec-group">
					<text class="label">{{ sweetGroup.groupName }}</text>
					<view class="tags">
						<view
							v-for="opt in sweetGroup.options"
							:key="'sweet-' + opt.id"
							:class="'spec-tag' + (currentSweetId === opt.id ? ' active' : '')"
							@click="setSweet(opt)"
						>
							<text>{{ opt.name }}</text>
						</view>
					</view>
				</view>

				<!-- 温度（冰 / 常温 / 热） -->
				<view v-if="tempGroup" class="spec-group">
					<text class="label">{{ tempGroup.groupName }}</text>
					<view class="tags">
						<view
							v-for="opt in tempGroup.options"
							:key="'temp-' + opt.id"
							:class="'spec-tag' + (currentTempId === opt.id ? ' active' : '')"
							@click="setTemp(opt)"
						>
							<text>{{ opt.name }}</text>
						</view>
					</view>
				</view>

				<!-- 冰度：只有当选择了“冰”(temp_cold) 时才显示 -->
				<view v-if="iceGroup && showIceGroup" class="spec-group">
					<text class="label">{{ iceGroup.groupName }}</text>
					<view class="tags">
						<view
							v-for="opt in iceGroup.options"
							:key="'ice-' + opt.id"
							:class="'spec-tag' + (currentIceId === opt.id ? ' active' : '')"
							@click="setIce(opt)"
						>
							<text>{{ opt.name }}</text>
						</view>
					</view>
				</view>

				<button class="confirm-btn" @click="addToCart">加入购物车</button>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { fetchProductSpecs } from '@/common/api/product.js';

const emit = defineEmits(['confirm']);

const popupRef = ref(null);
const selectedProd = reactive({ id: null, name: '', price: 0 });

// 后端返回的所有规格分组
const specGroups = ref([]);

// 当前选中的规格 id
const currentSweetId = ref(null);
const currentTempId = ref(null);
const currentIceId = ref(null);

// 分组快捷访问
const sweetGroup = computed(() =>
	specGroups.value.find((g) => g.groupCode === 'sweet') || null,
);
const tempGroup = computed(() =>
	specGroups.value.find((g) => g.groupCode === 'temp') || null,
);
const iceGroup = computed(() =>
	specGroups.value.find((g) => g.groupCode === 'ice') || null,
);

// 根据 id 找到当前选中的选项
const currentSweetOption = computed(() => {
	const g = sweetGroup.value;
	if (!g) return null;
	return g.options.find((o) => o.id === currentSweetId.value) || null;
});
const currentTempOption = computed(() => {
	const g = tempGroup.value;
	if (!g) return null;
	return g.options.find((o) => o.id === currentTempId.value) || null;
});
const currentIceOption = computed(() => {
	const g = iceGroup.value;
	if (!g) return null;
	return g.options.find((o) => o.id === currentIceId.value) || null;
});

// 是否显示冰度分组：当温度选择为“冰”(code === 'temp_cold') 时才显示
const showIceGroup = computed(() => {
	const temp = currentTempOption.value;
	if (!iceGroup.value || !temp) return false;
	return temp.code === 'temp_cold';
});

const setSweet = (opt) => {
	if (!opt) return;
	currentSweetId.value = opt.id;
};

const setTemp = (opt) => {
	if (!opt) return;
	currentTempId.value = opt.id;

	// 如果不是“冰”，则清空冰度选项并隐藏
	if (opt.code !== 'temp_cold') {
		currentIceId.value = null;
	} else if (iceGroup.value && iceGroup.value.options.length > 0 && !currentIceId.value) {
		// 重新切回“冰”时，如果还没选冰度，默认第一个
		currentIceId.value = iceGroup.value.options[0].id;
	}
};

const setIce = (opt) => {
	if (!opt) return;
	currentIceId.value = opt.id;
};

const fetchSpecs = async (productId) => {
	if (!productId) return;
	try {
		const data = await fetchProductSpecs(productId);
		specGroups.value = data || [];

		// 默认选中每个分组的第一个选项
		const s = sweetGroup.value;
		currentSweetId.value = s && s.options.length ? s.options[0].id : null;

		const t = tempGroup.value;
		if (t && t.options.length) {
			// 优先选中“冰”
			const cold = t.options.find((o) => o.code === 'temp_cold');
			currentTempId.value = (cold || t.options[0]).id;
		} else {
			currentTempId.value = null;
		}

		const i = iceGroup.value;
		if (i && i.options.length && showIceGroup.value) {
			currentIceId.value = i.options[0].id;
		} else {
			currentIceId.value = null;
		}
	} catch (err) {
		console.error('fetch specs error:', err);
		specGroups.value = [];
		currentSweetId.value = null;
		currentTempId.value = null;
		currentIceId.value = null;
	}
};

const open = (product) => {
	if (!product) return;
	selectedProd.id = product.id;
	selectedProd.name = product.name || '';
	selectedProd.price = product.price ?? 0;

	// 打开弹窗并拉取规格
	popupRef.value?.open();
	fetchSpecs(product.id);
};

const close = () => {
	popupRef.value?.close();
};

const addToCart = () => {
	const sweetText = currentSweetOption.value?.name || '';

	// 组合“温度/冰度”的展示文字，保持与原先 specs.ice 字段兼容
	let iceText = '';
	const temp = currentTempOption.value;
	const ice = currentIceOption.value;

	if (temp) {
		if (temp.code === 'temp_cold') {
			// 冰：只展示冰度（多冰/少冰/去冰等），如果没选冰度就展示“冰”
			iceText = ice?.name || temp.name;
		} else {
			// 常温 / 热：直接展示温度
			iceText = temp.name;
		}
	} else if (ice) {
		iceText = ice.name;
	}

	emit('confirm', {
		id: selectedProd.id,
		specs: {
			sweet: sweetText,
			ice: iceText,
		},
	});
	close();
};

defineExpose({ open, close });
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

/* 弹窗整体置于 tabBar 之上（小程序 tabBar 层级约 9999） */
.product-detail-popup-root {
	position: relative;
	z-index: 10001;
}
:deep(.uni-popup) {
	z-index: 10001 !important;
}

/* 统一容器：避免小程序与 H5 宽度/盒模型不一致导致裁切 */
.spec-container {
	box-sizing: border-box;
	width: 100%;
	padding: 30rpx;
	padding-bottom: calc(30rpx + constant(safe-area-inset-bottom));
	padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
}

.spec-header {
	margin-bottom: 30rpx;

	.spec-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}
}

.spec-group {
	margin-bottom: 30rpx;

	.label {
		display: block;
		font-size: 28rpx;
		color: #666;
		margin-bottom: 16rpx;
	}

	/* 小程序不用负 margin，避免整块不渲染；用右/下 margin 做间距 */
	.tags {
		display: flex;
		flex-wrap: wrap;
		width: 100%;
		min-height: 80rpx;
	}

	.spec-tag {
		margin-right: 16rpx;
		margin-bottom: 16rpx;
		padding: 12rpx 24rpx;
		min-height: 56rpx;
		font-size: 26rpx;
		color: #666;
		background: #f5f5f5;
		border-radius: 8rpx;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.spec-tag text {
		font-size: 26rpx;
		color: inherit;
	}

	.spec-tag.active {
		background: $uni-color-primary;
		color: #fff;
	}
	.spec-tag.active text {
		color: #fff;
	}
}

/* 小程序 button 默认有边框、padding，需彻底重置以与 H5 一致 */
.confirm-btn {
	display: block;
	margin-top: 40rpx;
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	background: $uni-color-primary;
	color: #fff;
	font-size: 30rpx;
	border-radius: 44rpx;
	border: none;
}

.confirm-btn::after {
	border: none;
}
</style>
