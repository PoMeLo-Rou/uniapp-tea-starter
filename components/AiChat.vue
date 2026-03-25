<template>
    <!-- 悬浮按钮 -->
    <view class="ai-float-btn" v-if="!showChat" @click="openChat">
      <text class="ai-float-text">AI</text>
    </view>
  
    <!-- 聊天面板 -->
    <view class="ai-chat-mask" v-if="showChat" @click="closeChat">
      <view class="ai-chat-panel" @click.stop>
        <view class="panel-header">
          <text class="panel-title">AI 茶饮顾问</text>
          <text class="panel-close" @click="closeChat">✕</text>
        </view>
  
        <scroll-view class="chat-area" scroll-y :scroll-top="scrollTop">
          <view class="chat-inner">
            <view class="message ai">
              <view class="avatar-wrap"><text class="avatar-text">AI</text></view>
              <view class="bubble">
                <text>你好呀~我是森柠的 AI 茶饮顾问！告诉我你的口味偏好或心情，我来为你推荐最合适的茶饮</text>
              </view>
            </view>
  
            <view v-for="(msg, idx) in messages" :key="idx" class="message" :class="msg.role">
              <view class="avatar-wrap">
                <text class="avatar-text">{{ msg.role === 'user' ? '我' : 'AI' }}</text>
              </view>
              <view class="bubble">
                <text>{{ msg.content }}</text>
                <text v-if="msg.loading" class="cursor-blink">|</text>
              </view>
            </view>
          </view>
        </scroll-view>
  
        <view class="quick-tags" v-if="messages.length === 0">
          <text class="tag" v-for="tag in quickTags" :key="tag" @click="sendMessage(tag)">{{ tag }}</text>
        </view>
  
        <view class="input-area">
          <input
            class="input"
            v-model="inputText"
            placeholder="描述你的口味偏好..."
            :disabled="isStreaming"
            @confirm="onSend"
          />
          <view class="send-btn" :class="{ disabled: !inputText.trim() || isStreaming }" @click="onSend">
            <text class="send-text">发送</text>
          </view>
        </view>
      </view>
    </view>
  </template>
  
  <script setup>
  import { ref, nextTick, onUnmounted } from 'vue';
  import { socketManager } from '@/common/ws/socket.js';
  
  const showChat = ref(false);
  const messages = ref([]);
  const inputText = ref('');
  const isStreaming = ref(false);
  const scrollTop = ref(0);
  
  const quickTags = ['想喝清爽的', '今天好热', '推荐甜一点的', '有什么新品吗', '适合拍照的饮品'];
  const chatHistory = [];
  
  const scrollToBottom = () => {
    nextTick(() => {
      scrollTop.value = scrollTop.value === 99999 ? 100000 : 99999;
    });
  };
  
  const openChat = () => {
    showChat.value = true;
    if (!socketManager.isConnected) {
      const memberRaw = uni.getStorageSync('member');
      const userId = memberRaw ? memberRaw.userId : 0;
      console.log('[AiChat] 打开聊天，连接 WS, userId:', userId);
      socketManager.connect(userId != null ? userId : 0);
    }
  };
  
  const closeChat = () => {
    showChat.value = false;
  };
  
  const onSend = () => {
    const text = inputText.value.trim();
    if (!text || isStreaming.value) return;
    sendMessage(text);
  };
  
