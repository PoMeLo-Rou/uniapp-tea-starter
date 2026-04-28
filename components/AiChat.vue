<template>
	<view class="ai-float-btn" v-if="!showChat" @click="openChat">
		<text class="ai-float-text">AI</text>
	</view>

	<view class="ai-chat-mask" v-if="showChat" @click="closeChat">
		<view class="ai-chat-panel" @click.stop>
			<view class="panel-header">
				<text class="panel-title">AI 茶饮顾问</text>
				<text class="panel-close" @click="closeChat">×</text>
			</view>

			<scroll-view class="chat-area" scroll-y :scroll-top="scrollTop">
				<view class="chat-inner">
					<view class="message ai">
						<view class="avatar-wrap"><text class="avatar-text">AI</text></view>
						<view class="bubble">
							<text>你好，我是森柠的 AI 茶饮顾问。告诉我你的口味、心情或场景，我来帮你推荐适合的饮品。</text>
						</view>
					</view>

					<view v-for="(msg, idx) in messages" :key="idx" class="message" :class="msg.role">
						<view class="avatar-wrap">
							<text class="avatar-text">{{ msg.role === 'user' ? '我' : 'AI' }}</text>
						</view>
						<view class="message-main">
							<view class="bubble">
								<text>{{ msg.content }}</text>
								<text v-if="msg.loading" class="cursor-blink">|</text>
							</view>

							<scroll-view
								v-if="msg.role === 'ai' && msg.products && msg.products.length"
								class="ai-product-scroll"
								scroll-x
								show-scrollbar="false"
							>
								<view class="ai-product-row">
									<view
										v-for="product in msg.products"
										:key="product.id"
										class="ai-product-card"
										@click="openProductSpec(product)"
									>
										<image class="ai-product-img" :src="normalizeImageUrl(product.image || '/static/order.png')" mode="aspectFill" />
										<view class="ai-product-info">
											<text class="ai-product-name">{{ product.name }}</text>
											<text class="ai-product-desc">{{ product.desc || product.tag || 'AI 推荐饮品' }}</text>
											<view class="ai-product-bottom">
												<text class="ai-product-price">¥{{ formatPrice(product.price) }}</text>
												<view class="ai-add-btn" @click.stop="openProductSpec(product)">+</view>
											</view>
										</view>
									</view>
								</view>
							</scroll-view>
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
import { fetchProducts } from '@/common/api/product.js';
import { normalizeImageUrl } from '@/common/api/request.js';

const showChat = ref(false);
const messages = ref([]);
const inputText = ref('');
const isStreaming = ref(false);
const scrollTop = ref(0);
const productCache = ref([]);
const productCacheLoaded = ref(false);

const quickTags = ['想喝清爽的', '今天好热', '推荐甜一点的', '有什么新品吗', '适合拍照的饮品'];
const chatHistory = [];

const normalizeAiText = (raw) => {
	let text = String(raw || '');
	text = text.replace(/\*\*(.*?)\*\*/g, '$1');
	text = text.replace(/__(.*?)__/g, '$1');
	text = text.replace(/`([^`]*)`/g, '$1');
	text = text.replace(/^#{1,6}\s*/gm, '');
	text = text.replace(/^\s*[-*]\s+/gm, '');
	text = text.replace(/\n{3,}/g, '\n\n');
	return text.trim();
};

const getMemberUserId = () => {
	const raw = uni.getStorageSync('member');
	if (!raw) return 0;
	if (typeof raw === 'string') {
		try {
			const parsed = JSON.parse(raw);
			return parsed.userId || parsed.id || 0;
		} catch (_) {
			return 0;
		}
	}
	return raw.userId || raw.id || 0;
};

const isProductOnSale = (product) => {
	if (product?.status === undefined || product?.status === null) return true;
	if (typeof product.status === 'number') return product.status === 1;
	const status = String(product.status).toLowerCase();
	return status === '1' || status === 'on' || status === 'onsale' || status === 'on_sale' || status === 'active';
};

const normalizeMatchText = (text) =>
	String(text || '')
		.toLowerCase()
		.replace(/[\s"'“”‘’`~!@#$%^&*()_+\-=[\]{};:：,，.。/<>?？、|\\]/g, '');

const loadProducts = async () => {
	if (productCacheLoaded.value) return productCache.value;
	try {
		const list = await fetchProducts();
		productCache.value = (Array.isArray(list) ? list : []).filter((item) => item?.id && item?.name && isProductOnSale(item));
		productCacheLoaded.value = true;
		return productCache.value;
	} catch (error) {
		console.error('[AiChat] 加载商品列表失败:', error);
		return [];
	}
};

