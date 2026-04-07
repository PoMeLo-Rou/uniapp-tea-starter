<template>
	<view class="page" :style="{ paddingTop: safeAreaInsets.top + 'px' }">
		<view class="header">
			<button class="back-btn" @click="goBack">返回</button>
			<text class="title">管理员展示配置</text>
			<view class="placeholder"></view>
		</view>

		<scroll-view scroll-y class="content">
			<view class="card">
				<text class="section-title">首页轮播图</text>
				<view class="banner-list">
					<view v-for="(url, idx) in form.homeBanners" :key="url + idx" class="banner-item">
						<image :src="url" class="banner-preview" mode="aspectFill" />
						<button class="mini danger" @click="removeHomeBanner(idx, url)">删除</button>
					</view>
				</view>
				<button class="mini primary" :loading="uploadingHomeBanner" @click="addHomeBanner">
					{{ uploadingHomeBanner ? '上传中' : '新增轮播图' }}
				</button>
			</view>

			<view class="card">
				<text class="section-title">点单页顶部图</text>
				<image :src="form.orderPageBanner || defaultBanner" class="order-banner" mode="aspectFill" />
				<view class="row">
					<button class="mini primary" :loading="uploadingOrderBanner" @click="changeOrderBanner">
						{{ uploadingOrderBanner ? '上传中' : '上传/替换图片' }}
					</button>
					<button class="mini danger" @click="clearOrderBanner">清空</button>
				</view>
				<input v-model="form.orderPageBannerText" class="input" placeholder="点单页图片文案" />
			</view>

			<view class="card">
				<text class="section-title">门店信息</text>
				<input v-model="form.storeName" class="input" placeholder="门店名称" />
				<input v-model="form.storeAddress" class="input" placeholder="门店地址" />
				<input v-model="form.pickupDistanceText" class="input" placeholder="自取距离文案" />
				<input v-model="form.deliveryAddressText" class="input" placeholder="外送地址提示文案" />
				<input v-model="form.deliveryStoreLine" class="input" placeholder="外送门店行文案" />
				<input v-model="form.storeSlogan" class="input" placeholder="门店口号文案" />
			</view>

			<button class="save-btn" :loading="saving" @click="saveAll">
				{{ saving ? '保存中...' : '保存全部配置' }}
			</button>
			<view style="height: 60rpx"></view>
		</scroll-view>
	</view>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { deleteSiteImage, fetchSiteConfig, updateSiteConfig, uploadSiteImage } from '@/common/api/site.js';
import { useMemberStore } from '@/stores/modules/member.js';

const { safeAreaInsets } = uni.getSystemInfoSync();
const memberStore = useMemberStore();
const defaultBanner = 'https://dummyimage.com/750x280/f3f4f6/9ca3af&text=Order+Banner';

const uploadingHomeBanner = ref(false);
const uploadingOrderBanner = ref(false);
const saving = ref(false);

const form = reactive({
	homeBanners: [],
	orderPageBanner: '',
	orderPageBannerText: '',
	storeName: '',
	storeAddress: '',
	pickupDistanceText: '',
	deliveryAddressText: '',
	deliveryStoreLine: '',
	storeSlogan: '',
});

const ensureAdminAccess = () => {
	if (!memberStore.isLoggedIn || !memberStore.isAdmin) {
		uni.showToast({ title: '无管理员权限', icon: 'none' });
		uni.switchTab({ url: '/pages/mine/mine' });
		return false;
	}
	return true;
};

const loadConfig = async () => {
	const data = await fetchSiteConfig();
	form.homeBanners = Array.isArray(data.homeBanners) ? data.homeBanners : [];
	form.orderPageBanner = data.orderPageBanner || '';
	form.orderPageBannerText = data.orderPageBannerText || '';
	form.storeName = data.storeName || '';
	form.storeAddress = data.storeAddress || '';
	form.pickupDistanceText = data.pickupDistanceText || '';
	form.deliveryAddressText = data.deliveryAddressText || '';
	form.deliveryStoreLine = data.deliveryStoreLine || '';
	form.storeSlogan = data.storeSlogan || '';
};

const chooseOneImage = () => {
	return new Promise((resolve, reject) => {
		uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			success: (res) => resolve((res.tempFilePaths || [])[0] || ''),
			fail: reject,
		});
	});
};

