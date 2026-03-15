"use strict";
const common_vendor = require("../../common/vendor.js");
const useMemberStore = common_vendor.defineStore(
  "member",
  () => {
    const userId = common_vendor.ref(null);
    const openid = common_vendor.ref("");
    const nickname = common_vendor.ref("");
    const avatar = common_vendor.ref("");
    const isLoggedIn = common_vendor.computed(() => !!userId.value);
    function setUserInfo(data) {
      userId.value = data.userId || data.id || null;
      openid.value = data.openid || "";
      nickname.value = data.nickname || "";
      avatar.value = data.avatar || "";
    }
    function clearUserInfo() {
      userId.value = null;
      openid.value = "";
      nickname.value = "";
      avatar.value = "";
    }
    return { userId, openid, nickname, avatar, isLoggedIn, setUserInfo, clearUserInfo };
  },
  {
    persist: { key: "member" }
  }
);
exports.useMemberStore = useMemberStore;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/stores/modules/member.js.map
