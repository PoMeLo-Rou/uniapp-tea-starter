"use strict";
const common_api_request = require("./request.js");
const JSON_HEADER = { "Content-Type": "application/json" };
const loginByPassword = ({ username, password }) => {
  return common_api_request.httpRequest({
    url: "/api/auth/login",
    method: "POST",
    header: JSON_HEADER,
    data: { username, password }
  });
};
const registerByPassword = ({ username, password, nickname }) => {
  return common_api_request.httpRequest({
    url: "/api/auth/register",
    method: "POST",
    header: JSON_HEADER,
    data: { username, password, nickname }
  });
};
exports.loginByPassword = loginByPassword;
exports.registerByPassword = registerByPassword;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/api/auth.js.map
