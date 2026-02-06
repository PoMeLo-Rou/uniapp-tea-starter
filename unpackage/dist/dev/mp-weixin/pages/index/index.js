"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const banners = common_vendor.ref([
      "https://images.unsplash.com/photo-1544787210-2211d44b565a?w=800",
      // 幻灯片 1
      "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800",
      // 幻灯片 2
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800",
      // 幻灯片 3
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
      // 幻灯片 4
      "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?w=800"
      // 幻灯片 5
    ]);
    const current = common_vendor.ref(0);
    const onSwiperChange = (e) => {
      current.value = e.detail.current || 0;
    };
    const goToOrder = () => {
      common_vendor.index.switchTab({
        url: "/pages/order/order"
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(banners.value, (item, index, i0) => {
          return {
            a: item,
            b: index
          };
        }),
        b: current.value,
        c: common_vendor.o(onSwiperChange),
        d: banners.value.length > 1
      }, banners.value.length > 1 ? {
        e: common_vendor.f(banners.value, (item, index, i0) => {
          return {
            a: index
          };
        }),
        f: 100 / banners.value.length + "%",
        g: 100 / banners.value.length + "%",
        h: 100 / banners.value.length * current.value + "%"
      } : {}, {
        i: common_vendor.o(goToOrder),
        j: common_vendor.o(goToOrder),
        k: common_vendor.f(3, (i, k0, i0) => {
          return {
            a: i
          };
        })
      });
    };
  }
};
wx.createPage(_sfc_main);
