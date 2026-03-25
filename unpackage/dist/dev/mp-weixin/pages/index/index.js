"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  (bannerBox + memberCard + mainAction + AiChat + CustomTabBar)();
}
const bannerBox = () => "./components/bannerBox.js";
const memberCard = () => "./components/memberCard.js";
const mainAction = () => "./components/mainAction.js";
const CustomTabBar = () => "../../components/custom-tab-bar.js";
const AiChat = () => "../../components/AiChat.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const bannerData = common_vendor.ref([
      "https://images.unsplash.com/photo-1544787210-2211d44b565a?w=800",
      "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800"
    ]);
    const recommendList = common_vendor.ref([
      { id: 101, name: "多肉葡萄", price: 28, image: "/static/logo.png" },
      { id: 102, name: "芝芝茗茶", price: 19, image: "/static/logo.png" },
      { id: 201, name: "烤黑糖波波", price: 22, image: "/static/logo.png" }
    ]);
    const goToOrder = () => {
      common_vendor.index.switchTab({
        url: "/pages/order/order"
      });
    };
    const onRecommendClick = (item) => {
      common_vendor.index.switchTab({
        url: "/pages/order/order",
        success: () => {
          setTimeout(() => {
            common_vendor.index.$emit("openSpec", { productId: item.id });
          }, 300);
        }
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          banners: bannerData.value
        }),
        b: common_vendor.p({
          points: 128,
          level: "尊享会员"
        }),
        c: common_vendor.f(recommendList.value, (item, index, i0) => {
          return {
            a: item.image,
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.price),
            d: common_vendor.o(($event) => onRecommendClick(item), item.id || index),
            e: item.id || index,
            f: common_vendor.o(($event) => onRecommendClick(item), item.id || index)
          };
        }),
        d: common_vendor.o(goToOrder),
        e: common_vendor.p({
          ["current-path"]: "/pages/index/index"
        })
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
