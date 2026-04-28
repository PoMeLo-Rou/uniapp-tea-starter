"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_order = require("../../common/api/order.js");
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const safeAreaInsets = (() => {
      try {
        return common_vendor.index.getSystemInfoSync().safeAreaInsets || {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        };
      } catch (_) {
        return {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        };
      }
    })();
    const order = common_vendor.ref(null);
    const loading = common_vendor.ref(true);
    const confirming = common_vendor.ref(false);
    const orderId = common_vendor.ref("");
    const statusMap = {
      pending: "待支付",
      paid: "已支付",
      making: "制作中",
      ready: "待取餐",
      finished: "已完成",
      cancelled: "已取消"
    };
    const statusIconMap = {
      pending: "⏳",
      paid: "✅",
      making: "🔥",
      ready: "🔔",
      finished: "🎉",
      cancelled: "❌"
    };
    const statusText = (status) => statusMap[status] || status;
    const statusIcon = (status) => statusIconMap[status] || "📋";
    const formatAmount = (value) => {
      const amount = Number(value);
      return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
    };
    const formatDateTime = (value) => {
      if (!value)
        return "--";
      const date = new Date(value);
      if (Number.isNaN(date.getTime()))
        return "--";
      const pad = (part) => String(part).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
        date.getHours()
      )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };
    const normalizeItems = (items) => {
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
    const fetchDetail = async (id) => {
      loading.value = true;
      try {
        const detail = await common_api_order.fetchOrderDetail(id);
        if (!detail) {
          order.value = null;
          common_vendor.index.showToast({ title: "订单不存在", icon: "none" });
          return;
        }
        order.value = {
          ...detail,
          id: detail.id || detail.orderId || detail.order_id || id,
          items: normalizeItems(detail.items),
          total_amount: Number(detail.total_amount || detail.totalPrice || 0),
          pay_amount: Number(detail.pay_amount || detail.total_amount || detail.totalPrice || 0),
          discount_amount: Number(detail.discount_amount || 0),
          order_no: detail.order_no || detail.orderNo || `NO-${id}`,
          store_name: detail.store_name || detail.storeName || "默认门店",
          order_type: detail.order_type || detail.orderType || "pickup"
        };
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/detail.vue:192", "[fetchDetail] error:", error);
        common_vendor.index.showToast({ title: "加载失败，请稍后重试", icon: "none" });
      } finally {
        loading.value = false;
      }
    };
    const confirmPickup = async () => {
      if (!order.value || order.value.status !== "ready")
        return;
      confirming.value = true;
      try {
        const result = await common_api_order.confirmOrderPickup(orderId.value);
        if (result && (result.ok || result.status === "finished")) {
          order.value.status = "finished";
          common_vendor.index.showToast({ title: "已确认取餐", icon: "success" });
          common_vendor.index.$emit("order:status-changed", {
            orderId: orderId.value,
            status: "finished",
            source: "pickup-confirm"
          });
          return;
        }
        common_vendor.index.showToast({ title: "确认失败，请重试", icon: "none" });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/detail.vue:217", "[confirmPickup] error:", error);
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || "网络异常", icon: "none" });
      } finally {
        confirming.value = false;
      }
    };
    const extractEventOrderId = (payload = {}) => {
      var _a;
      return String(payload.orderId || payload.order_id || payload.id || ((_a = payload == null ? void 0 : payload.data) == null ? void 0 : _a.orderId) || "");
    };
    const handleOrderStatusChanged = (payload = {}) => {
      if (!orderId.value)
        return;
      if (extractEventOrderId(payload) !== String(orderId.value))
        return;
      fetchDetail(orderId.value);
    };
    const goBack = () => {
      try {
        common_vendor.index.navigateBack();
      } catch (_) {
        common_vendor.index.switchTab({ url: "/pages/mine/mine" });
      }
    };
    common_vendor.onLoad((query) => {
      if (!(query == null ? void 0 : query.id)) {
        loading.value = false;
        return;
      }
      orderId.value = String(query.id);
      fetchDetail(orderId.value);
    });
    common_vendor.onMounted(() => {
      common_vendor.index.$on("order:status-changed", handleOrderStatusChanged);
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("order:status-changed", handleOrderStatusChanged);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.unref(safeAreaInsets).top + "px",
        c: loading.value
      }, loading.value ? {} : order.value ? common_vendor.e({
        e: common_vendor.t(statusIcon(order.value.status)),
        f: common_vendor.t(statusText(order.value.status)),
        g: common_vendor.t(order.value.store_name),
        h: common_vendor.t(order.value.order_type === "delivery" ? "外卖配送" : "到店自取"),
        i: common_vendor.f(order.value.items, (item, index, i0) => {
          return common_vendor.e({
            a: item.image || "/static/order.png",
            b: common_vendor.t(item.name),
            c: item.spec
          }, item.spec ? {
            d: common_vendor.t(item.spec)
          } : {}, {
            e: common_vendor.t(formatAmount(item.price)),
            f: common_vendor.t(item.count),
            g: index
          });
        }),
        j: common_vendor.t(formatAmount(order.value.total_amount)),
        k: order.value.discount_amount > 0
      }, order.value.discount_amount > 0 ? {
        l: common_vendor.t(formatAmount(order.value.discount_amount))
      } : {}, {
        m: common_vendor.t(formatAmount(order.value.pay_amount)),
        n: common_vendor.t(order.value.order_no),
        o: common_vendor.t(formatDateTime(order.value.created_at)),
        p: order.value.paid_at
      }, order.value.paid_at ? {
        q: common_vendor.t(formatDateTime(order.value.paid_at))
      } : {}) : {}, {
        d: order.value,
        r: order.value && order.value.status === "ready"
      }, order.value && order.value.status === "ready" ? {
        s: common_vendor.t(confirming.value ? "确认中..." : "我已取餐，确认完成"),
        t: confirming.value,
        v: common_vendor.o(confirmPickup)
      } : {}, {
        w: !loading.value && !order.value
      }, !loading.value && !order.value ? {} : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6b23c96c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/detail.js.map
