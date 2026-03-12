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

