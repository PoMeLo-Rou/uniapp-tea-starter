"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "mine",
  setup(__props) {
    const handleMenuClick = (type) => {
      common_vendor.index.showToast({
        title: `点击了 ${type} 功能`,
        icon: "none"
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(($event) => handleMenuClick("order")),
        b: common_vendor.o(($event) => handleMenuClick("address")),
        c: common_vendor.o(($event) => handleMenuClick("service")),
        d: common_vendor.o(($event) => handleMenuClick("about"))
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/mine.js.map