const findMentionedProducts = async (text) => {
	const products = await loadProducts();
	const normalizedText = normalizeMatchText(text);
	if (!normalizedText) return [];

	return products
		.map((product) => {
			const name = String(product.name || '');
			const normalizedName = normalizeMatchText(name);
			if (!normalizedName || !normalizedText.includes(normalizedName)) return null;
			return {
				...product,
				matchIndex: normalizedText.indexOf(normalizedName),
			};
		})
		.filter(Boolean)
		.sort((a, b) => a.matchIndex - b.matchIndex)
		.slice(0, 4);
};

const attachProductsToLastAiMessage = async (messageIndex) => {
	const target = messages.value[messageIndex];
	if (!target || target.role !== 'ai' || !target.content) return;
	const products = await findMentionedProducts(target.content);
	if (!products.length) return;
	messages.value.splice(messageIndex, 1, {
		...target,
		products,
	});
	scrollToBottom();
};

const formatPrice = (value) => {
	const amount = Number(value || 0);
	return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
};

const scrollToBottom = () => {
	nextTick(() => {
		scrollTop.value = scrollTop.value === 99999 ? 100000 : 99999;
	});
};

const openChat = () => {
	showChat.value = true;
	loadProducts();
	if (!socketManager.isConnected) {
		const userId = getMemberUserId();
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

	messages.value.push({ role: 'ai', content: '', loading: true, products: [] });
	isStreaming.value = true;
	scrollToBottom();

	try {
		const userId = getMemberUserId();

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
	} catch (error) {
		console.error('[AiChat] 发送失败:', error.message);
		const last = messages.value[messages.value.length - 1];
		if (last && last.role === 'ai') {
			const msg = error.message || '';
			last.content = msg.includes('超时') || msg.includes('连接失败')
				? '连接超时，请确认后端服务已启动，且小程序接口地址配置正确。'
				: '连接失败: ' + msg;
			last.loading = false;
		}
		isStreaming.value = false;
	}
};

const openProductSpec = (product) => {
	if (!product?.id) return;
	showChat.value = false;
	uni.setStorageSync('pendingOpenSpecProductId', product.id);
	uni.switchTab({
		url: '/pages/order/order',
		success: () => {
			setTimeout(() => {
				uni.$emit('openSpec', { productId: product.id });
			}, 450);
		},
	});
};

const onChunk = (msg) => {
	const last = messages.value[messages.value.length - 1];
	if (last && last.role === 'ai' && last.loading) {
		last.content += msg.content;
		scrollToBottom();
	}
};

const onDone = async () => {
	const messageIndex = messages.value.length - 1;
	const last = messages.value[messageIndex];
	if (last && last.role === 'ai') {
		last.loading = false;
		last.content = normalizeAiText(last.content);
		chatHistory.push({ role: 'assistant', content: last.content });
		await attachProductsToLastAiMessage(messageIndex);
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
}

.message.user {
	flex-direction: row-reverse;
}

.message.user .message-main {
	align-items: flex-end;
}

.message.user .bubble {
	background: $uni-color-primary;
	color: #fff;
	margin-right: 16rpx;
	margin-left: 80rpx;
}

.message.ai .bubble {
	background: #fff;
	color: #333;
	margin-left: 16rpx;
	margin-right: 80rpx;
}

.message-main {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
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

.ai-product-scroll {
	margin-top: 16rpx;
	margin-left: 16rpx;
	width: calc(100vw - 128rpx);
	white-space: nowrap;
}

.ai-product-row {
	display: inline-flex;
	gap: 16rpx;
	padding-bottom: 6rpx;
}

.ai-product-card {
	width: 248rpx;
	background: #fff;
	border-radius: 16rpx;
	padding: 14rpx;
	box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.08);
	box-sizing: border-box;
}

.ai-product-img {
	width: 220rpx;
	height: 164rpx;
	border-radius: 12rpx;
	background: #eef2f7;
}

.ai-product-info {
	margin-top: 12rpx;
}

.ai-product-name {
	display: block;
	font-size: 25rpx;
	font-weight: 700;
	color: #111827;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.ai-product-desc {
	display: block;
	margin-top: 6rpx;
	height: 56rpx;
	font-size: 21rpx;
	line-height: 1.35;
	color: #6b7280;
	overflow: hidden;
	white-space: normal;
}

.ai-product-bottom {
	margin-top: 12rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.ai-product-price {
	font-size: 26rpx;
	font-weight: 700;
	color: $uni-color-primary;
}

.ai-add-btn {
	width: 44rpx;
	height: 44rpx;
	border-radius: 50%;
	background: $uni-color-primary;
	color: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	font-weight: 700;
	line-height: 44rpx;
}

.cursor-blink {
	animation: blink 0.8s infinite;
	color: $uni-color-primary;
	font-weight: bold;
}

@keyframes blink {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0;
	}
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
}

.send-btn.disabled {
	opacity: 0.5;
}

.send-text {
	color: #fff;
	font-size: 28rpx;
}
</style>
