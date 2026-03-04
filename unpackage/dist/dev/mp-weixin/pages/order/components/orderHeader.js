"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "orderHeader",
  setup(__props) {
    const { safeAreaInsets } = common_vendor.index.getSystemInfoSync();
    const mode = common_vendor.ref("pickup");
    const handleOrderModeChange = (val) => {
      if (val === "delivery" || val === "pickup") {
        mode.value = val;
      }
    };
    common_vendor.onMounted(() => {
      common_vendor.index.$on("orderModeChange", handleOrderModeChange);
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("orderModeChange", handleOrderModeChange);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: mode.value === "pickup" ? 1 : "",
        b: common_vendor.o(($event) => mode.value = "pickup"),
        c: mode.value === "delivery" ? 1 : "",
        d: common_vendor.o(($event) => mode.value = "delivery"),
        e: mode.value === "pickup"
      }, mode.value === "pickup" ? {} : {}, {
        f: common_vendor.unref(safeAreaInsets).top + "px"
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f6ccaf73"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/order/components/orderHeader.js.map
