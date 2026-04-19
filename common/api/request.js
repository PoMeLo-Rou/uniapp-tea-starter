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

// 【小程序必改】微信开发者工具里 localhost 连不通，请改成你电脑的本机 IP（在 cmd 输入 ipconfig 查看 IPv4）
const MINI_DEV_BASE = 'http://172.20.10.1:8080'; // 例：192.168.10.229，端口与后端一致

function getApiBaseUrl() {
	if (typeof process !== 'undefined' && process.env) {
		if (process.env.VUE_APP_API_BASE) return process.env.VUE_APP_API_BASE;
		// 小程序开发环境不能使用 localhost，否则会请求超时
		if (process.env.NODE_ENV === 'development') return MINI_DEV_BASE;
		return 'https://your-prod-domain.com';
	}
	return MINI_DEV_BASE;
}

const API_BASE_URL = getApiBaseUrl().replace(/\/+$/, '');

export const getApiBase = getApiBaseUrl;

export const normalizeImageUrl = (url) => {
	if (!url) return url;
	if (!url.startsWith('http')) {
		return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
	}
	try {
		const parsed = new URL(url);
		const base = new URL(API_BASE_URL);
		if (parsed.pathname.startsWith('/uploads')) {
			parsed.hostname = base.hostname;
			parsed.port = base.port;
			parsed.protocol = base.protocol;
			return parsed.toString();
		}
		return url;
	} catch (e) {
		return url;
	}
};

const httpInterceptor = {
	invoke(options) {
		// 1. 非 http 开头需拼接地址
		if (!options.url.startsWith('http')) {
			options.url = getApiBaseUrl() + options.url;
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
