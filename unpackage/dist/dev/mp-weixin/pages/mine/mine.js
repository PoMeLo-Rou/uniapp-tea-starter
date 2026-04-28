"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_modules_member = require("../../stores/modules/member.js");
if (!Math) {
  (CustomTabBar + OrderHistoryDrawer)();
}
const CustomTabBar = () => "../../components/custom-tab-bar.js";
const OrderHistoryDrawer = () => "../../components/OrderHistoryDrawer.js";
const _sfc_main = {
  __name: "mine",
  setup(__props) {
    const memberStore = stores_modules_member.useMemberStore();
    const safeAreaInsets = (() => {
      try {
        const sys = common_vendor.index.getSystemInfoSync();
        return sys.safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 };
      } catch (_) {
        return { top: 0, bottom: 0, left: 0, right: 0 };
      }
    })();
    const showOrderDrawer = common_vendor.ref(false);
    const isLoggedIn = common_vendor.computed(() => memberStore.isLoggedIn);
    const isAdmin = common_vendor.computed(() => memberStore.isAdmin);
    const username = common_vendor.computed(() => memberStore.username || "");
    const displayNickname = common_vendor.computed(() => memberStore.nickname || memberStore.username || "会员用户");
    const points = common_vendor.computed(() => memberStore.points || 0);
    const coupons = common_vendor.computed(() => memberStore.coupons || 0);
    const balance = common_vendor.computed(() => Number(memberStore.balance || 0));
    const userAvatar = common_vendor.computed(() => memberStore.avatar || "https://img.icons8.com/color/96/user-male-circle--v1.png");
    const requireLogin = () => {
      if (isLoggedIn.value)
        return true;
      common_vendor.index.showToast({ title: "请先登录", icon: "none" });
      setTimeout(() => {
        common_vendor.index.navigateTo({ url: "/pages/login/login" });
      }, 500);
      return false;
    };
    const handleMenuClick = (type) => {
      if (type === "order") {
        if (!requireLogin())
          return;
        showOrderDrawer.value = true;
        return;
      }
      if (type === "admin") {
        if (!requireLogin())
          return;
        if (!isAdmin.value) {
          common_vendor.index.showToast({ title: "无管理员权限", icon: "none" });
          return;
        }
        common_vendor.index.navigateTo({ url: "/pages/admin/index" });
        return;
      }
      common_vendor.index.showToast({
        title: `点击了${type}功能`,
        icon: "none"
      });
    };
    const goToLogin = () => {
      common_vendor.index.navigateTo({ url: "/pages/login/login" });
    };
    const onLogout = () => {
      memberStore.clearUserInfo();
      common_vendor.index.removeStorageSync("token");
      common_vendor.index.showToast({ title: "已退出登录", icon: "success" });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userAvatar.value,
        b: common_vendor.t(isLoggedIn.value ? displayNickname.value : "请先登录账号"),
        c: isLoggedIn.value
      }, isLoggedIn.value ? {
        d: common_vendor.t(username.value)
      } : {}, {
        e: isLoggedIn.value
      }, isLoggedIn.value ? {
        f: common_vendor.t(isAdmin.value ? "管理员" : "会员")
      } : {}, {
        g: common_vendor.unref(safeAreaInsets).top + "px",
        h: common_vendor.t(points.value),
        i: common_vendor.t(coupons.value),
        j: common_vendor.t(balance.value.toFixed(2)),
        k: common_vendor.o(($event) => handleMenuClick("order")),
        l: common_vendor.o(($event) => handleMenuClick("address")),
        m: common_vendor.o(($event) => handleMenuClick("service")),
        n: common_vendor.o(($event) => handleMenuClick("about")),
        o: isAdmin.value
      }, isAdmin.value ? {
        p: common_vendor.o(($event) => handleMenuClick("admin"))
      } : {}, {
        q: !isLoggedIn.value
      }, !isLoggedIn.value ? {
        r: common_vendor.o(goToLogin)
      } : {
        s: common_vendor.o(onLogout)
      }, {
        t: common_vendor.p({
          ["current-path"]: "/pages/mine/mine"
        }),
        v: common_vendor.o(($event) => showOrderDrawer.value = $event),
        w: common_vendor.p({
          show: showOrderDrawer.value
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7c2ebfa5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/mine.js.map
