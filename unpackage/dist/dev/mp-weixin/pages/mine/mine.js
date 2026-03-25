"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_auth = require("../../common/api/auth.js");
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
      } catch (e) {
        return { top: 0, bottom: 0, left: 0, right: 0 };
      }
    })();
    const showOrderDrawer = common_vendor.ref(false);
    const isLoggedIn = common_vendor.computed(() => memberStore.isLoggedIn);
    const isAdmin = common_vendor.computed(() => memberStore.isAdmin);
    const nickname = common_vendor.computed(() => memberStore.nickname || "游客");
    const points = common_vendor.computed(() => memberStore.points || 0);
    const userAvatar = common_vendor.computed(() => memberStore.avatar || "https://img.icons8.com/color/96/user-male-circle--v1.png");
    const handleMenuClick = (type) => {
      if (type === "order") {
        if (!isLoggedIn.value) {
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          return;
        }
        showOrderDrawer.value = true;
        return;
      }
      if (type === "admin") {
        if (!isLoggedIn.value) {
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          return;
        }
        if (!isAdmin.value) {
          common_vendor.index.showToast({ title: "无管理员权限", icon: "none" });
          return;
        }
        common_vendor.index.navigateTo({ url: "/pages/admin/product-manage" });
        return;
      }
      common_vendor.index.showToast({
        title: `点击了 ${type} 功能`,
        icon: "none"
      });
    };
    const onGetPhoneNumber = (e) => {
      common_vendor.index.__f__("log", "at pages/mine/mine.vue:136", "[mine] onGetPhoneNumber callback triggered:", e);
      const detail = e && e.detail ? e.detail : {};
      const phoneCode = detail.code || "";
      const encryptedData = detail.encryptedData || "";
      const iv = detail.iv || "";
      const ok = String(detail.errMsg || "").includes(":ok");
      common_vendor.index.__f__("log", "at pages/mine/mine.vue:142", "[mine] phone auth detail:", {
        errMsg: detail.errMsg,
        ok,
        phoneCodeLen: phoneCode ? String(phoneCode).length : 0,
        encryptedDataLen: encryptedData ? String(encryptedData).length : 0,
        ivLen: iv ? String(iv).length : 0
      });
      if (!ok) {
        common_vendor.index.showToast({ title: "你已取消手机号授权", icon: "none" });
        return;
      }
      common_vendor.index.login({
        provider: "weixin",
        success: (loginRes) => {
          const code = loginRes.code;
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:158", "[mine] uni.login success, codeLen=", code ? String(code).length : 0);
          if (!code) {
            common_vendor.index.showToast({ title: "登录失败(code)", icon: "none" });
            return;
          }
          common_vendor.index.showLoading({ title: "登录中...", mask: true });
          common_api_auth.wxPhoneLogin({
            code,
            phoneCode,
            encryptedData,
            iv,
            nickName: nickname.value || "茶友",
            avatarUrl: userAvatar.value || ""
          }).then((data) => {
            common_vendor.index.hideLoading();
            if (!data.userId) {
              common_vendor.index.showToast({ title: "登录失败", icon: "none" });
              return;
            }
            memberStore.setUserInfo(data);
            common_vendor.index.showToast({ title: "登录成功", icon: "success" });
          }).catch((err) => {
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "网络异常", icon: "none" });
          });
        },
        fail: () => {
          common_vendor.index.showToast({ title: "登录取消", icon: "none" });
        }
      });
    };
    const onLogout = () => {
      memberStore.clearUserInfo();
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userAvatar.value,
        b: common_vendor.t(isLoggedIn.value ? nickname.value : "点击下方按钮登录"),
        c: isLoggedIn.value
      }, isLoggedIn.value ? {
        d: common_vendor.t(isAdmin.value ? "管理员" : "会员")
      } : {}, {
        e: common_vendor.unref(safeAreaInsets).top + "px",
        f: common_vendor.t(points.value),
        g: common_vendor.o(($event) => handleMenuClick("order")),
        h: common_vendor.o(($event) => handleMenuClick("address")),
        i: common_vendor.o(($event) => handleMenuClick("service")),
        j: common_vendor.o(($event) => handleMenuClick("about")),
        k: isAdmin.value
      }, isAdmin.value ? {
        l: common_vendor.o(($event) => handleMenuClick("admin"))
      } : {}, {
        m: !isLoggedIn.value
      }, !isLoggedIn.value ? {
        n: common_vendor.o(onGetPhoneNumber)
      } : {
        o: common_vendor.o(onLogout)
      }, {
        p: common_vendor.p({
          ["current-path"]: "/pages/mine/mine"
        }),
        q: common_vendor.o(($event) => showOrderDrawer.value = $event),
        r: common_vendor.p({
          show: showOrderDrawer.value
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7c2ebfa5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/mine.js.map
