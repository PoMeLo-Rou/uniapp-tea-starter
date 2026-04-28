"use strict";
const common_vendor = require("../../../common/vendor.js");
const stores_modules_member = require("../../../stores/modules/member.js");
const _sfc_main = {
  __name: "memberCard",
  setup(__props) {
    const memberStore = stores_modules_member.useMemberStore();
    const welcomeText = common_vendor.computed(() => memberStore.nickname ? `你好，${memberStore.nickname}` : "你好，茶友");
    const levelText = common_vendor.computed(() => memberStore.isLoggedIn ? memberStore.levelName || "普通会员" : "点击登录");
    const goToMemberCenter = () => {
      if (!memberStore.isLoggedIn) {
        common_vendor.index.navigateTo({ url: "/pages/login/login" });
        return;
      }
      common_vendor.index.switchTab({ url: "/pages/mine/mine" });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(welcomeText.value),
        b: common_vendor.t(levelText.value),
        c: common_vendor.t(common_vendor.unref(memberStore).points || 0),
        d: common_vendor.o(goToMemberCenter)
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b5ccad09"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/index/components/memberCard.js.map
