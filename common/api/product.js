import { httpRequest } from './request.js';

// 商品 & 分类相关 API

export const fetchCategories = () => {
	return httpRequest({
		url: '/api/categories',
		method: 'GET',
	});
};

export const fetchProducts = (params) => {
	return httpRequest({
		url: '/api/products',
		method: 'GET',
		data: params,
	});
};

export const fetchProductSpecs = (productId) => {
	return httpRequest({
		url: `/api/products/${productId}/specs`,
		method: 'GET',
	});
};

export const fetchRecommendProducts = () => {
	return httpRequest({
		url: '/api/products/recommend',
		method: 'GET',
	});
};

export const updateProduct = (productId, payload) => {
	return httpRequest({
		url: `/api/products/${productId}`,
		method: 'PUT',
		header: { 'Content-Type': 'application/json' },
		data: payload,
	});
};export const updateProductStatus = (productId, onSale) => {
	return httpRequest({
		url: `/api/products/${productId}/status`,
		method: 'PATCH',
		header: { 'Content-Type': 'application/json' },
		data: { status: onSale ? 1 : 0 },
	});
};export const updateProductSpecs = (productId, specGroups) => {
	return httpRequest({
		url: `/api/products/${productId}/specs`,
		method: 'PUT',
		header: { 'Content-Type': 'application/json' },
		data: specGroups,
	});
};

export const uploadProductImage = (filePath) => {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: '/api/upload/product-image',
			name: 'file',
			filePath,
			success: (res) => {
				try {
					const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
					if (res.statusCode >= 200 && res.statusCode < 300) {
						const imageUrl = data?.url || data?.data?.url || data?.data?.path || '';
						if (!imageUrl) {
							reject(new Error('上传成功但未返回图片地址'));
							return;
						}
						resolve(imageUrl);
						return;
					}
					reject(new Error(data?.message || `上传失败 (${res.statusCode})`));
				} catch (e) {
					reject(new Error('图片上传返回格式错误'));
				}
			},
			fail: (err) => reject(new Error(err.errMsg || '图片上传失败')),
		});
	});
};
