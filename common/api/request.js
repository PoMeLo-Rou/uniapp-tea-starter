// 通用请求封装，统一管理 API_BASE 和错误处理
const API_BASE =
	process.env.NODE_ENV === 'development'
		? 'http://192.168.1.3:8080'
		// TODO: 上线后把这里改成你的线上域名，例如 https://api.yourdomain.com
		: 'https://your-prod-domain.com';

export const getApiBase = () => API_BASE;

export const httpRequest = (options) => {
	return new Promise((resolve, reject) => {
		uni.request({
			...options,
			url: options.url.startsWith('http') ? options.url : `${API_BASE}${options.url}`,
			success: (res) => {
				if (res.statusCode >= 200 && res.statusCode < 300) {
					resolve(res.data);
				} else {
					reject(new Error(res.data?.message || `请求失败 (${res.statusCode})`));
				}
			},
			fail: (err) => {
				reject(new Error(err.errMsg || '网络错误'));
			},
		});
	});
};

