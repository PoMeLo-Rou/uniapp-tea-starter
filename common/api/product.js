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

