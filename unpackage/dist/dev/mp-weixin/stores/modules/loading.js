"use strict";
const common_vendor = require("../../common/vendor.js");
const useLoadingStore = common_vendor.defineStore("loading", () => {
  const visible = common_vendor.ref(false);
  const title = common_vendor.ref("加载中...");
  const logo = common_vendor.ref("");
  const styleType = common_vendor.ref("tea");
  const logoSpin = common_vendor.ref(true);
  const blur = common_vendor.ref(true);
  function showLoading(options = {}) {
    visible.value = true;
    title.value = options.title ?? "加载中...";
    logo.value = options.logo ?? "";
    styleType.value = options.styleType ?? "tea";
    logoSpin.value = options.logoSpin !== false;
    blur.value = options.blur !== false;
  }
  function hideLoading() {
    visible.value = false;
  }
  return { visible, title, logo, styleType, logoSpin, blur, showLoading, hideLoading };
});
exports.useLoadingStore = useLoadingStore;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/stores/modules/loading.js.map
