"use strict";
const common_api_request = require("./request.js");
const JSON_HEADER = { "Content-Type": "application/json" };
const isFallbackableError = (error) => {
  const message = String((error == null ? void 0 : error.message) || "").toLowerCase();
  return message.includes("(404)") || message.includes("(405)") || message.includes("(501)") || message.includes("cannot get") || message.includes("cannot post") || message.includes("cannot patch") || message.includes("cannot put") || message.includes("not found");
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
const createOrder = (payload) => {
  return common_api_request.httpRequest({
    url: "/api/orders",
    method: "POST",
    header: JSON_HEADER,
    data: payload
  });
};
const payOrder = (orderId) => {
  return common_api_request.httpRequest({
    url: `/api/orders/${orderId}/pay`,
    method: "POST",
    header: JSON_HEADER
  });
};
const confirmOrderPickup = (orderId) => {
  return common_api_request.httpRequest({
    url: `/api/orders/${orderId}/confirm-pickup`,
    method: "POST",
    header: JSON_HEADER
  });
};
const fetchOrderList = (params) => {
  return common_api_request.httpRequest({
    url: "/api/orders",
    method: "GET",
    data: params
  });
};
const fetchAdminOrderList = (params = {}) => {
  return requestWithFallbacks([
    () => common_api_request.httpRequest({
      url: "/api/admin/orders",
      method: "GET",
      data: params
    }),
    () => common_api_request.httpRequest({
      url: "/api/orders",
      method: "GET",
      data: params
    })
  ]);
};
const fetchOrderDetail = (id) => {
  return common_api_request.httpRequest({
    url: `/api/orders/${id}`,
    method: "GET"
  });
};
const updateOrderStatus = (orderId, status) => {
  return requestWithFallbacks([
    () => common_api_request.httpRequest({
      url: `/api/admin/orders/${orderId}/status`,
      method: "PATCH",
      header: JSON_HEADER,
      data: { status }
    }),
    () => common_api_request.httpRequest({
      url: `/api/orders/${orderId}/status`,
      method: "PATCH",
      header: JSON_HEADER,
      data: { status }
    }),
    () => common_api_request.httpRequest({
      url: `/api/admin/orders/${orderId}`,
      method: "PUT",
      header: JSON_HEADER,
      data: { status }
    }),
    () => common_api_request.httpRequest({
      url: `/api/orders/${orderId}`,
      method: "PUT",
      header: JSON_HEADER,
      data: { status }
    })
  ]);
};
exports.confirmOrderPickup = confirmOrderPickup;
exports.createOrder = createOrder;
exports.fetchAdminOrderList = fetchAdminOrderList;
exports.fetchOrderDetail = fetchOrderDetail;
exports.fetchOrderList = fetchOrderList;
exports.payOrder = payOrder;
exports.updateOrderStatus = updateOrderStatus;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/api/order.js.map
