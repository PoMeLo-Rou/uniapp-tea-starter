"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_modules_member = require("../../stores/modules/member.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const memberStore = stores_modules_member.useMemberStore();
    const { safeAreaInsets } = common_vendor.index.getSystemInfoSync();
    const goBack = () => {
      common_vendor.index.navigateBack({ delta: 1 });
    };
    const ensureAdminAccess = () => {
      if (!memberStore.isLoggedIn || !memberStore.isAdmin) {
        common_vendor.index.showToast({ title: "无管理员权限", icon: "none" });
        common_vendor.index.switchTab({ url: "/pages/mine/mine" });
        return false;
      }
      return true;
    };
    const goProductManage = () => {
      if (!ensureAdminAccess())
        return;
      common_vendor.index.navigateTo({ url: "/pages/admin/product-manage" });
    };
    const goSiteManage = () => {
      if (!ensureAdminAccess())
        return;
      common_vendor.index.navigateTo({ url: "/pages/admin/site-manage" });
    };
    common_vendor.onLoad(() => {
      ensureAdminAccess();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goBack),
        b: common_vendor.o(goProductManage),
        c: common_vendor.o(goSiteManage),
        d: common_vendor.unref(safeAreaInsets).top + "px"
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9a704506"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/index.js.map
