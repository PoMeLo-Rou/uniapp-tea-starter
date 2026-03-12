"use strict";
const common_api_request = require("./request.js");
const createOrder = (payload) => {
  return common_api_request.httpRequest({
    url: "/api/orders",
    method: "POST",
    header: { "Content-Type": "application/json" },
    data: payload
  });
};
const payOrder = (orderId) => {
  return common_api_request.httpRequest({
    url: `/api/orders/${orderId}/pay`,
    method: "POST",
    header: { "Content-Type": "application/json" }
  });
};
const fetchOrderList = (params) => {
  return common_api_request.httpRequest({
    url: "/api/orders",
    method: "GET",
    data: params
  });
};
const fetchOrderDetail = (id) => {
  return common_api_request.httpRequest({
    url: `/api/orders/${id}`,
    method: "GET"
  });
};
exports.createOrder = createOrder;
exports.fetchOrderDetail = fetchOrderDetail;
exports.fetchOrderList = fetchOrderList;
exports.payOrder = payOrder;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/api/order.js.map
