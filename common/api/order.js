import { httpRequest } from './request.js';

// 订单相关 API 封装

// 创建订单
export const createOrder = (payload) => {
	return httpRequest({
		url: '/api/orders',
		method: 'POST',
		header: { 'Content-Type': 'application/json' },
		data: payload,
	});
};

// 模拟支付
export const payOrder = (orderId) => {
	return httpRequest({
		url: `/api/orders/${orderId}/pay`,
		method: 'POST',
		header: { 'Content-Type': 'application/json' },
	});
};

// 确认取货
export const confirmOrderPickup = (orderId) => {
	return httpRequest({
		url: `/api/orders/${orderId}/confirm-pickup`,
		method: 'POST',
		header: { 'Content-Type': 'application/json' },
	});
};

// 订单列表
export const fetchOrderList = (params) => {
	return httpRequest({
		url: '/api/orders',
		method: 'GET',
		data: params,
	});
};

// 订单详情
export const fetchOrderDetail = (id) => {
	return httpRequest({
		url: `/api/orders/${id}`,
		method: 'GET',
	});
};

