<template>
	<view class="login-page">
		<view class="login-header" :style="{ paddingTop: safeAreaInsets.top + 'px' }">
			<view class="back-btn" @click="goBack">
				<text class="back-icon">‹</text>
			</view>
			<text class="header-title">账号登录</text>
			<view class="header-placeholder"></view>
		</view>

		<view class="login-main">
			<view class="brand-block">
				<text class="brand-title">森柠</text>
				<text class="brand-desc">使用用户名和密码登录</text>
			</view>

			<view class="form-panel">
				<view class="mode-switch">
					<view :class="['mode-item', mode === 'login' ? 'active' : '']" @click="setMode('login')">
						登录
					</view>
					<view :class="['mode-item', mode === 'register' ? 'active' : '']" @click="setMode('register')">
						注册
					</view>
				</view>

				<view class="form-item">
					<text class="label">用户名</text>
					<input
						v-model="form.username"
						class="input"
						placeholder="请输入用户名"
						placeholder-style="color: #9ca3af;"
						maxlength="32"
					/>
				</view>

				<view v-if="mode === 'register'" class="form-item">
					<text class="label">昵称</text>
					<input
						v-model="form.nickname"
						class="input"
						placeholder="请输入昵称，可与用户名相同"
						placeholder-style="color: #9ca3af;"
						maxlength="32"
					/>
				</view>

				<view class="form-item">
					<text class="label">密码</text>
					<view class="input-wrap">
						<input
							v-model="form.password"
							class="input input-with-icon"
							:password="!showPassword"
							placeholder="请输入密码"
							placeholder-style="color: #9ca3af;"
							maxlength="32"
						/>
						<view class="password-toggle" @click="showPassword = !showPassword">
							<view :class="['eye-icon', showPassword ? 'open' : 'closed']">
								<view class="eye-dot"></view>
							</view>
						</view>
					</view>
				</view>

				<view v-if="mode === 'register'" class="form-item">
					<text class="label">确认密码</text>
					<view class="input-wrap">
						<input
							v-model="form.confirmPassword"
							class="input input-with-icon"
							:password="!showConfirmPassword"
							placeholder="请再次输入密码"
							placeholder-style="color: #9ca3af;"
							maxlength="32"
						/>
						<view class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
							<view :class="['eye-icon', showConfirmPassword ? 'open' : 'closed']">
								<view class="eye-dot"></view>
							</view>
						</view>
					</view>
				</view>

				<button class="submit-btn" :loading="submitting" :disabled="submitting" @click="submit">
					{{ mode === 'login' ? '登录' : '注册并登录' }}
				</button>

				<text class="tips">
					{{ mode === 'login' ? '没有账号时可以切换到注册。' : '普通用户注册后默认为会员，管理员角色由后台数据库分配。' }}
				</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { loginByPassword, registerByPassword } from '@/common/api/auth.js';
import { useMemberStore } from '@/stores/modules/member.js';

const memberStore = useMemberStore();

const safeAreaInsets = (() => {
	try {
		const sys = uni.getSystemInfoSync();
		return sys.safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 };
	} catch (_) {
		return { top: 0, bottom: 0, left: 0, right: 0 };
	}
})();

const mode = ref('login');
const submitting = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const form = reactive({
	username: '',
	nickname: '',
	password: '',
	confirmPassword: '',
});

const setMode = (nextMode) => {
	mode.value = nextMode === 'register' ? 'register' : 'login';
};

const normalizeAuthPayload = (payload = {}) => {
	const data = payload.data && typeof payload.data === 'object' ? payload.data : payload;
	const user = data.user || data.member || data.userInfo || data;
	return {
		token: data.token || data.accessToken || user.token || '',
		user,
	};
};

const validate = () => {
	const username = form.username.trim();
	if (!username) {
		uni.showToast({ title: '请输入用户名', icon: 'none' });
		return false;
	}
	if (username.length < 3) {
		uni.showToast({ title: '用户名至少 3 位', icon: 'none' });
		return false;
	}
	if (!form.password) {
		uni.showToast({ title: '请输入密码', icon: 'none' });
		return false;
	}
	if (form.password.length < 6) {
		uni.showToast({ title: '密码至少 6 位', icon: 'none' });
		return false;
	}
	if (mode.value === 'register' && form.password !== form.confirmPassword) {
		uni.showToast({ title: '两次密码不一致', icon: 'none' });
		return false;
	}
	return true;
};

const getAuthErrorMessage = (error) => {
	const statusCode = Number(error?.statusCode || 0);
	const serverMessage = String(error?.message || '');
	const serverCode = String(error?.data?.code || error?.data?.errorCode || '').toUpperCase();
	const rawText = String(error?.data?.rawText || error?.rawData || '');
	const lowerText = `${serverMessage} ${serverCode} ${rawText}`.toLowerCase();
	const isRouteMissing =
		lowerText.includes('cannot post') ||
		lowerText.includes('cannot get') ||
		(lowerText.includes('not found') && lowerText.includes('/api/auth/'));

	if (mode.value === 'login') {
		if (isRouteMissing) return '登录接口不存在，请检查后端是否已实现 /api/auth/login';
		if (serverCode.includes('USER_NOT_FOUND') || serverCode.includes('ACCOUNT_NOT_FOUND')) {
			return '账号不存在，请先注册';
		}
		if (serverCode.includes('PASSWORD_ERROR') || serverCode.includes('BAD_CREDENTIALS')) {
			return '密码错误，请重新输入';
		}
		if (statusCode === 404) return '账号不存在，请先注册';
		if (statusCode === 401 || statusCode === 403) return '用户名或密码错误';
	}

	if (mode.value === 'register') {
		if (isRouteMissing) return '注册接口不存在，请检查后端是否已实现 /api/auth/register';
		if (statusCode === 409 || serverCode.includes('USER_EXISTS') || serverCode.includes('USERNAME_EXISTS')) {
			return '用户名已存在，请更换后再注册';
		}
		if (statusCode === 400) return serverMessage || '注册信息格式不正确';
	}

	if (statusCode >= 500) return '服务器异常，请稍后再试';
	if (serverMessage && !serverMessage.includes('<!DOCTYPE')) return serverMessage;
	if (error?.errMsg) return '网络连接失败，请检查后端服务是否启动';
	return '操作失败，请稍后再试';
};

