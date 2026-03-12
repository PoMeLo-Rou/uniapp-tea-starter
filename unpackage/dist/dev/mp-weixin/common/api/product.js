"use strict";
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
exports.fetchCategories = fetchCategories;
exports.fetchProductSpecs = fetchProductSpecs;
exports.fetchProducts = fetchProducts;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/api/product.js.map
