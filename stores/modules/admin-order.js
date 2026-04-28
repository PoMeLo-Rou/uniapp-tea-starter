import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { fetchAdminOrderList, updateOrderStatus as requestUpdateOrderStatus } from '@/common/api/order.js';
import { useMemberStore } from '@/stores/modules/member.js';

const POLL_INTERVAL = 5000;
const ACTIVE_STATUSES = ['paid', 'making', 'ready'];
const STATUS_SORT_WEIGHT = {
	paid: 0,
	making: 1,
	ready: 2,
	pending: 3,
	finished: 4,
	cancelled: 5,
};

const toNumber = (value) => {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
};

const parseItems = (items) => {
	if (Array.isArray(items)) return items;
	if (typeof items === 'string' && items) {
		try {
			const parsed = JSON.parse(items);
			return Array.isArray(parsed) ? parsed : [];
		} catch (_) {
			return [];
		}
	}
	return [];
};

const resolveOrderId = (order = {}) =>
	String(order.id ?? order.orderId ?? order.order_id ?? order.order_no ?? '');

const resolveTime = (order = {}) => {
	const candidate = order.paid_at || order.created_at || order.updated_at || '';
	const time = candidate ? new Date(candidate).getTime() : 0;
	return Number.isFinite(time) ? time : 0;
};

const normalizeOrder = (order = {}) => ({
	...order,
	id: resolveOrderId(order),
	status: String(order.status || 'pending'),
	items: parseItems(order.items),
	order_no: order.order_no || order.orderNo || `NO-${resolveOrderId(order)}`,
	order_type: order.order_type || order.orderType || 'pickup',
	store_name: order.store_name || order.storeName || '默认门店',
	total_amount: toNumber(order.total_amount ?? order.totalPrice ?? order.pay_amount),
	pay_amount: toNumber(order.pay_amount ?? order.total_amount ?? order.totalPrice),
	discount_amount: toNumber(order.discount_amount),
});

const unwrapOrderList = (payload) => {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.list)) return payload.list;
	if (Array.isArray(payload?.rows)) return payload.rows;
	if (Array.isArray(payload?.records)) return payload.records;
	if (Array.isArray(payload?.data)) return payload.data;
	return [];
};

const sortOrders = (left, right) => {
	const statusGap =
		(STATUS_SORT_WEIGHT[left.status] ?? 99) - (STATUS_SORT_WEIGHT[right.status] ?? 99);
	if (statusGap !== 0) return statusGap;
	return resolveTime(right) - resolveTime(left);
};

const emitNewOrderReminder = (orders) => {
	if (!orders.length) return;
	uni.$emit('admin:new-order', {
		count: orders.length,
		firstOrder: orders[0],
		orders,
		createdAt: new Date().toISOString(),
	});
};

export const useAdminOrderStore = defineStore('admin-order', () => {
	const orders = ref([]);
	const loading = ref(false);
	const refreshing = ref(false);
	const errorMessage = ref('');
	const lastFetchedAt = ref('');
	const initialized = ref(false);
	const seenPaidOrderIds = ref([]);
	const updatingIds = ref([]);
	const activeClients = ref(0);
	const pollTimer = ref(null);

	let inFlightPromise = null;

	const paidOrders = computed(() => orders.value.filter((item) => item.status === 'paid'));
	const makingOrders = computed(() => orders.value.filter((item) => item.status === 'making'));
	const readyOrders = computed(() => orders.value.filter((item) => item.status === 'ready'));
	const activeOrders = computed(() =>
		orders.value.filter((item) => ACTIVE_STATUSES.includes(item.status)),
	);
	const pendingCount = computed(() => paidOrders.value.length);
	const processingCount = computed(() => activeOrders.value.length);

	const isUpdating = (orderId) => updatingIds.value.includes(String(orderId));

	const rememberSeenPaidOrders = (nextOrders) => {
		const currentPaidIds = nextOrders
			.filter((item) => item.status === 'paid' && item.id)
			.map((item) => item.id);

		if (!initialized.value) {
			seenPaidOrderIds.value = currentPaidIds;
			initialized.value = true;
			return;
		}

		const seenIdSet = new Set(seenPaidOrderIds.value);
		const freshOrders = nextOrders.filter(
			(item) => item.status === 'paid' && item.id && !seenIdSet.has(item.id),
		);

		currentPaidIds.forEach((id) => seenIdSet.add(id));
		seenPaidOrderIds.value = Array.from(seenIdSet);
		emitNewOrderReminder(freshOrders);
	};

	const refreshOrders = async ({ silent = false } = {}) => {
		const memberStore = useMemberStore();
		if (!memberStore.isAdmin) {
			orders.value = [];
			errorMessage.value = '';
			return [];
		}

		if (inFlightPromise) {
			return inFlightPromise;
		}

		if (!silent) {
			loading.value = true;
		}
		refreshing.value = true;

		inFlightPromise = (async () => {
			try {
				const payload = await fetchAdminOrderList({ _t: Date.now() });
				const nextOrders = unwrapOrderList(payload).map(normalizeOrder).sort(sortOrders);

				rememberSeenPaidOrders(nextOrders);
				orders.value = nextOrders;
				errorMessage.value = '';
				lastFetchedAt.value = new Date().toISOString();
				return nextOrders;
			} catch (error) {
				errorMessage.value = error?.message || '订单加载失败';
				throw error;
			} finally {
				loading.value = false;
				refreshing.value = false;
				inFlightPromise = null;
			}
		})();

		return inFlightPromise;
	};

	const startPolling = () => {
		activeClients.value += 1;
		if (pollTimer.value) return;

		refreshOrders().catch(() => {});
		pollTimer.value = setInterval(() => {
			refreshOrders({ silent: true }).catch(() => {});
		}, POLL_INTERVAL);
	};

	const stopPolling = () => {
		activeClients.value = Math.max(0, activeClients.value - 1);
		if (activeClients.value > 0) return;

		if (pollTimer.value) {
			clearInterval(pollTimer.value);
			pollTimer.value = null;
		}
	};

	const updateOrderStatus = async (orderId, status) => {
		const normalizedId = String(orderId);
		if (!normalizedId || isUpdating(normalizedId)) return null;

		updatingIds.value = [...updatingIds.value, normalizedId];

		try {
			const result = await requestUpdateOrderStatus(normalizedId, status);
			const target = orders.value.find((item) => item.id === normalizedId);
			if (target) {
				target.status = status;
			}
			uni.$emit('order:status-changed', {
				orderId: normalizedId,
				status,
				source: 'admin-panel',
			});
			await refreshOrders({ silent: true });
			return result;
		} finally {
			updatingIds.value = updatingIds.value.filter((item) => item !== normalizedId);
		}
	};

	return {
		orders,
		loading,
		refreshing,
		errorMessage,
		lastFetchedAt,
		paidOrders,
		makingOrders,
		readyOrders,
		activeOrders,
		pendingCount,
		processingCount,
		startPolling,
		stopPolling,
		refreshOrders,
		updateOrderStatus,
		isUpdating,
	};
});
