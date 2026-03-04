"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  CustomTabBar();
}
const CustomTabBar = () => "../../components/custom-tab-bar.js";
const _sfc_main = {
  __name: "mine",
  setup(__props) {
    const { safeAreaInsets } = common_vendor.index.getSystemInfoSync();
    const handleMenuClick = (type) => {
      common_vendor.index.showToast({
        title: `点击了 ${type} 功能`,
        icon: "none"
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.unref(safeAreaInsets).top + "px",
        b: common_vendor.o(($event) => handleMenuClick("order")),
        c: common_vendor.o(($event) => handleMenuClick("address")),
        d: common_vendor.o(($event) => handleMenuClick("service")),
        e: common_vendor.o(($event) => handleMenuClick("about")),
        f: common_vendor.p({
          ["current-path"]: "/pages/mine/mine"
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7c2ebfa5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/mine.js.map