const sendMessage = async (text) => {
    inputText.value = '';
    messages.value.push({ role: 'user', content: text });
    chatHistory.push({ role: 'user', content: text });

    messages.value.push({ role: 'ai', content: '', loading: true });
    isStreaming.value = true;
    scrollToBottom();

    try {
      const memberRaw = uni.getStorageSync('member');
      const userId = memberRaw != null && memberRaw.userId != null ? memberRaw.userId : 0;

      if (!socketManager.isConnected) {
        console.log('[AiChat] WS 未连接，正在连接... userId:', userId);
        socketManager.connect(userId);
      }

      await socketManager.waitForReady();
      console.log('[AiChat] WS 已就绪，发送 ai_recommend');
      const sent = socketManager.send({ type: 'ai_recommend', messages: chatHistory });
      if (!sent) {
        throw new Error('消息发送失败');
      }
    } catch (e) {
      console.error('[AiChat] 发送失败:', e.message);
      const last = messages.value[messages.value.length - 1];
      if (last && last.role === 'ai') {
        const msg = e.message || '';
        last.content = msg.includes('超时') || msg.includes('连接失败')
          ? '连接超时，请确认：1) 后端服务已启动 2) 微信开发者工具中接口地址为本机 IP（如 192.168.x.x:8080）'
          : '连接失败: ' + msg;
        last.loading = false;
      }
      isStreaming.value = false;
    }
  };
  
  const onChunk = (msg) => {
    const last = messages.value[messages.value.length - 1];
    if (last && last.role === 'ai' && last.loading) {
      last.content += msg.content;
      console.log('[AiChat] 收到 AI 片段:', msg.content, '当前累计内容:', last.content);
      scrollToBottom();
    }
  };
  
  const onDone = () => {
    const last = messages.value[messages.value.length - 1];
    if (last && last.role === 'ai') {
      last.loading = false;
      chatHistory.push({ role: 'assistant', content: last.content });
    }
    isStreaming.value = false;
  };
  
  const onError = (msg) => {
    const last = messages.value[messages.value.length - 1];
    if (last && last.role === 'ai') {
      last.content = 'AI 服务暂不可用: ' + msg.message;
      console.error('[AiChat] AI 错误:', msg.message);
      last.loading = false;
    }
    isStreaming.value = false;
  };
  
  socketManager.on('ai_chunk', onChunk);
  socketManager.on('ai_done', onDone);
  socketManager.on('ai_error', onError);
  
  onUnmounted(() => {
    socketManager.off('ai_chunk', onChunk);
    socketManager.off('ai_done', onDone);
    socketManager.off('ai_error', onError);
  });
  </script>
  
  <style lang="scss" scoped>
  @import '@/uni.scss';
  
  .ai-float-btn {
    position: fixed;
    right: 30rpx;
    bottom: 200rpx;
    width: 96rpx;
    height: 96rpx;
    border-radius: 50%;
    background: $uni-color-primary;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6rpx 20rpx rgba(2, 57, 147, 0.4);
    z-index: 998;
  }
  .ai-float-text {
    color: #fff;
    font-size: 28rpx;
    font-weight: bold;
  }
  
  .ai-chat-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: flex-end;
  }
  
  .ai-chat-panel {
    width: 100%;
    height: 85vh;
    background: #f5f5f5;
    border-radius: 24rpx 24rpx 0 0;
    display: flex;
    flex-direction: column;
  }
  
  .panel-header {
    height: 88rpx;
    background: $uni-color-primary;
    border-radius: 24rpx 24rpx 0 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30rpx;
    flex-shrink: 0;
  }
  .panel-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #fff;
  }
  .panel-close {
    font-size: 36rpx;
    color: #fff;
    padding: 10rpx;
  }
  
  .chat-area {
    flex: 1;
    overflow: hidden;
  }
  .chat-inner {
    padding: 20rpx 24rpx;
  }
  
  .message {
    display: flex;
    margin-bottom: 24rpx;
    &.user {
      flex-direction: row-reverse;
      .bubble {
        background: $uni-color-primary;
        color: #fff;
        margin-right: 16rpx;
        margin-left: 80rpx;
      }
    }
    &.ai {
      .bubble {
        background: #fff;
        color: #333;
        margin-left: 16rpx;
        margin-right: 80rpx;
      }
    }
  }
  .avatar-wrap {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    background: $uni-color-primary;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .avatar-text {
    color: #fff;
    font-size: 24rpx;
    font-weight: bold;
  }
  .message.user .avatar-wrap {
    background: #666;
  }
  .bubble {
    padding: 20rpx 24rpx;
    border-radius: 16rpx;
    font-size: 28rpx;
    line-height: 1.6;
    word-break: break-all;
  }
  
  .cursor-blink {
    animation: blink 0.8s infinite;
    color: $uni-color-primary;
    font-weight: bold;
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  
  .quick-tags {
    padding: 16rpx 24rpx;
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    flex-shrink: 0;
  }
  .tag {
    background: #fff;
    border: 1rpx solid $uni-color-primary;
    color: $uni-color-primary;
    font-size: 24rpx;
    padding: 12rpx 24rpx;
    border-radius: 30rpx;
  }
  
  .input-area {
    display: flex;
    align-items: center;
    padding: 16rpx 24rpx;
    padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
    background: #fff;
    flex-shrink: 0;
  }
  .input {
    flex: 1;
    height: 72rpx;
    background: #f5f5f5;
    border-radius: 36rpx;
    padding: 0 30rpx;
    font-size: 28rpx;
  }
  .send-btn {
    margin-left: 16rpx;
    width: 120rpx;
    height: 72rpx;
    background: $uni-color-primary;
    border-radius: 36rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    &.disabled { opacity: 0.5; }
  }
  .send-text {
    color: #fff;
    font-size: 28rpx;
  }
  </style>