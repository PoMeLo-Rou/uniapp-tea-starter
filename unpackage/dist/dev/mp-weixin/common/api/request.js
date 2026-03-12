"use strict";
const common_vendor = require("../vendor.js");
const API_BASE = "http://192.168.1.3:8080";
const httpRequest = (options) => {
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      ...options,
      url: options.url.startsWith("http") ? options.url : `${API_BASE}${options.url}`,
      success: (res) => {
        var _a;
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error(((_a = res.data) == null ? void 0 : _a.message) || `请求失败 (${res.statusCode})`));
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || "网络错误"));
      }
    });
  });
};
exports.httpRequest = httpRequest;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/api/request.js.map
