<template>
	<view class="product-detail-popup-root">
		<uni-popup ref="popupRef" type="bottom" background-color="#fff" @maskClick="close">
			<view class="spec-container">
				<view class="spec-header">
					<text class="spec-title">{{ selectedProd.name }}</text>
				</view>

				<!-- 固定的甜度选项 -->
				<view class="spec-group">
					<text class="label">甜度</text>
					<view class="tags">
						<view
							v-for="(s, idx) in sweetOptions"
							:key="'sweet-' + idx"
							:class="'spec-tag' + (currentSweet === s ? ' active' : '')"
							@click="setSweet(s)"
						>
							<text>{{ s }}</text>
						</view>
					</view>
				</view>

				<!-- 固定的冰量/温度选项 -->
				<view class="spec-group">
					<text class="label">冰量 / 温度</text>
					<view class="tags">
						<view
							v-for="(i, idx) in iceOptions"
							:key="'ice-' + idx"
							:class="'spec-tag' + (currentIce === i ? ' active' : '')"
							@click="setIce(i)"
						>
							<text>{{ i }}</text>
						</view>
					</view>
				</view>

				<button class="confirm-btn" @click="addToCart">加入购物车</button>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, reactive } from 'vue';

const emit = defineEmits(['confirm']);

const popupRef = ref(null);
const selectedProd = reactive({ id: null, name: '', price: 0 });

const sweetOptions = ref(['常规', '七分糖', '五分糖', '不加糖']);
const iceOptions = ref(['多冰', '正常冰', '少冰', '去冰', '常温', '热饮']);

const currentSweet = ref('常规');
const currentIce = ref('正常冰');

const setSweet = (v) => {
	currentSweet.value = v;
};
const setIce = (v) => {
	currentIce.value = v;
};

const open = (product) => {
	if (!product) return;
	selectedProd.id = product.id;
	selectedProd.name = product.name || '';
	selectedProd.price = product.price ?? 0;
	currentSweet.value = '常规';
	currentIce.value = '正常冰';
	popupRef.value?.open();
};

const close = () => {
	popupRef.value?.close();
};

const addToCart = () => {
	emit('confirm', {
		id: selectedProd.id,
		specs: {
			sweet: currentSweet.value,
			ice: currentIce.value,
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
