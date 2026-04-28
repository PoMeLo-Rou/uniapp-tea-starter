<template>
	<view class="container">
		<view class="user-section" :style="{ paddingTop: safeAreaInsets.top + 'px' }">
			<view class="user-info">
				<image class="avatar" :src="userAvatar" mode="aspectFill"></image>
				<view class="meta">
					<text class="nickname">{{ isLoggedIn ? displayNickname : '请先登录账号' }}</text>
					<text v-if="isLoggedIn" class="username">@{{ username }}</text>
					<text v-if="isLoggedIn" class="level-tag">{{ isAdmin ? '管理员' : '会员' }}</text>
				</view>
			</view>
		</view>

		<view class="asset-card">
			<view class="asset-item">
				<text class="num">{{ points }}</text>
				<text class="label">积分</text>
			</view>
			<view class="divider"></view>
			<view class="asset-item">
				<text class="num">{{ coupons }}</text>
				<text class="label">优惠券</text>
			</view>
			<view class="divider"></view>
			<view class="asset-item">
				<text class="num">{{ balance.toFixed(2) }}</text>
				<text class="label">余额</text>
			</view>
		</view>

		<view class="menu-list">
			<view class="menu-item" @click="handleMenuClick('order')">
				<view class="left">
					<text class="icon">订单</text>
					<text class="text">历史订单</text>
				</view>
				<text class="arrow">›</text>
			</view>

			<view class="menu-item" @click="handleMenuClick('address')">
				<view class="left">
					<text class="icon">地址</text>
					<text class="text">收货地址</text>
				</view>
				<text class="arrow">›</text>
			</view>

			<view class="menu-item" @click="handleMenuClick('service')">
				<view class="left">
					<text class="icon">客服</text>
					<text class="text">联系客服</text>
				</view>
				<text class="arrow">›</text>
			</view>

			<view class="menu-item" @click="handleMenuClick('about')">
				<view class="left">
					<text class="icon">关于</text>
					<text class="text">关于我们</text>
				</view>
				<text class="arrow">›</text>
			</view>

			<view v-if="isAdmin" class="menu-item" @click="handleMenuClick('admin')">
				<view class="left">
					<text class="icon">管理</text>
					<text class="text">管理中心</text>
				</view>
				<text class="arrow">›</text>
			</view>
		</view>

		<button v-if="!isLoggedIn" class="action-btn" @click="goToLogin">账号登录/注册</button>
		<button v-else class="action-btn logout" @click="onLogout">退出登录</button>

		<CustomTabBar current-path="/pages/mine/mine" />
		<OrderHistoryDrawer :show="showOrderDrawer" @update:show="showOrderDrawer = $event" />
	</view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useMemberStore } from '@/stores/modules/member.js';
import CustomTabBar from '@/components/custom-tab-bar.vue';
import OrderHistoryDrawer from '@/components/OrderHistoryDrawer.vue';

const memberStore = useMemberStore();

const safeAreaInsets = (() => {
	try {
		const sys = uni.getSystemInfoSync();
		return sys.safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 };
	} catch (_) {
		return { top: 0, bottom: 0, left: 0, right: 0 };
	}
})();

const showOrderDrawer = ref(false);
const isLoggedIn = computed(() => memberStore.isLoggedIn);
const isAdmin = computed(() => memberStore.isAdmin);
const username = computed(() => memberStore.username || '');
const displayNickname = computed(() => memberStore.nickname || memberStore.username || '会员用户');
const points = computed(() => memberStore.points || 0);
const coupons = computed(() => memberStore.coupons || 0);
const balance = computed(() => Number(memberStore.balance || 0));
const userAvatar = computed(() => memberStore.avatar || 'https://img.icons8.com/color/96/user-male-circle--v1.png');

const requireLogin = () => {
	if (isLoggedIn.value) return true;
	uni.showToast({ title: '请先登录', icon: 'none' });
	setTimeout(() => {
		uni.navigateTo({ url: '/pages/login/login' });
	}, 500);
	return false;
};

const handleMenuClick = (type) => {
	if (type === 'order') {
		if (!requireLogin()) return;
		showOrderDrawer.value = true;
		return;
	}
	if (type === 'admin') {
		if (!requireLogin()) return;
		if (!isAdmin.value) {
			uni.showToast({ title: '无管理员权限', icon: 'none' });
			return;
		}
		uni.navigateTo({ url: '/pages/admin/index' });
		return;
	}
	uni.showToast({
		title: `点击了${type}功能`,
		icon: 'none',
	});
};

const goToLogin = () => {
	uni.navigateTo({ url: '/pages/login/login' });
};

const onLogout = () => {
	memberStore.clearUserInfo();
	uni.removeStorageSync('token');
	uni.showToast({ title: '已退出登录', icon: 'success' });
};
</script>

<style lang="scss" scoped>
.container {
	min-height: 100vh;
	background-color: #f8f8f8;
	padding: 30rpx;
	padding-bottom: 150rpx;
	overflow: visible;
}

.user-section {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 40rpx 10rpx;

	.user-info {
		display: flex;
		align-items: center;

		.avatar {
			width: 120rpx;
			height: 120rpx;
			border-radius: 60rpx;
			background-color: #eee;
		}

		.meta {
			margin-left: 24rpx;

			.nickname {
				font-size: 36rpx;
				font-weight: bold;
				display: block;
			}

			.username {
				display: block;
				margin-top: 8rpx;
				font-size: 24rpx;
				color: #6b7280;
			}

			.level-tag {
				font-size: 22rpx;
				color: #fff;
				background-color: #023993;
				padding: 4rpx 12rpx;
				border-radius: 20rpx;
				margin-top: 10rpx;
				display: inline-block;
			}
		}
	}

	.settings-icon {
		font-size: 24rpx;
		color: #6b7280;
	}
}

.asset-card {
	background-color: #fff;
	border-radius: 20rpx;
	display: flex;
	padding: 40rpx 0;
	margin-top: 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

	.asset-item {
		flex: 1;
		text-align: center;

		.num {
			font-size: 36rpx;
			font-weight: bold;
			display: block;
		}

		.label {
			font-size: 24rpx;
			color: #999;
			margin-top: 8rpx;
		}
	}

	.divider {
		width: 1rpx;
		height: 60rpx;
		background-color: #eee;
		align-self: center;
	}
}

.menu-list {
	background-color: #fff;
	border-radius: 20rpx;
	margin-top: 30rpx;
	padding: 0 30rpx;

	.menu-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 34rpx 0;
		border-bottom: 1rpx solid #f5f5f5;

		&:last-child {
			border-bottom: none;
		}

		.left {
			display: flex;
			align-items: center;

			.icon {
				min-width: 66rpx;
				margin-right: 18rpx;
				font-size: 24rpx;
				color: #023993;
				font-weight: 700;
			}

			.text {
				font-size: 30rpx;
				color: #333;
			}
		}

		.arrow {
			color: #333;
			font-size: 28rpx;
		}
	}
}

.action-btn {
	margin-top: 60rpx;
	background-color: #023993;
	color: #fff;
	border-radius: 50rpx;
	font-size: 30rpx;
	border: none;

	&::after {
		border: none;
	}
}

.action-btn.logout {
	background-color: #fff;
	color: #ff4d4f;
}
</style>
