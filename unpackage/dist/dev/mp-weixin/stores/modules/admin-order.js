"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_order = require("../../common/api/order.js");
const stores_modules_member = require("./member.js");
const POLL_INTERVAL = 5e3;
const ACTIVE_STATUSES = ["paid", "making", "ready"];
const STATUS_SORT_WEIGHT = {
  paid: 0,
  making: 1,
  ready: 2,
  pending: 3,
  finished: 4,
  cancelled: 5
};
const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const parseItems = (items) => {
  if (Array.isArray(items))
    return items;
  if (typeof items === "string" && items) {
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }
  return [];
};
const resolveOrderId = (order = {}) => String(order.id ?? order.orderId ?? order.order_id ?? order.order_no ?? "");
const resolveTime = (order = {}) => {
  const candidate = order.paid_at || order.created_at || order.updated_at || "";
  const time = candidate ? new Date(candidate).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
};
const normalizeOrder = (order = {}) => ({
  ...order,
  id: resolveOrderId(order),
  status: String(order.status || "pending"),
  items: parseItems(order.items),
  order_no: order.order_no || order.orderNo || `NO-${resolveOrderId(order)}`,
  order_type: order.order_type || order.orderType || "pickup",
  store_name: order.store_name || order.storeName || "默认门店",
  total_amount: toNumber(order.total_amount ?? order.totalPrice ?? order.pay_amount),
  pay_amount: toNumber(order.pay_amount ?? order.total_amount ?? order.totalPrice),
  discount_amount: toNumber(order.discount_amount)
});
const unwrapOrderList = (payload) => {
  if (Array.isArray(payload))
    return payload;
  if (Array.isArray(payload == null ? void 0 : payload.list))
    return payload.list;
  if (Array.isArray(payload == null ? void 0 : payload.rows))
    return payload.rows;
  if (Array.isArray(payload == null ? void 0 : payload.records))
    return payload.records;
  if (Array.isArray(payload == null ? void 0 : payload.data))
    return payload.data;
  return [];
};
const sortOrders = (left, right) => {
  const statusGap = (STATUS_SORT_WEIGHT[left.status] ?? 99) - (STATUS_SORT_WEIGHT[right.status] ?? 99);
  if (statusGap !== 0)
    return statusGap;
  return resolveTime(right) - resolveTime(left);
};
const emitNewOrderReminder = (orders) => {
  if (!orders.length)
    return;
  common_vendor.index.$emit("admin:new-order", {
    count: orders.length,
    firstOrder: orders[0],
    orders,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
};
const useAdminOrderStore = common_vendor.defineStore("admin-order", () => {
  const orders = common_vendor.ref([]);
  const loading = common_vendor.ref(false);
  const refreshing = common_vendor.ref(false);
  const errorMessage = common_vendor.ref("");
  const lastFetchedAt = common_vendor.ref("");
  const initialized = common_vendor.ref(false);
  const seenPaidOrderIds = common_vendor.ref([]);
  const updatingIds = common_vendor.ref([]);
  const activeClients = common_vendor.ref(0);
  const pollTimer = common_vendor.ref(null);
  let inFlightPromise = null;
  const paidOrders = common_vendor.computed(() => orders.value.filter((item) => item.status === "paid"));
  const makingOrders = common_vendor.computed(() => orders.value.filter((item) => item.status === "making"));
  const readyOrders = common_vendor.computed(() => orders.value.filter((item) => item.status === "ready"));
  const activeOrders = common_vendor.computed(
    () => orders.value.filter((item) => ACTIVE_STATUSES.includes(item.status))
  );
  const pendingCount = common_vendor.computed(() => paidOrders.value.length);
  const processingCount = common_vendor.computed(() => activeOrders.value.length);
  const isUpdating = (orderId) => updatingIds.value.includes(String(orderId));
  const rememberSeenPaidOrders = (nextOrders) => {
    const currentPaidIds = nextOrders.filter((item) => item.status === "paid" && item.id).map((item) => item.id);
    if (!initialized.value) {
      seenPaidOrderIds.value = currentPaidIds;
      initialized.value = true;
      return;
    }
    const seenIdSet = new Set(seenPaidOrderIds.value);
    const freshOrders = nextOrders.filter(
      (item) => item.status === "paid" && item.id && !seenIdSet.has(item.id)
    );
    currentPaidIds.forEach((id) => seenIdSet.add(id));
    seenPaidOrderIds.value = Array.from(seenIdSet);
    emitNewOrderReminder(freshOrders);
  };
  const refreshOrders = async ({ silent = false } = {}) => {
    const memberStore = stores_modules_member.useMemberStore();
    if (!memberStore.isAdmin) {
      orders.value = [];
      errorMessage.value = "";
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
        const payload = await common_api_order.fetchAdminOrderList({ _t: Date.now() });
        const nextOrders = unwrapOrderList(payload).map(normalizeOrder).sort(sortOrders);
        rememberSeenPaidOrders(nextOrders);
        orders.value = nextOrders;
        errorMessage.value = "";
        lastFetchedAt.value = (/* @__PURE__ */ new Date()).toISOString();
        return nextOrders;
      } catch (error) {
        errorMessage.value = (error == null ? void 0 : error.message) || "订单加载失败";
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
    if (pollTimer.value)
      return;
    refreshOrders().catch(() => {
    });
    pollTimer.value = setInterval(() => {
      refreshOrders({ silent: true }).catch(() => {
      });
    }, POLL_INTERVAL);
  };
  const stopPolling = () => {
    activeClients.value = Math.max(0, activeClients.value - 1);
    if (activeClients.value > 0)
      return;
    if (pollTimer.value) {
      clearInterval(pollTimer.value);
      pollTimer.value = null;
    }
  };
  const updateOrderStatus = async (orderId, status) => {
    const normalizedId = String(orderId);
    if (!normalizedId || isUpdating(normalizedId))
      return null;
    updatingIds.value = [...updatingIds.value, normalizedId];
    try {
      const result = await common_api_order.updateOrderStatus(normalizedId, status);
      const target = orders.value.find((item) => item.id === normalizedId);
      if (target) {
        target.status = status;
      }
      common_vendor.index.$emit("order:status-changed", {
        orderId: normalizedId,
        status,
        source: "admin-panel"
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
    isUpdating
  };
});
exports.useAdminOrderStore = useAdminOrderStore;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/stores/modules/admin-order.js.map
