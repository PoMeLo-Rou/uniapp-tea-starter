"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "mainAction",
  setup(__props) {
    const goToOrder = (type) => {
      common_vendor.index.switchTab({
        url: "/pages/order/order"
      });
      common_vendor.index.switchTab({ url: "/pages/order/order" });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(($event) => goToOrder()),
        b: common_vendor.o(($event) => goToOrder())
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c4ecffda"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/index/components/mainAction.js.map
