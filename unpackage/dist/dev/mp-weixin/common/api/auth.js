"use strict";
const common_api_request = require("./request.js");
const wxLogin = ({ code, nickName, avatarUrl }) => {
  return common_api_request.httpRequest({
    url: "/api/auth/wx-login",
    method: "POST",
    header: { "Content-Type": "application/json" },
    data: { code, nickName, avatarUrl }
  });
};
exports.wxLogin = wxLogin;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/api/auth.js.map
