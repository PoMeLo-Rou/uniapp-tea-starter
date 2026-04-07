<template>
	<view class="page" :style="{ paddingTop: safeAreaInsets.top + 'px' }">
		<view class="header">
			<view class="header-top">
				<button class="back-btn" @click="goBack">返回</button>
				<text class="title">管理员商品管理</text>
				<view class="header-placeholder"></view>
			</view>
			<text class="subtitle">支持上下架、描述/规格修改、商品图上传</text>
			<view class="toolbar card">
				<input v-model="keyword" class="search-input" placeholder="搜索商品名称" />
				<scroll-view scroll-x class="category-scroll" show-scrollbar="false">
					<view class="category-list">
						<view class="category-item" :class="{ active: selectedCategoryId === 0 }"
							@click="selectedCategoryId = 0">
							全部
						</view>
						<view v-for="cat in categories" :key="cat.id" class="category-item"
							:class="{ active: selectedCategoryId === cat.id }" @click="selectedCategoryId = cat.id">
							{{ cat.name }}
						</view>
					</view>
				</scroll-view>
			</view>
		</view>


		<scroll-view scroll-y class="product-list">
			<view v-for="item in filteredProducts" :key="item.id" class="product-card card">
				<image :src="item.image || defaultImage" class="product-image" mode="aspectFill" />
				<view class="product-main">
					<view class="name-row">
						<text class="product-name">{{ item.name }}</text>
						<text class="status-tag" :class="{ off: !isOnSale(item) }">
							{{ isOnSale(item) ? '上架中' : '已下架' }}
						</text>
					</view>
					<text class="desc">{{ item.desc || '暂无描述' }}</text>
					<view class="bottom-row">
						<text class="price">¥{{ item.price }}</text>
						<view class="actions">
							<button class="mini-btn ghost" @click="toggleStatus(item)">
								{{ isOnSale(item) ? '下架' : '上架' }}
							</button>
							<button class="mini-btn primary" @click="openEditor(item)">编辑</button>
						</view>
					</view>
				</view>
			</view>
			<view v-if="!filteredProducts.length" class="empty">暂无匹配商品</view>
			<view style="height: 40rpx"></view>
		</scroll-view>

		<view v-if="showEditor" class="mask" @click="closeEditor">
			<view class="editor" @click.stop>
				<view class="editor-head">
					<text class="editor-title">编辑商品</text>
					<view class="editor-head-actions">
						<button class="mini-btn primary" :loading="saving" @click="saveProduct">保存</button>
						<text class="close" @click="closeEditor">关闭</text>
					</view>
				</view>

				<scroll-view scroll-y class="editor-body">
					<view class="form-item">
						<text class="label">商品名</text>
						<input v-model="form.name" class="input" placeholder="请输入商品名" />
					</view>
					<view class="form-item">
						<text class="label">商品描述</text>
						<textarea v-model="form.desc" class="textarea" maxlength="300" placeholder="请输入商品描述" />
					</view>
					<view class="form-item">
						<text class="label">价格</text>
						<input v-model="form.price" class="input" type="digit" placeholder="请输入价格" />
					</view>
					<view class="form-item">
						<text class="label">商品图</text>
						<view class="upload-row">
							<image :src="form.image || defaultImage" class="preview" mode="aspectFill" />
							<button class="mini-btn primary" :loading="uploading" @click="chooseAndUploadImage">
								{{ uploading ? '上传中' : '选择并上传' }}
							</button>
						</view>
					</view>

					<view class="spec-section">
						<view class="spec-head">
							<text class="label">规格分组</text>
							<button class="mini-btn ghost" @click="addSpecGroup">新增分组</button>
						</view>
						<view v-for="(group, idx) in specDraft" :key="idx" class="spec-card">
							<view class="spec-row">
								<input v-model="group.groupName" class="input" placeholder="分组名称，如 甜度" />
								<input v-model="group.groupCode" class="input" placeholder="分组编码，如 sweet" />
							</view>
							<textarea v-model="group.optionsText" class="textarea" placeholder="选项用逗号分隔，如 全糖,半糖,少糖" />
							<view class="remove-wrap">
								<button class="mini-btn danger" @click="removeSpecGroup(idx)">删除分组</button>
							</view>
						</view>
					</view>
				</scroll-view>

				<view class="editor-footer">
					<button class="big-btn ghost" @click="closeEditor">取消</button>
					<button class="big-btn primary" :loading="saving" @click="saveProduct">保存</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
