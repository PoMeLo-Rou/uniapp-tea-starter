"use strict";
const common_api_request = require("./request.js");
const wxPhoneLogin = ({ code, phoneCode, encryptedData, iv, nickName, avatarUrl }) => {
  return common_api_request.httpRequest({
    url: "/api/auth/wx-phone-login",
    method: "POST",
    header: { "Content-Type": "application/json" },
    data: { code, phoneCode, encryptedData, iv, nickName, avatarUrl }
  });
};
exports.wxPhoneLogin = wxPhoneLogin;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/api/auth.js.map
