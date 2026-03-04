"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "bannerBox",
  props: {
    banners: {
      type: Array,
      default: () => [
        "https://images.unsplash.com/photo-1544787210-2211d44b565a?w=800",
        "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800",
        "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800",
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
        "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?w=800"
      ]
    }
  },
  setup(__props) {
    const { safeAreaInsets } = common_vendor.index.getSystemInfoSync();
    const current = common_vendor.ref(0);
    const onSwiperChange = (e) => {
      current.value = e.detail.current;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(__props.banners, (item, index, i0) => {
          return {
            a: item,
            b: index
          };
        }),
        b: current.value,
        c: common_vendor.o(onSwiperChange),
        d: __props.banners.length > 1
      }, __props.banners.length > 1 ? {
        e: 100 / __props.banners.length + "%",
        f: `translateX(${current.value * 100}%)`
      } : {}, {
        g: common_vendor.unref(safeAreaInsets).top + "px"
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8e086060"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/index/components/bannerBox.js.map
