<template>
	<view class="recommend-section">
		<view class="section-header">
			<text class="title">猜你喜欢</text>
			<text class="subtitle">根据您的口味推荐</text>
		</view>
		<scroll-view class="recommend-scroll" scroll-x="true" show-scrollbar="false">
			<view
				class="recommend-item"
				v-for="(item, index) in list"
				:key="item.id || index"
				@click="onClick(item)"
			>
				<image :src="item.image" mode="aspectFill" class="prod-img"></image>
				<view class="prod-info">
					<text class="prod-name">{{ item.name }}</text>
					<text class="prod-price">￥{{ item.price }}</text>
				</view>
				<button class="add-btn" size="mini" @click.stop="onClick(item)">+</button>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
defineProps({
	list: {
		type: Array,
		default: () => [],
	},
});

const emit = defineEmits(['click']);

const onClick = (item) => {
	emit('click', item);
};
</script>

<style lang="scss" scoped>
/* 与 order 页、tabBar 一致的主题色 */
$theme-color: #023993;

.recommend-section {
	padding: 20rpx;

	.section-header {
		margin-bottom: 20rpx;

		.title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}

		.subtitle {
			font-size: 24rpx;
			color: #999;
			margin-left: 15rpx;
		}
	}

	.recommend-scroll {
		white-space: nowrap;
        /* 隐藏滚动条 */
        ::-webkit-scrollbar {
            display: none;
        }
        ::-webkit-scrollbar-thumb {
            display: none;
        }
        ::-webkit-scrollbar-track {
            display: none;
        }

		.recommend-item {
			display: inline-block;
			width: 240rpx;
			margin-right: 20rpx;
			background: #fff;
			border-radius: 12rpx;
			padding: 15rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

			.prod-img {
				width: 100%;
				height: 200rpx;
				border-radius: 8rpx;
			}

			.prod-name {
				font-size: 26rpx;
				display: block;
				margin: 10rpx 0;
			}

			.prod-price {
				color: $theme-color;
				font-weight: bold;
			}

			.add-btn {
				float: right;
				background: $theme-color;
				color: #fff;
				border-radius: 50%;
				padding: 0 15rpx;
				border: none;

				&::after {
					border: none;
				}
			}
		}
	}
}
</style>
