"use strict";
const common_vendor = require("../common/vendor.js");
const loadingState = common_vendor.reactive({
  visible: false,
  title: "加载中...",
  logo: "",
  styleType: "tea",
  logoSpin: true,
  blur: true
});
function showLoading(options = {}) {
  loadingState.visible = true;
  loadingState.title = options.title != null ? options.title : "加载中...";
  loadingState.logo = options.logo != null ? options.logo : "";
  loadingState.styleType = options.styleType != null ? options.styleType : "tea";
  loadingState.logoSpin = options.logoSpin !== false;
  loadingState.blur = options.blur !== false;
}
function hideLoading() {
  loadingState.visible = false;
}
exports.hideLoading = hideLoading;
exports.showLoading = showLoading;
//# sourceMappingURL=../../.sourcemap/mp-weixin/store/loading.js.map