const { safeAreaInsets } = uni.getSystemInfoSync();

import { computed, reactive, ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import {
	fetchCategories,
	fetchProducts,
	fetchProductSpecs,
	updateProduct,
	updateProductStatus,
	updateProductSpecs,
	uploadProductImage,
} from '@/common/api/product.js';
import { useMemberStore } from '@/stores/modules/member.js';

const defaultImage = 'https://dummyimage.com/200x200/f3f4f6/9ca3af&text=Tea';
const memberStore = useMemberStore();

const loading = ref(false);
const saving = ref(false);
const uploading = ref(false);
const showEditor = ref(false);
const keyword = ref('');
const selectedCategoryId = ref(0);

const categories = ref([]);
const products = ref([]);

const form = reactive({
	id: null,
	name: '',
	desc: '',
	price: '',
	image: '',
	category_id: null,
	status: 1,
});

const specDraft = ref([]);

const isOnSale = (product) => {
	if (product.status === undefined || product.status === null) return true;
	if (typeof product.status === 'number') return product.status === 1;
	const status = String(product.status).toLowerCase();
	return status === '1' || status === 'on' || status === 'onsale' || status === 'on_sale' || status === 'active';
};

const normalizeSpecDraft = (groups) => {
	return (groups || []).map((g) => ({
		id: g.id || null,
		groupName: g.groupName || '',
		groupCode: g.groupCode || '',
		options: Array.isArray(g.options) ? g.options : [],
		optionsText: (Array.isArray(g.options) ? g.options : []).map((opt) => opt.name).join('，'),
	}));
};

const buildSpecsPayload = () => {
	return specDraft.value
		.map((group) => {
			const names = String(group.optionsText || '')
				.split(/[，,、]/)
				.map((s) => s.trim())
				.filter(Boolean);
			const oldOptions = Array.isArray(group.options) ? group.options : [];
			return {
				id: group.id || undefined,
				groupName: (group.groupName || '').trim(),
				groupCode: (group.groupCode || '').trim(),
				options: names.map((name, idx) => {
					const old = oldOptions[idx] || {};
					return {
						id: old.id || undefined,
						code: old.code || undefined,
						name,
					};
				}),
			};
		})
		.filter((group) => group.groupName && group.groupCode);
};

const filteredProducts = computed(() => {
	const key = keyword.value.trim().toLowerCase();
	return products.value.filter((p) => {
		const matchCategory = selectedCategoryId.value === 0 || p.category_id === selectedCategoryId.value;
		if (!matchCategory) return false;
		if (!key) return true;
		return String(p.name || '').toLowerCase().includes(key);
	});
});

const ensureAdminAccess = () => {
	if (!memberStore.isLoggedIn) {
		uni.showToast({ title: '请先登录', icon: 'none' });
		uni.switchTab({ url: '/pages/mine/mine' });
		return false;
	}
	if (!memberStore.isAdmin) {
		uni.showToast({ title: '无管理员权限', icon: 'none' });
		uni.switchTab({ url: '/pages/mine/mine' });
		return false;
	}
	return true;
};

const loadData = async () => {
	loading.value = true;
	try {
		const [categoryList, productList] = await Promise.all([fetchCategories(), fetchProducts()]);
		categories.value = categoryList || [];
		products.value = productList || [];
	} catch (e) {
		uni.showToast({ title: e.message || '加载失败', icon: 'none' });
	} finally {
		loading.value = false;
	}
};

const toggleStatus = async (item) => {
	const nextOnSale = !isOnSale(item);
	try {
		await updateProductStatus(item.id, nextOnSale);
		item.status = nextOnSale ? 1 : 0;
		uni.showToast({ title: nextOnSale ? '已上架' : '已下架', icon: 'success' });
	} catch (e) {
		uni.showToast({ title: e.message || '更新状态失败', icon: 'none' });
	}
};

const openEditor = async (item) => {
	form.id = item.id;
	form.name = item.name || '';
	form.desc = item.desc || '';
	form.price = String(item.price ?? '');
	form.image = item.image || '';
	form.category_id = item.category_id || null;
	form.status = isOnSale(item) ? 1 : 0;
	specDraft.value = [];
	showEditor.value = true;
	try {
		const groups = await fetchProductSpecs(item.id);
		specDraft.value = normalizeSpecDraft(groups);
	} catch (e) {
		uni.showToast({ title: '规格加载失败，可直接保存基础信息', icon: 'none' });
	}
};

const closeEditor = () => {
	showEditor.value = false;
};

const chooseAndUploadImage = () => {
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		success: async (res) => {
			const filePath = res.tempFilePaths && res.tempFilePaths[0];
			if (!filePath) return;
			uploading.value = true;
			try {
				const imageUrl = await uploadProductImage(filePath);
				form.image = imageUrl;
				uni.showToast({ title: '上传成功', icon: 'success' });
			} catch (e) {
				uni.showToast({ title: e.message || '上传失败', icon: 'none' });
			} finally {
				uploading.value = false;
			}
		},
	});
};

