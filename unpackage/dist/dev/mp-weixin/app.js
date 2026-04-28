"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const common_ws_socket = require("./common/ws/socket.js");
const stores_modules_member = require("./stores/modules/member.js");
const stores_index = require("./stores/index.js");
const stores_modules_loading = require("./stores/modules/loading.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/order/order.js";
  "./pages/mine/mine.js";
  "./pages/login/login.js";
  "./pages/checkout/checkout.js";
  "./pages/order/detail.js";
  "./pages/admin/index.js";
  "./pages/admin/order-manage.js";
  "./pages/admin/product-manage.js";
  "./pages/admin/site-manage.js";
}
const handleOrderStatusMessage = (msg = {}) => {
  var _a;
  const nextStatus = msg.newStatus || msg.status || ((_a = msg == null ? void 0 : msg.data) == null ? void 0 : _a.status) || "";
  common_vendor.index.$emit("order:status-changed", {
    ...msg,
    status: nextStatus
  });
  common_vendor.index.showToast({
    title: msg.message || "订单状态已更新",
    icon: "none",
    duration: 3e3
  });
};
const _sfc_main = {
  onLaunch() {
    this.initLoginStatus();
  },
  onShow() {
    this.checkAndConnectSocket();
  },
  methods: {
    initLoginStatus() {
      const member = common_vendor.index.getStorageSync("member");
      if (!member)
        return;
      const memberStore = stores_modules_member.useMemberStore();
      memberStore.setUserInfo(member);
    },
    checkAndConnectSocket() {
      const member = common_vendor.index.getStorageSync("member");
      if (!(member == null ? void 0 : member.userId))
        return;
      common_ws_socket.socketManager.connect(member.userId);
      common_ws_socket.socketManager.off("order_status", handleOrderStatusMessage);
      common_ws_socket.socketManager.on("order_status", handleOrderStatusMessage);
    }
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.use(stores_index.pinia);
  const loadingStore = stores_modules_loading.useLoadingStore();
  app.config.globalProperties.$showLoading = loadingStore.showLoading;
  app.config.globalProperties.$hideLoading = loadingStore.hideLoading;
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
