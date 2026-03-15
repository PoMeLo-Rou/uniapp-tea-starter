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
      } catch (e) {
        return { top: 0, bottom: 0, left: 0, right: 0 };
      }
    })();
    const orderList = common_vendor.ref([]);
    const panelVisible = common_vendor.ref(false);
    const closeTimer = common_vendor.ref(null);
    async function loadHistory() {
      try {
        const memberStore = stores_modules_member.useMemberStore();
        if (!memberStore.userId) {
          orderList.value = [];
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          return;
        }
        const list = await common_api_order.fetchOrderList({ userId: memberStore.userId });
        orderList.value = Array.isArray(list) ? list : [];
      } catch (e) {
        orderList.value = [];
      }
    }
    const statusMap = { pending: "待支付", paid: "已支付", making: "制作中", ready: "待取杯", finished: "已完成", cancelled: "已取消" };
    const statusText = (s) => statusMap[s] || s;
    function formatTime(ts) {
      if (!ts)
        return "";
      const d = new Date(ts);
      const m = d.getMonth() + 1;
      const day = d.getDate();
      const h = d.getHours();
      const min = d.getMinutes();
      return `${m}/${day} ${h}:${min < 10 ? "0" + min : min}`;
    }
    function close() {
      panelVisible.value = false;
      if (closeTimer.value)
        clearTimeout(closeTimer.value);
      closeTimer.value = setTimeout(() => {
        emit("update:show", false);
        closeTimer.value = null;
      }, 320);
    }
    function goDetail(order) {
      close();
      common_vendor.index.navigateTo({ url: "/pages/order/detail?id=" + order.id });
    }
    common_vendor.watch(() => props.show, (val) => {
      if (val) {
        loadHistory();
        panelVisible.value = false;
        common_vendor.nextTick$1(() => {
          setTimeout(() => {
            panelVisible.value = true;
          }, 30);
        });
      } else {
        panelVisible.value = false;
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.show
      }, __props.show ? common_vendor.e({
        b: panelVisible.value ? 1 : "",
        c: common_vendor.o(close),
        d: common_vendor.o(close),
        e: common_vendor.unref(safeAreaInsets).top + "px",
        f: common_vendor.f(orderList.value, (order, index, i0) => {
          return {
            a: common_vendor.t(order.order_no),
            b: common_vendor.t(statusText(order.status)),
            c: common_vendor.t(order.store_name),
            d: common_vendor.t(order.order_type === "delivery" ? "外带" : "堂食"),
            e: common_vendor.t(formatTime(order.created_at)),
            f: common_vendor.t(order.total_amount),
            g: order.order_no,
            h: common_vendor.o(($event) => goDetail(order), order.order_no)
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
