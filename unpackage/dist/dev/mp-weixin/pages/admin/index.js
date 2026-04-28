"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_modules_adminOrder = require("../../stores/modules/admin-order.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const orderStore = stores_modules_adminOrder.useAdminOrderStore();
    const safeAreaInsets = (() => {
      try {
        const sys = common_vendor.index.getSystemInfoSync();
        return sys.safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 };
      } catch (_) {
        return { top: 0, bottom: 0, left: 0, right: 0 };
      }
    })();
    const pageVisible = common_vendor.ref(false);
    const pollingAttached = common_vendor.ref(false);
    const modalVisible = common_vendor.ref(false);
    const pendingCount = common_vendor.computed(() => orderStore.pendingCount);
    const makingCount = common_vendor.computed(() => orderStore.makingOrders.length);
    const readyCount = common_vendor.computed(() => orderStore.readyOrders.length);
    const lastFetchedText = common_vendor.computed(() => formatTime(orderStore.lastFetchedAt));
    const attachPolling = () => {
      if (pollingAttached.value)
        return;
      orderStore.startPolling();
      pollingAttached.value = true;
    };
    const detachPolling = () => {
      if (!pollingAttached.value)
        return;
      orderStore.stopPolling();
      pollingAttached.value = false;
    };
    const formatTime = (time) => {
      if (!time)
        return "";
      const date = new Date(time);
      if (Number.isNaN(date.getTime()))
        return "";
      const pad = (value) => String(value).padStart(2, "0");
      return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };
    const goBack = () => {
      try {
        common_vendor.index.navigateBack();
      } catch (_) {
        common_vendor.index.switchTab({ url: "/pages/mine/mine" });
      }
    };
    const goToOrderManage = () => {
      common_vendor.index.navigateTo({ url: "/pages/admin/order-manage" });
    };
    const goToProductManage = () => {
      common_vendor.index.navigateTo({ url: "/pages/admin/product-manage" });
    };
    const goToSiteConfig = () => {
      common_vendor.index.navigateTo({ url: "/pages/admin/site-manage" });
    };
    const handleNewOrder = (payload = {}) => {
      var _a, _b;
      if (!pageVisible.value || modalVisible.value)
        return;
      const count = Number(payload.count || ((_a = payload.orders) == null ? void 0 : _a.length) || 1);
      const orderNo = ((_b = payload.firstOrder) == null ? void 0 : _b.order_no) || "新订单";
      modalVisible.value = true;
      try {
        common_vendor.index.vibrateLong();
      } catch (_) {
      }
      common_vendor.index.showModal({
        title: "新订单提醒",
        content: count > 1 ? `刚刚有 ${count} 个新订单进入待处理队列，请尽快接单。` : `${orderNo} 已支付成功，请尽快进入订单看板处理。`,
        confirmText: "立即处理",
        cancelText: "稍后",
        success: ({ confirm }) => {
          modalVisible.value = false;
          if (confirm) {
            goToOrderManage();
          }
        },
        fail: () => {
          modalVisible.value = false;
        }
      });
    };
    common_vendor.onMounted(() => {
      common_vendor.index.$on("admin:new-order", handleNewOrder);
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("admin:new-order", handleNewOrder);
    });
    common_vendor.onShow(() => {
      pageVisible.value = true;
      attachPolling();
    });
    common_vendor.onHide(() => {
      pageVisible.value = false;
      detachPolling();
    });
    common_vendor.onUnload(() => {
      pageVisible.value = false;
      detachPolling();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.unref(safeAreaInsets).top + "px",
        c: common_vendor.t(pendingCount.value > 0 ? `当前有 ${pendingCount.value} 个新订单待处理` : "暂无新的待处理订单"),
        d: common_vendor.o(goToOrderManage),
        e: common_vendor.t(pendingCount.value),
        f: common_vendor.t(makingCount.value),
        g: common_vendor.t(readyCount.value),
        h: lastFetchedText.value
      }, lastFetchedText.value ? {
        i: common_vendor.t(lastFetchedText.value)
      } : {}, {
        j: pendingCount.value > 0
      }, pendingCount.value > 0 ? {
        k: common_vendor.o(goToOrderManage)
      } : {}, {
        l: pendingCount.value > 0
      }, pendingCount.value > 0 ? {
        m: common_vendor.t(pendingCount.value)
      } : {}, {
        n: common_vendor.o(goToOrderManage),
        o: common_vendor.o(goToProductManage),
        p: common_vendor.o(goToSiteConfig)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9a704506"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/index.js.map
