import { httpRequest } from './request.js';

export const fetchSiteConfig = () => {
	return httpRequest({
		url: '/api/site-config',
		method: 'GET',
	});
};

export const updateSiteConfig = (payload) => {
	return httpRequest({
		url: '/api/admin/site-config',
		method: 'PUT',
		header: { 'Content-Type': 'application/json' },
		data: payload,
	});
};

export const uploadSiteImage = (filePath) => {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: '/api/upload/site-image',
			name: 'file',
			filePath,
			success: (res) => {
				try {
					const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
					if (res.statusCode >= 200 && res.statusCode < 300) {
						const imageUrl = data?.url || '';
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

export const deleteSiteImage = (url) => {
	return httpRequest({
		url: '/api/upload/site-image',
		method: 'DELETE',
		header: { 'Content-Type': 'application/json' },
		data: { url },
	});
};

export const fetchStoreDistance = ({ userLat, userLng }) => {
	return httpRequest({
		url: '/api/store/distance',
		method: 'GET',
		data: { userLat, userLng },
	});
};
