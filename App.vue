<script>
	import { socketManager } from '@/common/ws/socket.js';
	
	export default {
	  onLaunch: function () {
		console.log('App Launch');
	  },
	  onShow: function () {
		console.log('App Show');
		// 应用显示时，如果已登录就连接 WebSocket
		const memberRaw = uni.getStorageSync('member');
		if (memberRaw && memberRaw.userId) {
		  socketManager.connect(memberRaw.userId);
	
		  // 监听订单状态推送
		  socketManager.on('order_status', (msg) => {
			console.log('[WS] 收到订单推送:', msg);
			uni.showToast({
			  title: msg.message,
			  icon: 'none',
			  duration: 3000,
			});
		  });
		}
	  },
	  onHide: function () {
		console.log('App Hide');
	  },
	}
	</script>
	
	<style>
	/*每个页面公共css */
	</style>