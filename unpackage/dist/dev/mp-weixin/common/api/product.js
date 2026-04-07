"use strict";
const common_vendor = require("../vendor.js");
const common_api_request = require("./request.js");
const fetchCategories = () => {
  return common_api_request.httpRequest({
    url: "/api/categories",
    method: "GET"
  });
};
const fetchProducts = (params) => {
  return common_api_request.httpRequest({
    url: "/api/products",
    method: "GET",
    data: params
  });
};
const fetchProductSpecs = (productId) => {
  return common_api_request.httpRequest({
    url: `/api/products/${productId}/specs`,
    method: "GET"
  });
};
const fetchRecommendProducts = () => {
  return common_api_request.httpRequest({
    url: "/api/products/recommend",
    method: "GET"
  });
};
const updateProduct = (productId, payload) => {
  return common_api_request.httpRequest({
    url: `/api/products/${productId}`,
    method: "PUT",
    header: { "Content-Type": "application/json" },
    data: payload
  });
};
const updateProductStatus = (productId, onSale) => {
  return common_api_request.httpRequest({
    url: `/api/products/${productId}/status`,
    method: "PATCH",
    header: { "Content-Type": "application/json" },
    data: { status: onSale ? 1 : 0 }
  });
};
const updateProductSpecs = (productId, specGroups) => {
  return common_api_request.httpRequest({
    url: `/api/products/${productId}/specs`,
    method: "PUT",
    header: { "Content-Type": "application/json" },
    data: specGroups
  });
};
const uploadProductImage = (filePath) => {
  return new Promise((resolve, reject) => {
    common_vendor.index.uploadFile({
      url: "/api/upload/product-image",
      name: "file",
      filePath,
      success: (res) => {
        var _a, _b;
        try {
          const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const imageUrl = (data == null ? void 0 : data.url) || ((_a = data == null ? void 0 : data.data) == null ? void 0 : _a.url) || ((_b = data == null ? void 0 : data.data) == null ? void 0 : _b.path) || "";
            if (!imageUrl) {
              reject(new Error("上传成功但未返回图片地址"));
              return;
            }
            resolve(imageUrl);
            return;
          }
          reject(new Error((data == null ? void 0 : data.message) || `上传失败 (${res.statusCode})`));
        } catch (e) {
          reject(new Error("图片上传返回格式错误"));
        }
      },
      fail: (err) => reject(new Error(err.errMsg || "图片上传失败"))
    });
  });
};
exports.fetchCategories = fetchCategories;
exports.fetchProductSpecs = fetchProductSpecs;
exports.fetchProducts = fetchProducts;
exports.fetchRecommendProducts = fetchRecommendProducts;
exports.updateProduct = updateProduct;
exports.updateProductSpecs = updateProductSpecs;
exports.updateProductStatus = updateProductStatus;
exports.uploadProductImage = uploadProductImage;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/api/product.js.map
