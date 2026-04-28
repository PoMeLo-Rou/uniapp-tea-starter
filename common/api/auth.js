import { httpRequest } from './request.js';

const JSON_HEADER = { 'Content-Type': 'application/json' };

export const loginByPassword = ({ username, password }) => {
	return httpRequest({
		url: '/api/auth/login',
		method: 'POST',
		header: JSON_HEADER,
		data: { username, password },
	});
};

export const registerByPassword = ({ username, password, nickname }) => {
	return httpRequest({
		url: '/api/auth/register',
		method: 'POST',
		header: JSON_HEADER,
		data: { username, password, nickname },
	});
};

export const fetchCurrentUser = () => {
	return httpRequest({
		url: '/api/auth/me',
		method: 'GET',
	});
};
