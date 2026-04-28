"use strict";
const common_vendor = require("../vendor.js");
const common_api_request = require("./request.js");
const JSON_HEADER = { "Content-Type": "application/json" };
const isFallbackableError = (error) => {
  const message = String((error == null ? void 0 : error.message) || "").toLowerCase();
  return message.includes("(400)") || message.includes("(404)") || message.includes("(405)") || message.includes("(501)") || message.includes("cannot get") || message.includes("cannot post") || message.includes("cannot patch") || message.includes("cannot put") || message.includes("not found");
};
const requestWithFallbacks = async (requestFactories) => {
  let lastError = null;
  for (const createRequest of requestFactories) {
    try {
      return await createRequest();
    } catch (error) {
      lastError = error;
      if (!isFallbackableError(error)) {
        throw error;
      }
    }
  }
  throw lastError || new Error("请求失败");
};
const normalizeProductList = (payload) => {
  if (Array.isArray(payload))
    return payload;
  if (Array.isArray(payload == null ? void 0 : payload.list))
    return payload.list;
  if (Array.isArray(payload == null ? void 0 : payload.rows))
    return payload.rows;
  if (Array.isArray(payload == null ? void 0 : payload.records))
    return payload.records;
  if (Array.isArray(payload == null ? void 0 : payload.data))
    return payload.data;
  return [];
};
const mergeProductLists = (...payloads) => {
  const productMap = /* @__PURE__ */ new Map();
  payloads.forEach((payload) => {
    normalizeProductList(payload).forEach((item) => {
      if (!item)
        return;
      const key = item.id ?? item.productId ?? `${item.name || "product"}-${productMap.size}`;
      const previous = productMap.get(key) || {};
      productMap.set(key, {
        ...previous,
        ...item
      });
    });
  });
  return Array.from(productMap.values());
};
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
const fetchAdminProducts = (params = {}) => {
  const mergedParams = {
    ...params,
    status: params.status ?? "all",
    includeInactive: params.includeInactive ?? true,
    includeDisabled: params.includeDisabled ?? true,
    adminView: params.adminView ?? true
  };
  return requestWithFallbacks([
    () => common_api_request.httpRequest({
      url: "/api/admin/products",
      method: "GET",
      data: mergedParams
    }),
    async () => {
      const [onSaleProducts, offSaleProducts] = await Promise.all([
        common_api_request.httpRequest({
          url: "/api/products",
          method: "GET",
          data: {
            ...params,
            status: 1
          }
        }),
        common_api_request.httpRequest({
          url: "/api/products",
          method: "GET",
          data: {
            ...params,
            status: 0
          }
        })
      ]);
      return mergeProductLists(onSaleProducts, offSaleProducts);
    },
    async () => {
      const [onSaleProducts, offSaleProducts] = await Promise.all([
        common_api_request.httpRequest({
          url: "/api/products",
          method: "GET",
          data: {
            ...params,
            status: "on"
          }
        }),
        common_api_request.httpRequest({
          url: "/api/products",
          method: "GET",
          data: {
            ...params,
            status: "off"
          }
        })
      ]);
      return mergeProductLists(onSaleProducts, offSaleProducts);
    },
    async () => {
      const [onSaleProducts, offSaleProducts] = await Promise.all([
        common_api_request.httpRequest({
          url: "/api/products",
          method: "GET",
          data: {
            ...params,
            status: "active"
          }
        }),
        common_api_request.httpRequest({
          url: "/api/products",
          method: "GET",
          data: {
            ...params,
            status: "inactive"
          }
        })
      ]);
      return mergeProductLists(onSaleProducts, offSaleProducts);
    },
    () => common_api_request.httpRequest({
      url: "/api/products",
      method: "GET",
      data: mergedParams
    }),
    () => common_api_request.httpRequest({
      url: "/api/products",
      method: "GET",
      data: {
        ...params,
        status: "all",
        includeInactive: true
      }
    }),
    () => common_api_request.httpRequest({
      url: "/api/products",
      method: "GET",
      data: params
    })
  ]);
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
    header: JSON_HEADER,
    data: payload
  });
};
const updateProductStatus = (productId, onSale) => {
  return common_api_request.httpRequest({
    url: `/api/products/${productId}/status`,
    method: "PATCH",
    header: JSON_HEADER,
    data: { status: onSale ? 1 : 0 }
  });
};
const updateProductSpecs = (productId, specGroups) => {
  return common_api_request.httpRequest({
    url: `/api/products/${productId}/specs`,
    method: "PUT",
    header: JSON_HEADER,
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
        } catch (_) {
          reject(new Error("图片上传返回格式错误"));
        }
      },
      fail: (err) => reject(new Error(err.errMsg || "图片上传失败"))
    });
  });
};
exports.fetchAdminProducts = fetchAdminProducts;
exports.fetchCategories = fetchCategories;
exports.fetchProductSpecs = fetchProductSpecs;
exports.fetchProducts = fetchProducts;
exports.fetchRecommendProducts = fetchRecommendProducts;
exports.updateProduct = updateProduct;
exports.updateProductSpecs = updateProductSpecs;
exports.updateProductStatus = updateProductStatus;
exports.uploadProductImage = uploadProductImage;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/api/product.js.map