const submit = async () => {
	if (submitting.value || !validate()) return;
	submitting.value = true;
	try {
		const username = form.username.trim();
		const payload =
			mode.value === 'login'
				? await loginByPassword({ username, password: form.password })
				: await registerByPassword({
						username,
						password: form.password,
						nickname: form.nickname.trim() || username,
					});
		const { token, user } = normalizeAuthPayload(payload);
		if (!user?.id && !user?.userId) {
			throw new Error('登录成功但未返回用户信息');
		}
		memberStore.setUserInfo({
			...user,
			username: user.username || username,
			nickname: user.nickname || form.nickname.trim() || username,
		});
		if (token) {
			uni.setStorageSync('token', token);
		}
		uni.showToast({ title: mode.value === 'login' ? '登录成功' : '注册成功', icon: 'success' });
		setTimeout(() => {
			uni.switchTab({ url: '/pages/mine/mine' });
		}, 600);
	} catch (error) {
		uni.showToast({ title: getAuthErrorMessage(error), icon: 'none' });
	} finally {
		submitting.value = false;
	}
};

const goBack = () => {
	try {
		uni.navigateBack();
	} catch (_) {
		uni.switchTab({ url: '/pages/mine/mine' });
	}
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.login-page {
	min-height: 100vh;
	background: #f5f7fb;
}

.login-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16rpx 24rpx;
	background: #fff;
	box-shadow: 0 2rpx 8rpx rgba(15, 23, 42, 0.04);
}

.back-btn,
.header-placeholder {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
}

.back-icon {
	font-size: 40rpx;
	color: #1f2937;
}

.header-title {
	font-size: 32rpx;
	font-weight: 700;
	color: #111827;
}

.login-main {
	padding: 52rpx 32rpx 0;
}

.brand-block {
	margin-bottom: 36rpx;
}

.brand-title {
	display: block;
	font-size: 46rpx;
	font-weight: 800;
	color: #0f2f70;
}

.brand-desc {
	display: block;
	margin-top: 16rpx;
	font-size: 26rpx;
	line-height: 1.7;
	color: #6b7280;
}

.form-panel {
	background: #fff;
	border-radius: 24rpx;
	padding: 28rpx;
	box-shadow: 0 12rpx 32rpx rgba(15, 23, 42, 0.06);
}

.mode-switch {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12rpx;
	padding: 8rpx;
	border-radius: 999rpx;
	background: #eef2f7;
	margin-bottom: 30rpx;
}

.mode-item {
	height: 68rpx;
	line-height: 68rpx;
	border-radius: 999rpx;
	text-align: center;
	font-size: 28rpx;
	font-weight: 600;
	color: #64748b;
}

.mode-item.active {
	background: $uni-color-primary;
	color: #fff;
	box-shadow: 0 8rpx 18rpx rgba(2, 57, 147, 0.18);
}

.form-item {
	margin-bottom: 24rpx;
}

.label {
	display: block;
	margin-bottom: 12rpx;
	font-size: 25rpx;
	font-weight: 600;
	color: #374151;
}

.input-wrap {
	position: relative;
}

.input {
	width: 100%;
	height: 82rpx;
	padding: 0 22rpx;
	border-radius: 16rpx;
	background: #f8fafc;
	border: 1rpx solid #e5e7eb;
	font-size: 28rpx;
	color: #111827;
	box-sizing: border-box;
}

.input-with-icon {
	padding-right: 90rpx;
}

.password-toggle {
	position: absolute;
	top: 0;
	right: 0;
	width: 84rpx;
	height: 82rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.eye-icon {
	position: relative;
	width: 38rpx;
	height: 24rpx;
	border: 3rpx solid #64748b;
	border-radius: 50%;
	box-sizing: border-box;
}

.eye-dot {
	position: absolute;
	left: 50%;
	top: 50%;
	width: 10rpx;
	height: 10rpx;
	margin-left: -5rpx;
	margin-top: -5rpx;
	border-radius: 50%;
	background: #64748b;
}

.eye-icon.closed::after {
	content: '';
	position: absolute;
	left: -7rpx;
	top: 9rpx;
	width: 50rpx;
	height: 3rpx;
	border-radius: 999rpx;
	background: #64748b;
	transform: rotate(-38deg);
	transform-origin: center;
}

.eye-icon.open {
	border-color: $uni-color-primary;
}

.eye-icon.open .eye-dot {
	background: $uni-color-primary;
}

.submit-btn {
	height: 84rpx;
	line-height: 84rpx;
	margin-top: 32rpx;
	border-radius: 999rpx;
	background: $uni-color-primary;
	color: #fff;
	font-size: 30rpx;
	font-weight: 700;
	border: none;
}

.submit-btn::after {
	border: none;
}

.submit-btn[disabled] {
	opacity: 0.7;
}

.tips {
	display: block;
	margin-top: 22rpx;
	font-size: 23rpx;
	line-height: 1.6;
	text-align: center;
	color: #7b8798;
}
</style>
