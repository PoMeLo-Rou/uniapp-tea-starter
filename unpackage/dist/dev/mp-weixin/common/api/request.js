"use strict";
const common_vendor = require("../vendor.js");
const API_BASE = "http://localhost:8080";
const getApiBase = () => API_BASE;
const httpInterceptor = {
  invoke(options) {
    if (!options.url.startsWith("http")) {
      options.url = API_BASE + options.url;
    }
    options.timeout = 1e4;
    options.header = {
      "source-client": "miniapp",
      ...options.header
    };
    const token = common_vendor.index.getStorageSync("token");
    if (token) {
      options.header.Authorization = token;
    }
  }
};
common_vendor.index.addInterceptor("request", httpInterceptor);
common_vendor.index.addInterceptor("uploadFile", httpInterceptor);
const httpRequest = (options) => {
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      ...options,
      success: (res) => {
        var _a, _b;
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          common_vendor.index.navigateTo({ url: "/pages/login/login" });
          reject(new Error(((_a = res.data) == null ? void 0 : _a.message) || "请先登录"));
        } else {
          reject(new Error(((_b = res.data) == null ? void 0 : _b.message) || `请求失败 (${res.statusCode})`));
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || "网络错误"));
      }
    });
  });
};
exports.getApiBase = getApiBase;
exports.httpRequest = httpRequest;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/api/request.js.map
