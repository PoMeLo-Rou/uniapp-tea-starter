"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const common_ws_socket = require("./common/ws/socket.js");
const stores_index = require("./stores/index.js");
const stores_modules_loading = require("./stores/modules/loading.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/order/order.js";
  "./pages/mine/mine.js";
  "./pages/checkout/checkout.js";
  "./pages/order/detail.js";
  "./pages/admin/product-manage.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:6", "App Launch");
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:9", "App Show");
    const memberRaw = common_vendor.index.getStorageSync("member");
    if (memberRaw && memberRaw.userId) {
      common_ws_socket.socketManager.connect(memberRaw.userId);
      common_ws_socket.socketManager.on("order_status", (msg) => {
        common_vendor.index.__f__("log", "at App.vue:17", "[WS] 收到订单推送:", msg);
        common_vendor.index.showToast({
          title: msg.message,
          icon: "none",
          duration: 3e3
        });
      });
    }
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:27", "App Hide");
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
