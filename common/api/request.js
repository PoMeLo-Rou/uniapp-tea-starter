const MINI_DEV_BASE = 'http://localhost:8080';

function getApiBaseUrl() {
	if (typeof process !== 'undefined' && process.env) {
		if (process.env.VUE_APP_API_BASE) return process.env.VUE_APP_API_BASE;
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
	} catch (_) {
		return url;
	}
};

const httpInterceptor = {
	invoke(options) {
		if (!options.url.startsWith('http')) {
			options.url = getApiBaseUrl() + options.url;
		}
		options.timeout = 10000;
		options.header = {
			'source-client': 'miniapp',
			...options.header,
		};
		const token = uni.getStorageSync('token');
		if (token) {
			options.header.Authorization = token;
		}
	},
};

uni.addInterceptor('request', httpInterceptor);
uni.addInterceptor('uploadFile', httpInterceptor);

export const httpRequest = (options) => {
	return new Promise((resolve, reject) => {
		uni.request({
			...options,
			success: (res) => {
				if (res.statusCode >= 200 && res.statusCode < 300) {
					resolve(res.data);
					return;
				}

				if (res.statusCode === 401) {
					if (shouldRedirectToLogin(options, res)) {
						uni.navigateTo({ url: '/pages/login/login' });
					}
					reject(createHttpError(res, options, '登录状态已失效，请重新登录'));
					return;
				}

				reject(createHttpError(res, options));
			},
			fail: (err) => {
				const error = new Error(err.errMsg || '网络连接失败，请检查后端服务是否启动');
				error.errMsg = err.errMsg || '';
				error.url = options.url || '';
				reject(error);
			},
		});
	});
};

function shouldRedirectToLogin(options = {}, res = {}) {
	const url = String(options.url || '');
	const data = normalizeErrorData(res.data);
	const code = String(data?.code || data?.errorCode || '').toUpperCase();

	if (url.includes('/api/auth/login') || url.includes('/api/auth/register')) {
		return false;
	}
	if (code.includes('PASSWORD_ERROR') || code.includes('BAD_CREDENTIALS')) {
		return false;
	}

	const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
	const current = pages[pages.length - 1];
	const route = `/${current?.route || ''}`;
	return route !== '/pages/login/login';
}

function createHttpError(res, options = {}, fallbackMessage = '') {
	const data = normalizeErrorData(res.data);
	const message =
		data?.message ||
		data?.msg ||
		data?.error ||
		data?.detail ||
		fallbackMessage ||
		`请求失败 (${res.statusCode})`;
	const error = new Error(String(message));
	error.statusCode = res.statusCode;
	error.data = data;
	error.rawData = res.data;
	error.url = options.url || '';
	return error;
}

function normalizeErrorData(data) {
	if (!data) return {};
	if (typeof data === 'object') return data;
	const text = String(data);
	try {
		return JSON.parse(text);
	} catch (_) {
		return {
			message: extractHtmlErrorText(text) || text,
			rawText: text,
		};
	}
}

function extractHtmlErrorText(text) {
	const content = text.match(/<pre>([\s\S]*?)<\/pre>/i)?.[1] || text.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1];
	if (!content) return '';
	return content
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}
