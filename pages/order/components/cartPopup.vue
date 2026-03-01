<template>
  <view class="cart-popup-root">
    <uni-popup ref="popupRef" type="bottom" background-color="#fff" @maskClick="close">
      <!-- 与选规格弹窗相同的容器结构，实现一致的从下往上滑出效果 -->
      <view class="cart-container">
        <view class="cart-header">
          <text class="title">购物车</text>
          <text class="clear-btn" @click="onClear">🗑 清空</text>
        </view>
        <scroll-view scroll-y class="cart-list">
          <view v-for="item in cartList" :key="item.id" class="cart-item">
            <view class="cart-item-info">
              <text class="name">{{ item.name }}</text>
              <text class="price">¥{{ item.price * item.count }}</text>
            </view>
            <view class="action-btn">
              <view class="btn-circle outline small" @click="emit('update', item.id, -1)">-</view>
              <text class="count-num">{{ item.count }}</text>
              <view class="btn-circle theme-bg small" @click="emit('update', item.id, 1)">+</view>
            </view>
          </view>
        </scroll-view>
        <view v-if="cartList.length === 0" class="empty-tip">购物车是空的</view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { computed, watch, ref, nextTick } from 'vue';

const props = defineProps({
  show: Boolean,
  items: { type: Object, default: () => ({}) },
  getProduct: { type: Function, default: () => null },
});
const emit = defineEmits(['update:show', 'update', 'clear']);

const popupRef = ref(null);

const cartList = computed(() => {
  const list = [];
  const entries = Object.entries(props.items || {});
  entries.forEach(([pid, count]) => {
    const p = props.getProduct ? props.getProduct(pid) : null;
    if (p) list.push({ id: p.id, name: p.name, price: p.price, count });
  });
  return list;
});

watch(() => props.show, (val) => {
  if (val) {
    nextTick(() => {
      setTimeout(() => {
        const popup = popupRef.value;
        if (popup && typeof popup.open === 'function') popup.open();
      }, 50);
    });
  } else {
    const popup = popupRef.value;
    if (popup && typeof popup.close === 'function') popup.close();
  }
}, { immediate: true });

const close = () => {
  emit('update:show', false);
};

const onClear = () => {
  emit('clear');
  close();
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

/* 与选规格弹窗一致：整体置于 tabBar 之上，同一套从下往上滑出效果 */
.cart-popup-root {
  position: relative;
  z-index: 10001;
}
:deep(.uni-popup) {
  z-index: 10001 !important;
}

/* 与选规格弹窗 .spec-container 相同的容器：统一宽度、内边距、底部安全区 */
.cart-container {
  box-sizing: border-box;
  width: 100%;
  padding: 30rpx;
  padding-bottom: calc(30rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  max-height: 70vh;
}
.cart-header {
  display: flex;
  justify-content: space-between;
  padding-bottom: 30rpx;
  border-bottom: 1rpx solid #eee;
  .title { font-weight: bold; font-size: 32rpx; color: #333; }
  .clear-btn { color: #999; font-size: 26rpx; }
}
.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f8f8f8;
}
.btn-circle {
  width: 44rpx; height: 44rpx; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.btn-circle.outline { border: 1rpx solid #ccc; }
.theme-bg { background-color: $uni-color-primary; color: #fff; }
.count-num { margin: 0 20rpx; }
.empty-tip {
  padding: 60rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}
</style>