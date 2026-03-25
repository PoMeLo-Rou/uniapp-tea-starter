<template>
	<view class="container">
	  <view class="user-section" :style="{ paddingTop: safeAreaInsets.top + 'px' }">
		<view class="user-info">
		  <image class="avatar" :src="userAvatar" mode="aspectFill"></image>
		  <view class="meta">
			<text class="nickname">{{ isLoggedIn ? nickname : '点击下方按钮登录' }}</text>
			<text v-if="isLoggedIn" class="level-tag">{{ isAdmin ? '管理员' : '会员' }}</text>
		  </view>
		</view>
		<view class="settings-icon">⚙️</view>
	  </view>
  
	  <view class="asset-card">
		<view class="asset-item">
		  <text class="num">{{ points }}</text>
		  <text class="label">积分</text>
		</view>
		<view class="divider"></view>
		<view class="asset-item">
		  <text class="num">5</text>
		  <text class="label">优惠券</text>
		</view>
		<view class="divider"></view>
		<view class="asset-item">
		  <text class="num">0.00</text>
		  <text class="label">余额</text>
		</view>
	  </view>
  
	  <view class="menu-list">
		<view class="menu-item" @click="handleMenuClick('order')">
		  <view class="left">
			<text class="icon">📜</text>
			<text class="text">历史订单</text>
		  </view>
		  <text class="arrow">></text>
		</view>
		
		<view class="menu-item" @click="handleMenuClick('address')">
		  <view class="left">
			<text class="icon">📍</text>
			<text class="text">收货地址</text>
		  </view>
		  <text class="arrow">></text>
		</view>
  
		<view class="menu-item" @click="handleMenuClick('service')">
		  <view class="left">
			<text class="icon">🎧</text>
			<text class="text">联系客服</text>
		  </view>
		  <text class="arrow">></text>
		</view>
  
		<view class="menu-item" @click="handleMenuClick('about')">
		  <view class="left">
			<text class="icon">ℹ️</text>
			<text class="text">关于我们</text>
		  </view>
		  <text class="arrow">></text>
		</view>

		<view v-if="isAdmin" class="menu-item" @click="handleMenuClick('admin')">
		  <view class="left">
			<text class="icon">🛠️</text>
			<text class="text">管理员商品管理</text>
		  </view>
		  <text class="arrow">></text>
		</view>
	  </view>
	  
	  <button class="logout-btn" open-type="getPhoneNumber" @getphonenumber="onGetPhoneNumber" v-if="!isLoggedIn">微信手机号登录</button>
	  <button class="logout-btn" @click="onLogout" v-else>退出登录</button>
		<CustomTabBar current-path="/pages/mine/mine" />

		<!-- 历史订单抽屉 -->
		<OrderHistoryDrawer :show="showOrderDrawer" @update:show="showOrderDrawer = $event" />
	</view>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { wxPhoneLogin } from '@/common/api/auth.js';
  import { useMemberStore } from '@/stores/modules/member.js';
  import CustomTabBar from '@/components/custom-tab-bar.vue';
  import OrderHistoryDrawer from '@/components/OrderHistoryDrawer.vue';

  const memberStore = useMemberStore();

  const safeAreaInsets = (() => {
    try {
      const sys = uni.getSystemInfoSync();
      return sys.safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 };
    } catch (e) {
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }
  })();

  const showOrderDrawer = ref(false);
  const isLoggedIn = computed(() => memberStore.isLoggedIn);
  const isAdmin = computed(() => memberStore.isAdmin);
  const nickname = computed(() => memberStore.nickname || '游客');
  const points = computed(() => memberStore.points || 0);
  const userAvatar = computed(() => memberStore.avatar || 'https://img.icons8.com/color/96/user-male-circle--v1.png');

  const handleMenuClick = (type) => {
	if (type === 'order') {
	  if (!isLoggedIn.value) {
		uni.showToast({ title: '请先登录', icon: 'none' });
		return;
	  }
	  showOrderDrawer.value = true;
	  return;
	}
	if (type === 'admin') {
	  if (!isLoggedIn.value) {
		uni.showToast({ title: '请先登录', icon: 'none' });
		return;
	  }
	  if (!isAdmin.value) {
		uni.showToast({ title: '无管理员权限', icon: 'none' });
		return;
	  }
	  uni.navigateTo({ url: '/pages/admin/product-manage' });
	  return;
	}
	uni.showToast({
	  title: `点击了 ${type} 功能`,
	  icon: 'none'
	});
  };

  // 微信手机号登录：手机号授权 + code 换 openid
  const onGetPhoneNumber = (e) => {
    console.log('[mine] onGetPhoneNumber callback triggered:', e);
    const detail = e && e.detail ? e.detail : {};
    const phoneCode = detail.code || '';
    const encryptedData = detail.encryptedData || '';
    const iv = detail.iv || '';
    const ok = String(detail.errMsg || '').includes(':ok');
    console.log('[mine] phone auth detail:', {
      errMsg: detail.errMsg,
      ok,
      phoneCodeLen: phoneCode ? String(phoneCode).length : 0,
      encryptedDataLen: encryptedData ? String(encryptedData).length : 0,
      ivLen: iv ? String(iv).length : 0,
    });
    if (!ok) {
      uni.showToast({ title: '你已取消手机号授权', icon: 'none' });
      return;
    }

    uni.login({
      provider: 'weixin',
      success: (loginRes) => {
        const code = loginRes.code;
        console.log('[mine] uni.login success, codeLen=', code ? String(code).length : 0);
        if (!code) {
          uni.showToast({ title: '登录失败(code)', icon: 'none' });
          return;
        }

        uni.showLoading({ title: '登录中...', mask: true });
        wxPhoneLogin({
          code,
          phoneCode,
          encryptedData,
          iv,
          nickName: nickname.value || '茶友',
          avatarUrl: userAvatar.value || '',
        }).then((data) => {
          uni.hideLoading();
          if (!data.userId) {
            uni.showToast({ title: '登录失败', icon: 'none' });
            return;
          }
          memberStore.setUserInfo(data);
          uni.showToast({ title: '登录成功', icon: 'success' });
        }).catch((err) => {
          uni.hideLoading();
          uni.showToast({ title: err?.message || '网络异常', icon: 'none' });
        });
      },
      fail: () => {
        uni.showToast({ title: '登录取消', icon: 'none' });
      },
    });
  };

  const onLogout = () => {
    memberStore.clearUserInfo();
  };
  </script>
  
  <style lang="scss" scoped>
  .container {
    min-height: 100vh;
    background-color: #f8f8f8;
    padding: 30rpx;
    padding-bottom: 150rpx; /* 为底部自定义 tabBar 留白 */
    overflow: visible; /* 避免裁剪历史订单抽屉的 fixed 层 */
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
        .level-tag {
          font-size: 22rpx;
          color: #fff;
          background-color: #023993; // 统一使用主题色
          padding: 4rpx 12rpx;
          border-radius: 20rpx;
          margin-top: 10rpx;
          display: inline-block;
        }
      }
    }
    .settings-icon { font-size: 40rpx; }
  }
  
  .asset-card {
    background-color: #fff;
    border-radius: 20rpx;
    display: flex;
    padding: 40rpx 0;
    margin-top: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
    
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
      &:last-child { border-bottom: none; }
      
      .left {
        display: flex;
        align-items: center;
        .icon { margin-right: 20rpx; font-size: 32rpx; }
        .text { font-size: 30rpx; color: #333; }
      }
      .arrow { color: #ccc; font-size: 28rpx; }
    }
  }
  
  .logout-btn {
    margin-top: 60rpx;
    background-color: #fff;
    color: #ff4d4f;
    border-radius: 50rpx;
    font-size: 30rpx;
    border: none;
    &::after { border: none; }
  }
  </style>
