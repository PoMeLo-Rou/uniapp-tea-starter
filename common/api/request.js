/**
 * 添加拦截器:
 *   拦截 request 请求
 *   拦截 uploadFile 文件上传
 *
 *   1. 非 http 开头需拼接地址
 *   2. 请求超时
 *   3. 添加小程序端请求头标识
 *   4. 添加 token 请求头标识
 */

const API_BASE =
	process.env.NODE_ENV === 'development'
		? 'http://localhost:8080'
		// TODO: 上线后把这里改成你的线上域名，例如 https://api.yourdomain.com
		: 'https://your-prod-domain.com';

export const getApiBase = () => API_BASE;

const httpInterceptor = {
	invoke(options) {
		// 1. 非 http 开头需拼接地址
		if (!options.url.startsWith('http')) {
			options.url = API_BASE + options.url;
		}
		// 2. 请求超时，默认 10 秒
		options.timeout = 10000;
		// 3. 添加小程序端请求头标识
		options.header = {
			'source-client': 'miniapp',
			...options.header,
		};
		// 4. 添加 token 请求头标识
		const token = uni.getStorageSync('token');
		if (token) {
			options.header.Authorization = token;
		}
	},
};

uni.addInterceptor('request', httpInterceptor);
uni.addInterceptor('uploadFile', httpInterceptor);

/**
 * 通用请求封装 —— Promise 化 uni.request 并统一处理响应状态
 */
export const httpRequest = (options) => {
	return new Promise((resolve, reject) => {
		uni.request({
			...options,
			success: (res) => {
				if (res.statusCode >= 200 && res.statusCode < 300) {
					resolve(res.data);
				} else if (res.statusCode === 401) {
					uni.navigateTo({ url: '/pages/login/login' });
					reject(new Error(res.data?.message || '请先登录'));
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
