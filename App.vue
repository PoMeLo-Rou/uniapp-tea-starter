<script>
import { socketManager } from '@/common/ws/socket.js';
import { useMemberStore } from '@/stores/modules/member.js';

const handleOrderStatusMessage = (msg = {}) => {
	const nextStatus = msg.newStatus || msg.status || msg?.data?.status || '';

	uni.$emit('order:status-changed', {
		...msg,
		status: nextStatus,
	});

	uni.showToast({
		title: msg.message || '订单状态已更新',
		icon: 'none',
		duration: 3000,
	});
};

export default {
	onLaunch() {
		this.initLoginStatus();
	},
	onShow() {
		this.checkAndConnectSocket();
	},
	methods: {
		initLoginStatus() {
			const member = uni.getStorageSync('member');
			if (!member) return;

			const memberStore = useMemberStore();
			memberStore.setUserInfo(member);
		},
		checkAndConnectSocket() {
			const member = uni.getStorageSync('member');
			if (!member?.userId) return;

			socketManager.connect(member.userId);
			socketManager.off('order_status', handleOrderStatusMessage);
			socketManager.on('order_status', handleOrderStatusMessage);
		},
	},
};
</script>
