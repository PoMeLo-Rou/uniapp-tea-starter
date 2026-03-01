"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  __name: "custom-tab-bar",
  props: {
    /** 当前页面路径，用于高亮对应 tab */
    currentPath: {
      type: String,
      default: ""
    }
  },
  setup(__props) {
    const props = __props;
    const list = [
      {
        pagePath: "/pages/index/index",
        text: "点单",
        iconPath: "/static/index.png",
        selectedIconPath: "/static/index-selected.png"
      },
      {
        pagePath: "/pages/order/order",
        text: "订单",
        iconPath: "/static/order.png",
        selectedIconPath: "/static/order-selected.png"
      },
      {
        pagePath: "/pages/mine/mine",
        text: "我的",
        iconPath: "/static/mine.png",
        selectedIconPath: "/static/mine-selected.png"
      }
    ];
    const switchTab = (item) => {
      if (props.currentPath === item.pagePath)
        return;
      common_vendor.index.switchTab({ url: item.pagePath });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(list, (item, index, i0) => {
          return {
            a: __props.currentPath === item.pagePath ? item.selectedIconPath : item.iconPath,
            b: common_vendor.t(item.text),
            c: index,
            d: __props.currentPath === item.pagePath ? 1 : "",
            e: common_vendor.o(($event) => switchTab(item), index)
          };
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8fac706f"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/custom-tab-bar.js.map
