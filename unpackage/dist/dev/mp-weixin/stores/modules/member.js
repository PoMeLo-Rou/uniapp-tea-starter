"use strict";
const common_vendor = require("../../common/vendor.js");
const useMemberStore = common_vendor.defineStore(
  "member",
  () => {
    const ADMIN_USER_ID_WHITELIST = [];
    const userId = common_vendor.ref(null);
    const openid = common_vendor.ref("");
    const nickname = common_vendor.ref("");
    const avatar = common_vendor.ref("");
    const phone = common_vendor.ref("");
    const points = common_vendor.ref(0);
    const coupons = common_vendor.ref(0);
    const balance = common_vendor.ref(0);
    const role = common_vendor.ref("");
    const roles = common_vendor.ref([]);
    const permissions = common_vendor.ref([]);
    const isLoggedIn = common_vendor.computed(() => !!userId.value);
    const isAdmin = common_vendor.computed(() => {
      if (!userId.value)
        return false;
      if (ADMIN_USER_ID_WHITELIST.includes(Number(userId.value)))
        return true;
      if (role.value === "admin")
        return true;
      if (Array.isArray(roles.value) && roles.value.includes("admin"))
        return true;
      if (Array.isArray(permissions.value) && (permissions.value.includes("product:manage") || permissions.value.includes("admin:*"))) {
        return true;
      }
      return false;
    });
    function setUserInfo(data) {
      userId.value = data.userId || data.id || null;
      openid.value = data.openid || "";
      nickname.value = data.nickname || "";
      avatar.value = data.avatar || "";
      phone.value = data.phone || "";
      points.value = Number(data.points || 0);
      coupons.value = Number(data.coupons || 0);
      balance.value = Number(data.balance || 0);
      const isAdminFlag = data.isAdmin === true || Number(data.isAdmin) === 1;
      if (data.role) {
        role.value = String(data.role).toLowerCase();
      } else if (isAdminFlag) {
        role.value = "admin";
      } else {
        role.value = "user";
      }
      roles.value = Array.isArray(data.roles) ? data.roles.map((item) => String(item).toLowerCase()) : [];
      permissions.value = Array.isArray(data.permissions) ? data.permissions.map((item) => String(item)) : [];
    }
    function clearUserInfo() {
      userId.value = null;
      openid.value = "";
      nickname.value = "";
      avatar.value = "";
      phone.value = "";
      points.value = 0;
      coupons.value = 0;
      balance.value = 0;
      role.value = "";
      roles.value = [];
      permissions.value = [];
    }
    return {
      userId,
      openid,
      nickname,
      avatar,
      phone,
      points,
      coupons,
      balance,
      role,
      roles,
      permissions,
      isLoggedIn,
      isAdmin,
      setUserInfo,
      clearUserInfo
    };
  },
  {
    persist: { key: "member" }
  }
);
exports.useMemberStore = useMemberStore;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/stores/modules/member.js.map
