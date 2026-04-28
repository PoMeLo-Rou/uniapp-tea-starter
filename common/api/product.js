import { httpRequest } from './request.js';

const JSON_HEADER = { 'Content-Type': 'application/json' };

const isFallbackableError = (error) => {
	const message = String(error?.message || '').toLowerCase();
	return (
		message.includes('(400)') ||
		message.includes('(404)') ||
		message.includes('(405)') ||
		message.includes('(501)') ||
		message.includes('cannot get') ||
		message.includes('cannot post') ||
		message.includes('cannot patch') ||
		message.includes('cannot put') ||
		message.includes('not found')
	);
};

const requestWithFallbacks = async (requestFactories) => {
	let lastError = null;
	for (const createRequest of requestFactories) {
		try {
			return await createRequest();
		} catch (error) {
			lastError = error;
			if (!isFallbackableError(error)) {
				throw error;
			}
		}
	}
	throw lastError || new Error('请求失败');
};

const normalizeProductList = (payload) => {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.list)) return payload.list;
	if (Array.isArray(payload?.rows)) return payload.rows;
	if (Array.isArray(payload?.records)) return payload.records;
	if (Array.isArray(payload?.data)) return payload.data;
	return [];
};

const mergeProductLists = (...payloads) => {
	const productMap = new Map();
	payloads.forEach((payload) => {
		normalizeProductList(payload).forEach((item) => {
			if (!item) return;
			const key = item.id ?? item.productId ?? `${item.name || 'product'}-${productMap.size}`;
			const previous = productMap.get(key) || {};
			productMap.set(key, {
				...previous,
				...item,
			});
		});
	});
	return Array.from(productMap.values());
};

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

export const fetchAdminProducts = (params = {}) => {
	const mergedParams = {
		...params,
		status: params.status ?? 'all',
		includeInactive: params.includeInactive ?? true,
		includeDisabled: params.includeDisabled ?? true,
		adminView: params.adminView ?? true,
	};

	return requestWithFallbacks([
		() =>
			httpRequest({
				url: '/api/admin/products',
				method: 'GET',
				data: mergedParams,
			}),
		async () => {
			const [onSaleProducts, offSaleProducts] = await Promise.all([
				httpRequest({
					url: '/api/products',
					method: 'GET',
					data: {
						...params,
						status: 1,
					},
				}),
				httpRequest({
					url: '/api/products',
					method: 'GET',
					data: {
						...params,
						status: 0,
					},
				}),
			]);
			return mergeProductLists(onSaleProducts, offSaleProducts);
		},
		async () => {
			const [onSaleProducts, offSaleProducts] = await Promise.all([
				httpRequest({
					url: '/api/products',
					method: 'GET',
					data: {
						...params,
						status: 'on',
					},
				}),
				httpRequest({
					url: '/api/products',
					method: 'GET',
					data: {
						...params,
						status: 'off',
					},
				}),
			]);
			return mergeProductLists(onSaleProducts, offSaleProducts);
		},
		async () => {
			const [onSaleProducts, offSaleProducts] = await Promise.all([
				httpRequest({
					url: '/api/products',
					method: 'GET',
					data: {
						...params,
						status: 'active',
					},
				}),
				httpRequest({
					url: '/api/products',
					method: 'GET',
					data: {
						...params,
						status: 'inactive',
					},
				}),
			]);
			return mergeProductLists(onSaleProducts, offSaleProducts);
		},
		() =>
			httpRequest({
				url: '/api/products',
				method: 'GET',
				data: mergedParams,
			}),
		() =>
			httpRequest({
				url: '/api/products',
				method: 'GET',
				data: {
					...params,
					status: 'all',
					includeInactive: true,
				},
			}),
		() =>
			httpRequest({
				url: '/api/products',
				method: 'GET',
				data: params,
			}),
	]);
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
		header: JSON_HEADER,
		data: payload,
	});
};

export const updateProductStatus = (productId, onSale) => {
	return httpRequest({
		url: `/api/products/${productId}/status`,
		method: 'PATCH',
		header: JSON_HEADER,
		data: { status: onSale ? 1 : 0 },
	});
};

export const updateProductSpecs = (productId, specGroups) => {
	return httpRequest({
		url: `/api/products/${productId}/specs`,
		method: 'PUT',
		header: JSON_HEADER,
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
				} catch (_) {
					reject(new Error('图片上传返回格式错误'));
				}
			},
			fail: (err) => reject(new Error(err.errMsg || '图片上传失败')),
		});
	});
};
