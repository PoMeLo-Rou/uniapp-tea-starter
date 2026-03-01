<template>
	<view class="custom-tab-bar">
		<view class="tab-bar-inner">
			<view
				v-for="(item, index) in list"
				:key="index"
				class="tab-item"
				:class="{ active: currentPath === item.pagePath }"
				@click="switchTab(item)"
			>
				<image
					class="tab-icon"
					:src="currentPath === item.pagePath ? item.selectedIconPath : item.iconPath"
					mode="aspectFit"
				/>
				<text class="tab-text">{{ item.text }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
const props = defineProps({
	/** 当前页面路径，用于高亮对应 tab */
	currentPath: {
		type: String,
		default: '',
	},
});

const list = [
	{
		pagePath: '/pages/index/index',
		text: '点单',
		iconPath: '/static/index.png',
		selectedIconPath: '/static/index-selected.png',
	},
	{
		pagePath: '/pages/order/order',
		text: '订单',
		iconPath: '/static/order.png',
		selectedIconPath: '/static/order-selected.png',
	},
	{
		pagePath: '/pages/mine/mine',
		text: '我的',
		iconPath: '/static/mine.png',
		selectedIconPath: '/static/mine-selected.png',
	},
];

const switchTab = (item) => {
	if (props.currentPath === item.pagePath) return;
	uni.switchTab({ url: item.pagePath });
};
</script>

<style lang="scss" scoped>
$tab-color: #999999;
$tab-color-active: #023993;

/* 固定高度，避免不同页面 env() 解析不一致导致高度不同 */
.custom-tab-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	box-sizing: border-box;
	height: calc(100rpx + constant(safe-area-inset-bottom));
	height: calc(100rpx + env(safe-area-inset-bottom));
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
	background: #ffffffbf ;
	-webkit-backdrop-filter: blur(5px);
	backdrop-filter: blur(5px);
	border-top: 1rpx solid rgba(0, 0, 0, 0.06);
	z-index: 999;
}

/* 固定内容区高度，保证各页面图标/文字位置一致，不受页面样式影响 */
.tab-bar-inner {
	height: 100rpx;
	min-height: 100rpx;
	display: flex;
	align-items: center;
	justify-content: space-around;
	box-sizing: border-box;
}

.tab-item {
	flex: 1;
	height: 100rpx;
	min-height: 100rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	padding: 0;
	margin: 0;
}

.tab-icon {
	width: 48rpx;
	height: 48rpx;
	min-width: 48rpx;
	min-height: 48rpx;
	margin: 0 0 4rpx 0;
	display: block;
	flex-shrink: 0;
}

.tab-text {
	font-size: 20rpx;
	line-height: 28rpx;
	height: 28rpx;
	color: $tab-color;
	white-space: nowrap;
	flex-shrink: 0;
}

.tab-item.active .tab-text {
	color: $tab-color-active;
}
</style>