const addHomeBanner = async () => {
	uploadingHomeBanner.value = true;
	try {
		const filePath = await chooseOneImage();
		if (!filePath) return;
		const url = await uploadSiteImage(filePath);
		form.homeBanners.push(url);
	} catch (e) {
		uni.showToast({ title: e.message || '上传失败', icon: 'none' });
	} finally {
		uploadingHomeBanner.value = false;
	}
};

const removeHomeBanner = async (idx, url) => {
	form.homeBanners.splice(idx, 1);
	try {
		await deleteSiteImage(url);
	} catch (_) {
		// 删除失败不阻塞配置保存
	}
};

const changeOrderBanner = async () => {
	uploadingOrderBanner.value = true;
	try {
		const oldUrl = form.orderPageBanner;
		const filePath = await chooseOneImage();
		if (!filePath) return;
		const url = await uploadSiteImage(filePath);
		form.orderPageBanner = url;
		if (oldUrl) {
			try {
				await deleteSiteImage(oldUrl);
			} catch (_) {}
		}
	} catch (e) {
		uni.showToast({ title: e.message || '上传失败', icon: 'none' });
	} finally {
		uploadingOrderBanner.value = false;
	}
};

const clearOrderBanner = async () => {
	const oldUrl = form.orderPageBanner;
	form.orderPageBanner = '';
	if (!oldUrl) return;
	try {
		await deleteSiteImage(oldUrl);
	} catch (_) {}
};

const saveAll = async () => {
	saving.value = true;
	try {
		await updateSiteConfig({
			homeBanners: form.homeBanners,
			orderPageBanner: form.orderPageBanner,
			orderPageBannerText: form.orderPageBannerText,
			storeName: form.storeName,
			storeAddress: form.storeAddress,
			pickupDistanceText: form.pickupDistanceText,
			deliveryAddressText: form.deliveryAddressText,
			deliveryStoreLine: form.deliveryStoreLine,
			storeSlogan: form.storeSlogan,
		});
		uni.showToast({ title: '保存成功', icon: 'success' });
	} catch (e) {
		uni.showToast({ title: e.message || '保存失败', icon: 'none' });
	} finally {
		saving.value = false;
	}
};

const goBack = () => {
	uni.navigateBack();
};

onLoad(async () => {
	if (!ensureAdminAccess()) return;
	try {
		await loadConfig();
	} catch (e) {
		uni.showToast({ title: e.message || '配置加载失败', icon: 'none' });
	}
});
</script>

<style scoped lang="scss">
.page {
	min-height: 100vh;
	background: #f6f7fb;
	padding: 24rpx;
	box-sizing: border-box;
}

.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8rpx 0 20rpx;
}

.title {
	font-size: 34rpx;
	font-weight: 700;
	color: #1f2937;
}

.placeholder {
	width: 110rpx;
}

.back-btn {
	width: 110rpx;
	height: 58rpx;
	line-height: 58rpx;
	border-radius: 999rpx;
	background: #e5e7eb;
	font-size: 24rpx;
	padding: 0;
	margin: 0;
	&::after {
		border: none;
	}
}

.content {
	height: calc(100vh - 160rpx);
}

.card {
	background: #fff;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 18rpx;
}

.section-title {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	margin-bottom: 16rpx;
}

.banner-list {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 14rpx;
	margin-bottom: 14rpx;
}

.banner-item {
	background: #f8fafc;
	padding: 10rpx;
	border-radius: 12rpx;
}

.banner-preview {
	width: 100%;
	height: 180rpx;
	border-radius: 10rpx;
	background: #eef0f4;
	margin-bottom: 8rpx;
}

.order-banner {
	width: 100%;
	height: 220rpx;
	border-radius: 12rpx;
	background: #eef0f4;
	margin-bottom: 12rpx;
}

.row {
	display: flex;
	gap: 12rpx;
	margin-bottom: 12rpx;
}

.mini {
	height: 58rpx;
	line-height: 58rpx;
	padding: 0 18rpx;
	border-radius: 999rpx;
	font-size: 24rpx;
	margin: 0;
	&::after {
		border: none;
	}
	&.primary {
		background: #023993;
		color: #fff;
	}
	&.danger {
		background: #fff1f2;
		color: #be123c;
	}
}

.input {
	height: 72rpx;
	background: #f8fafc;
	border-radius: 12rpx;
	padding: 0 18rpx;
	font-size: 25rpx;
	margin-bottom: 12rpx;
}

.save-btn {
	height: 76rpx;
	line-height: 76rpx;
	border-radius: 999rpx;
	background: #023993;
	color: #fff;
	font-size: 28rpx;
	&::after {
		border: none;
	}
}
</style>