const addSpecGroup = () => {
	specDraft.value.push({
		id: null,
		groupName: '',
		groupCode: '',
		options: [],
		optionsText: '',
	});
};

const removeSpecGroup = (idx) => {
	specDraft.value.splice(idx, 1);
};

const goBack = () => {
	uni.switchTab({ url: '/pages/mine/mine' });
};

const saveProduct = async () => {
	if (!form.id) return;
	if (!form.name.trim()) {
		uni.showToast({ title: '请输入商品名', icon: 'none' });
		return;
	}
	const priceNum = Number(form.price);
	if (Number.isNaN(priceNum) || priceNum < 0) {
		uni.showToast({ title: '价格格式不正确', icon: 'none' });
		return;
	}
	saving.value = true;
	try {
		await updateProduct(form.id, {
			name: form.name.trim(),
			desc: form.desc.trim(),
			price: priceNum,
			image: form.image,
			category_id: form.category_id,
			status: form.status,
		});
		await updateProductSpecs(form.id, buildSpecsPayload());

		const target = products.value.find((p) => p.id === form.id);
		if (target) {
			target.name = form.name.trim();
			target.desc = form.desc.trim();
			target.price = priceNum;
			target.image = form.image;
			target.status = form.status;
		}

		uni.showToast({ title: '保存成功', icon: 'success' });
		closeEditor();
	} catch (e) {
		uni.showToast({ title: e.message || '保存失败', icon: 'none' });
	} finally {
		saving.value = false;
	}
};

onLoad(() => {
	if (!ensureAdminAccess()) return;
	loadData();
});

onShow(() => {
	ensureAdminAccess();
});
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	background: #f6f7fb;
	padding: 24rpx;
	box-sizing: border-box;
}

.card {
	background: #fff;
	border-radius: 18rpx;
	box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.04);
}

.header {
	padding: 10rpx 4rpx 20rpx;

	.header-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.header-placeholder {
		width: 110rpx;
	}

	.title {
		display: block;
		font-size: 34rpx;
		font-weight: 700;
		color: #1f2937;
	}

	.subtitle {
		display: block;
		margin-top: 8rpx;
		color: #6b7280;
		font-size: 24rpx;
	}
}

.back-btn {
	margin: 0;
	width: 110rpx;
	height: 58rpx;
	line-height: 58rpx;
	border-radius: 999rpx;
	background: #e5e7eb;
	color: #111827;
	font-size: 24rpx;
	padding: 0;

	&::after {
		border: none;
	}
}

.toolbar {
	padding: 20rpx;
	margin-top: 20rpx;
}

.search-input {
	height: 72rpx;
	background: #f3f4f6;
	border-radius: 12rpx;
	padding: 0 22rpx;
	font-size: 26rpx;
}

.category-scroll {
	margin-top: 16rpx;
	white-space: nowrap;
}

.category-list {
	display: inline-flex;
	gap: 16rpx;
}

.category-item {
	padding: 10rpx 22rpx;
	background: #f3f4f6;
	color: #4b5563;
	border-radius: 999rpx;
	font-size: 24rpx;

	&.active {
		background: #023993;
		color: #fff;
	}
}

