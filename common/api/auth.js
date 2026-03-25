import { httpRequest } from './request.js';

// 微信登录
export const wxLogin = ({ code, nickName, avatarUrl }) => {
	return httpRequest({
		url: '/api/auth/wx-login',
		method: 'POST',
		header: { 'Content-Type': 'application/json' },
		data: { code, nickName, avatarUrl },
	});
};

// 微信手机号登录（自动注册 / 登录）
export const wxPhoneLogin = ({ code, phoneCode, encryptedData, iv, nickName, avatarUrl }) => {
	return httpRequest({
		url: '/api/auth/wx-phone-login',
		method: 'POST',
		header: { 'Content-Type': 'application/json' },
		data: { code, phoneCode, encryptedData, iv, nickName, avatarUrl },
	});
};