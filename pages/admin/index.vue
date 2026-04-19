<template>
  <view class="page" :style="{ paddingTop: safeAreaInsets.top + 'px' }">
    <view class="header">
      <button class="back-btn" @click="goBack">返回</button>
      <text class="title">管理中心</text>
      <view class="header-placeholder"></view>
    </view>

    <scroll-view scroll-y class="content">
      <view class="admin-card" @click="goProductManage">
        <text class="card-title">商品管理</text>
        <text class="card-desc">管理产品列表、上下架、编辑描述和规格</text>
      </view>
      <view class="admin-card" @click="goSiteManage">
        <text class="card-title">展示配置</text>
        <text class="card-desc">配置首页轮播、点单页展示、门店信息等</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { useMemberStore } from '@/stores/modules/member.js';
import { onLoad } from '@dcloudio/uni-app';

const memberStore = useMemberStore();
const { safeAreaInsets } = uni.getSystemInfoSync();

const goBack = () => {
  uni.navigateBack({ delta: 1 });
};

const ensureAdminAccess = () => {
  if (!memberStore.isLoggedIn || !memberStore.isAdmin) {
    uni.showToast({ title: '无管理员权限', icon: 'none' });
    uni.switchTab({ url: '/pages/mine/mine' });
    return false;
  }
  return true;
};

const goProductManage = () => {
  if (!ensureAdminAccess()) return;
  uni.navigateTo({ url: '/pages/admin/product-manage' });
};

const goSiteManage = () => {
  if (!ensureAdminAccess()) return;
  uni.navigateTo({ url: '/pages/admin/site-manage' });
};

onLoad(() => {
  ensureAdminAccess();
});
</script>

<style scoped>
.page {
  min-height: 100%;
  background: #f7f8fa;
}
.header {
  padding: 20rpx 20rpx 10rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.back-btn {
  padding: 10rpx 16rpx;
  border-radius: 16rpx;
  background: #ffffff;
  color: #333333;
  border: 1rpx solid #e5e7eb;
}
.title {
  font-size: 32rpx;
  color: #111111;
  font-weight: bold;
}
.header-placeholder {
  width: 64rpx;
}
.content {
  padding: 0 20rpx;
}
.admin-card {
  margin-top: 20rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
}
.admin-card + .admin-card {
  margin-top: 18rpx;
}
.card-title {
  font-size: 30rpx;
  color: #111111;
  font-weight: bold;
}
.card-desc {
  margin-top: 12rpx;
  color: #666666;
  line-height: 40rpx;
}
</style>