.product-list {
	height: calc(100vh - 260rpx);
	margin-top: 20rpx;
}

.product-card {
	display: flex;
	padding: 18rpx;
	margin-bottom: 18rpx;
}

.product-image {
	width: 160rpx;
	height: 160rpx;
	border-radius: 12rpx;
	background: #eef0f4;
}

.product-main {
	flex: 1;
	margin-left: 18rpx;
	min-width: 0;
}

.name-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.product-name {
	font-size: 30rpx;
	font-weight: 600;
	color: #111827;
}

.status-tag {
	padding: 4rpx 14rpx;
	border-radius: 999rpx;
	font-size: 20rpx;
	background: #dcfce7;
	color: #15803d;

	&.off {
		background: #fee2e2;
		color: #b91c1c;
	}
}

.desc {
	margin-top: 8rpx;
	font-size: 23rpx;
	color: #6b7280;
	overflow: hidden;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.bottom-row {
	margin-top: 16rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.price {
	color: #111827;
	font-size: 30rpx;
	font-weight: 700;
}

.actions {
	display: flex;
	gap: 12rpx;
}

.mini-btn {
	height: 58rpx;
	line-height: 58rpx;
	padding: 0 22rpx;
	border-radius: 999rpx;
	font-size: 24rpx;

	&::after {
		border: none;
	}

	&.primary {
		background: #023993;
		color: #fff;
	}

	&.ghost {
		background: #eff6ff;
		color: #1d4ed8;
	}

	&.danger {
		background: #fff1f2;
		color: #be123c;
	}
}

.empty {
	text-align: center;
	font-size: 26rpx;
	color: #9ca3af;
	padding: 120rpx 0;
}

.mask {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.45);
	z-index: 999;
	display: flex;
	align-items: flex-end;
}

.editor {
	width: 100%;
	height: 86vh;
	background: #fff;
	border-top-left-radius: 24rpx;
	border-top-right-radius: 24rpx;
	display: flex;
	flex-direction: column;
}

.editor-head {
	height: 100rpx;
	padding: 30rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1rpx solid #f1f5f9;
}

.editor-head-actions {
	display: flex;
	align-items: center;
	gap: 14rpx;
}

.editor-title {
	font-size: 32rpx;
	font-weight: 700;
}

.close {
	color: #6b7280;
	font-size: 26rpx;
}

.editor-body {
	flex: 1;
	padding: 24rpx 30rpx;
	box-sizing: border-box;
}

.form-item {
	margin-bottom: 22rpx;
}

.label {
	display: block;
	font-size: 24rpx;
	color: #374151;
	margin-bottom: 10rpx;
}

.input {
	height: 72rpx;
	background: #f8fafc;
	border-radius: 12rpx;
	padding: 0 18rpx;
	font-size: 25rpx;
}

.textarea {
	width: 100%;
	min-height: 130rpx;
	background: #f8fafc;
	border-radius: 12rpx;
	padding: 14rpx 18rpx;
	font-size: 25rpx;
	box-sizing: border-box;
}

.upload-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.preview {
	width: 140rpx;
	height: 140rpx;
	border-radius: 12rpx;
	background: #eef0f4;
}

.spec-section {
	margin-top: 20rpx;
}

.spec-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.spec-card {
	margin-top: 16rpx;
	padding: 16rpx;
	background: #f8fafc;
	border-radius: 12rpx;
}

.spec-row {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12rpx;
	margin-bottom: 12rpx;
}

.remove-wrap {
	margin-top: 10rpx;
	display: flex;
	justify-content: flex-end;
}

.editor-footer {
	height: 120rpx;
	padding: 14rpx 24rpx calc(14rpx + env(safe-area-inset-bottom));
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20rpx;
	border-top: 1rpx solid #f1f5f9;
	box-sizing: border-box;
}

.big-btn {
	height: 76rpx;
	line-height: 76rpx;
	border-radius: 999rpx;
	font-size: 28rpx;

	&::after {
		border: none;
	}

	&.primary {
		background: #023993;
		color: #fff;
	}

	&.ghost {
		background: #e5e7eb;
		color: #111827;
	}
}
</style>
