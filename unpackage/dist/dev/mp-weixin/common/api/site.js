"use strict";
const common_vendor = require("../vendor.js");
const common_api_request = require("./request.js");
const fetchSiteConfig = () => {
  return common_api_request.httpRequest({
    url: "/api/site-config",
    method: "GET"
  });
};
const updateSiteConfig = (payload) => {
  return common_api_request.httpRequest({
    url: "/api/admin/site-config",
    method: "PUT",
    header: { "Content-Type": "application/json" },
    data: payload
  });
};
const uploadSiteImage = (filePath) => {
  return new Promise((resolve, reject) => {
    common_vendor.index.uploadFile({
      url: "/api/upload/site-image",
      name: "file",
      filePath,
      success: (res) => {
        try {
          const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const imageUrl = (data == null ? void 0 : data.url) || "";
            if (!imageUrl) {
              reject(new Error("上传成功但未返回图片地址"));
              return;
            }
            resolve(imageUrl);
            return;
          }
          reject(new Error((data == null ? void 0 : data.message) || `上传失败 (${res.statusCode})`));
        } catch (_) {
          reject(new Error("图片上传返回格式错误"));
        }
      },
      fail: (err) => reject(new Error(err.errMsg || "图片上传失败"))
    });
  });
};
const deleteSiteImage = (url) => {
  return common_api_request.httpRequest({
    url: "/api/upload/site-image",
    method: "DELETE",
    header: { "Content-Type": "application/json" },
    data: { url }
  });
};
const fetchStoreDistance = ({ userLat, userLng }) => {
  return common_api_request.httpRequest({
    url: "/api/store/distance",
    method: "GET",
    data: { userLat, userLng }
  });
};
exports.deleteSiteImage = deleteSiteImage;
exports.fetchSiteConfig = fetchSiteConfig;
exports.fetchStoreDistance = fetchStoreDistance;
exports.updateSiteConfig = updateSiteConfig;
exports.uploadSiteImage = uploadSiteImage;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/api/site.js.map
