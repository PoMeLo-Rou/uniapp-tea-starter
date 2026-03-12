"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_auth = require("../../common/api/auth.js");
if (!Math) {
  (CustomTabBar + OrderHistoryDrawer)();
}
const CustomTabBar = () => "../../components/custom-tab-bar.js";
const OrderHistoryDrawer = () => "../../components/OrderHistoryDrawer.js";
const _sfc_main = {
  __name: "mine",
  setup(__props) {
    const safeAreaInsets = (() => {
      try {
        const sys = common_vendor.index.getSystemInfoSync();
        return sys.safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 };
      } catch (e) {
        return { top: 0, bottom: 0, left: 0, right: 0 };
      }
    })();
    const showOrderDrawer = common_vendor.ref(false);
    const isLoggedIn = common_vendor.ref(false);
    const nickname = common_vendor.ref("游客");
    const userAvatar = common_vendor.ref("https://img.icons8.com/color/96/user-male-circle--v1.png");
    try {
      const storedUser = common_vendor.index.getStorageSync("userInfo");
      if (storedUser && storedUser.userId) {
        isLoggedIn.value = true;
        nickname.value = storedUser.nickname || "茶友";
        userAvatar.value = storedUser.avatar || userAvatar.value;
      }
    } catch (e) {
    }
    const handleMenuClick = (type) => {
      if (type === "order") {
        if (!isLoggedIn.value) {
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          return;
        }
        showOrderDrawer.value = true;
        return;
      }
      common_vendor.index.showToast({
        title: `点击了 ${type} 功能`,
        icon: "none"
      });
    };
    const onLogin = () => {
      common_vendor.index.login({
        provider: "weixin",
        success: (loginRes) => {
          const code = loginRes.code;
          if (!code) {
            common_vendor.index.showToast({ title: "登录失败(code)", icon: "none" });
            return;
          }
          const getProfile = (cb) => {
            if (common_vendor.index.getUserProfile) {
              common_vendor.index.getUserProfile({
                desc: "用于完善会员资料",
                success: (res) => cb(null, res.userInfo || {}),
                fail: () => cb(null, {})
                // 用户拒绝也继续登录，只是不用微信头像昵称
              });
            } else {
              common_vendor.index.getUserInfo({
                success: (res) => cb(null, res.userInfo || {}),
                fail: () => cb(null, {})
              });
            }
          };
          getProfile((err, userInfo) => {
            const nickName = userInfo && userInfo.nickName || nickname.value;
            const avatarUrl = userInfo && userInfo.avatarUrl || userAvatar.value;
            common_vendor.index.showLoading({ title: "登录中...", mask: true });
            common_api_auth.wxLogin({
              code,
              nickName,
              avatarUrl
            }).then((data) => {
              common_vendor.index.hideLoading();
              common_vendor.index.__f__("log", "at pages/mine/mine.vue:157", "userInfo from wechat:", userInfo);
              common_vendor.index.__f__("log", "at pages/mine/mine.vue:158", "data from backend:", data);
              if (!data.userId) {
                common_vendor.index.showToast({ title: "登录失败", icon: "none" });
                return;
              }
              isLoggedIn.value = true;
              nickname.value = data.nickname || nickName || "茶友";
              userAvatar.value = data.avatar || avatarUrl || userAvatar.value;
              common_vendor.index.setStorageSync("userInfo", data);
              common_vendor.index.setStorageSync("userId", data.userId);
              common_vendor.index.showToast({ title: "登录成功", icon: "success" });
            }).catch(() => {
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({ title: "网络异常", icon: "none" });
            });
          });
        },
        fail: () => {
          common_vendor.index.showToast({ title: "登录取消", icon: "none" });
        }
      });
    };
    const onLogout = () => {
      isLoggedIn.value = false;
      nickname.value = "游客";
      userAvatar.value = "https://img.icons8.com/color/96/user-male-circle--v1.png";
      common_vendor.index.removeStorageSync("userInfo");
      common_vendor.index.removeStorageSync("userId");
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userAvatar.value,
        b: common_vendor.t(isLoggedIn.value ? nickname.value : "点击下方按钮登录"),
        c: isLoggedIn.value
      }, isLoggedIn.value ? {} : {}, {
        d: common_vendor.unref(safeAreaInsets).top + "px",
        e: common_vendor.o(($event) => handleMenuClick("order")),
        f: common_vendor.o(($event) => handleMenuClick("address")),
        g: common_vendor.o(($event) => handleMenuClick("service")),
        h: common_vendor.o(($event) => handleMenuClick("about")),
        i: !isLoggedIn.value
      }, !isLoggedIn.value ? {
        j: common_vendor.o(onLogin)
      } : {
        k: common_vendor.o(onLogout)
      }, {
        l: common_vendor.p({
          ["current-path"]: "/pages/mine/mine"
        }),
        m: common_vendor.o(($event) => showOrderDrawer.value = $event),
        n: common_vendor.p({
          show: showOrderDrawer.value
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7c2ebfa5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/mine.js.map
