import { httpRequest } from './request.js';

const JSON_HEADER = { 'Content-Type': 'application/json' };

const isFallbackableError = (error) => {
	const message = String(error?.message || '').toLowerCase();
	return (
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

export const createOrder = (payload) => {
	return httpRequest({
		url: '/api/orders',
		method: 'POST',
		header: JSON_HEADER,
		data: payload,
	});
};

export const payOrder = (orderId) => {
	return httpRequest({
		url: `/api/orders/${orderId}/pay`,
		method: 'POST',
		header: JSON_HEADER,
	});
};

export const confirmOrderPickup = (orderId) => {
	return httpRequest({
		url: `/api/orders/${orderId}/confirm-pickup`,
		method: 'POST',
		header: JSON_HEADER,
	});
};

export const fetchOrderList = (params) => {
	return httpRequest({
		url: '/api/orders',
		method: 'GET',
		data: params,
	});
};

export const fetchAdminOrderList = (params = {}) => {
	return requestWithFallbacks([
		() =>
			httpRequest({
				url: '/api/admin/orders',
				method: 'GET',
				data: params,
			}),
		() =>
			httpRequest({
				url: '/api/orders',
				method: 'GET',
				data: params,
			}),
	]);
};

export const fetchOrderDetail = (id) => {
	return httpRequest({
		url: `/api/orders/${id}`,
		method: 'GET',
	});
};

export const updateOrderStatus = (orderId, status) => {
	return requestWithFallbacks([
		() =>
			httpRequest({
				url: `/api/admin/orders/${orderId}/status`,
				method: 'PATCH',
				header: JSON_HEADER,
				data: { status },
			}),
		() =>
			httpRequest({
				url: `/api/orders/${orderId}/status`,
				method: 'PATCH',
				header: JSON_HEADER,
				data: { status },
			}),
		() =>
			httpRequest({
				url: `/api/admin/orders/${orderId}`,
				method: 'PUT',
				header: JSON_HEADER,
				data: { status },
			}),
		() =>
			httpRequest({
				url: `/api/orders/${orderId}`,
				method: 'PUT',
				header: JSON_HEADER,
				data: { status },
			}),
	]);
};
