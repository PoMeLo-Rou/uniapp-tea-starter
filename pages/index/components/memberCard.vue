<template>
  <view class="member-bar" @click="goToMemberCenter">
    <view class="member-info">
      <text class="welcome">{{ welcomeText }}</text>
      <view class="level">
        <text class="icon">VIP</text>
        <text>{{ levelText }}</text>
      </view>
    </view>
    <view class="points">
      <text class="num">{{ memberStore.points || 0 }}</text>
      <text class="label">积分</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import { useMemberStore } from '@/stores/modules/member.js';

const memberStore = useMemberStore();
const welcomeText = computed(() => (memberStore.nickname ? `你好，${memberStore.nickname}` : '你好，茶友'));
const levelText = computed(() => (memberStore.isLoggedIn ? memberStore.levelName || '普通会员' : '点击登录'));

const goToMemberCenter = () => {
  if (!memberStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/login' });
    return;
  }
  uni.switchTab({ url: '/pages/mine/mine' });
};
</script>

<style lang="scss" scoped>
.member-bar {
  margin: 30rpx;
  background-color: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  &:active {
    opacity: 0.9;
  }

  .welcome {
    font-size: 32rpx;
    font-weight: bold;
    max-width: 300rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .level {
    font-size: 24rpx;
    color: #666;
    margin-top: 10rpx;

    .icon {
      margin-right: 6rpx;
      color: #023993;
      font-weight: 700;
    }
  }

  .points {
    text-align: right;

    .num {
      font-size: 40rpx;
      font-weight: bold;
      color: #023993;
      display: block;
    }

    .label {
      font-size: 22rpx;
      color: #999;
    }
  }
}
</style>
