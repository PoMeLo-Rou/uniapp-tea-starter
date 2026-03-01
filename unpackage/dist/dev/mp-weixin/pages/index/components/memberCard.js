"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "memberCard",
  props: {
    level: { type: String, default: "尊享会员" },
    points: { type: Number, default: 0 }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(__props.level),
        b: common_vendor.t(__props.points)
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b5ccad09"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/index/components/memberCard.js.map
