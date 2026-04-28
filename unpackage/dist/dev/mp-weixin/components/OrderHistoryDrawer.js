"use strict";
const common_vendor = require("../common/vendor.js");
const common_api_order = require("../common/api/order.js");
const stores_modules_member = require("../stores/modules/member.js");
const _sfc_main = {
  __name: "OrderHistoryDrawer",
  props: {
    show: { type: Boolean, default: false }
  },
  emits: ["update:show"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const safeAreaInsets = (() => {
      try {
        const sys = common_vendor.index.getSystemInfoSync();
        return sys.safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 };
      } catch (_) {
        return { top: 0, bottom: 0, left: 0, right: 0 };
      }
    })();
    const orderList = common_vendor.ref([]);
    const panelVisible = common_vendor.ref(false);
    const closeTimer = common_vendor.ref(null);
    const statusMap = {
      pending: "待支付",
      paid: "已支付",
      making: "制作中",
      ready: "待取餐",
      finished: "已完成",
      cancelled: "已取消"
    };
    const statusText = (status) => statusMap[status] || status;
    const formatTime = (value) => {
      if (!value)
        return "--";
      const date = new Date(value);
      if (Number.isNaN(date.getTime()))
        return "--";
      const pad = (part) => String(part).padStart(2, "0");
      return `${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(
        date.getMinutes()
      )}`;
    };
    const formatAmount = (value) => {
      const amount = Number(value);
      return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
    };
    const loadHistory = async () => {
      try {
        const memberStore = stores_modules_member.useMemberStore();
        if (!memberStore.userId) {
          orderList.value = [];
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          return;
        }
        const list = await common_api_order.fetchOrderList({ userId: memberStore.userId });
        orderList.value = Array.isArray(list) ? list : (list == null ? void 0 : list.list) || (list == null ? void 0 : list.rows) || [];
      } catch (_) {
        orderList.value = [];
      }
    };
    const close = () => {
      panelVisible.value = false;
      if (closeTimer.value)
        clearTimeout(closeTimer.value);
      closeTimer.value = setTimeout(() => {
        emit("update:show", false);
        closeTimer.value = null;
      }, 320);
    };
    const goDetail = (order) => {
      const targetId = order.id || order.orderId || order.order_id;
      if (!targetId)
        return;
      common_vendor.index.navigateTo({ url: `/pages/order/detail?id=${targetId}` });
      close();
    };
    const handleOrderStatusChanged = () => {
      if (!props.show)
        return;
      loadHistory();
    };
    common_vendor.watch(
      () => props.show,
      (value) => {
        if (value) {
          loadHistory();
          panelVisible.value = false;
          common_vendor.nextTick$1(() => {
            setTimeout(() => {
              panelVisible.value = true;
            }, 30);
          });
          return;
        }
        panelVisible.value = false;
      }
    );
    common_vendor.onMounted(() => {
      common_vendor.index.$on("order:status-changed", handleOrderStatusChanged);
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("order:status-changed", handleOrderStatusChanged);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.show
      }, __props.show ? common_vendor.e({
        b: panelVisible.value ? 1 : "",
        c: common_vendor.o(close),
        d: common_vendor.o(close),
        e: common_vendor.unref(safeAreaInsets).top + "px",
        f: common_vendor.f(orderList.value, (order, k0, i0) => {
          return {
            a: common_vendor.t(order.order_no),
            b: common_vendor.t(statusText(order.status)),
            c: common_vendor.t(order.store_name),
            d: common_vendor.t(order.order_type === "delivery" ? "外卖配送" : "到店自取"),
            e: common_vendor.t(formatTime(order.created_at)),
            f: common_vendor.t(formatAmount(order.total_amount)),
            g: order.id || order.order_no,
            h: common_vendor.o(($event) => goDetail(order), order.id || order.order_no)
          };
        }),
        g: orderList.value.length === 0
      }, orderList.value.length === 0 ? {} : {}, {
        h: common_vendor.unref(safeAreaInsets).bottom + 20 + "px",
        i: panelVisible.value ? 1 : "",
        j: common_vendor.o(close)
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a516cf36"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/OrderHistoryDrawer.js.map
