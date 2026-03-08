"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "checkout",
  setup(__props) {
    const safeAreaInsets = (() => {
      try {
        const sys = common_vendor.index.getSystemInfoSync();
        return sys.safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 };
      } catch (e) {
        return { top: 0, bottom: 0, left: 0, right: 0 };
      }
    })();
    const orderItems = common_vendor.ref([]);
    const orderType = common_vendor.ref("dine");
    const totalPrice = common_vendor.computed(() => {
      return orderItems.value.reduce((sum, it) => sum + it.price * it.count, 0).toFixed(2);
    });
    const matchList = common_vendor.ref([
      { id: 1, name: "茉莉绿妍凤梨...", price: 32.8, image: "" },
      { id: 2, name: "绿妍蝴蝶酥", price: 3.5, image: "" },
      { id: 3, name: "金凤茶酥", price: 1.9, image: "" }
    ]);
    common_vendor.onMounted(() => {
      try {
        const raw = common_vendor.index.getStorageSync("checkoutOrder");
        if (raw && raw.items && raw.items.length) {
          orderItems.value = raw.items;
          return;
        }
      } catch (e) {
      }
      orderItems.value = [
        {
          id: 101,
          name: "奇兰苹果杏(无柠檬叶版)",
          price: 19,
          image: "",
          count: 1,
          spec: "冰(推荐),推荐,少甜(推荐),可降解吸管",
          cal: "65"
        }
      ];
    });
    const goDiy = () => {
      common_vendor.index.showToast({ title: "去定制", icon: "none" });
    };
    const addMatch = () => {
      common_vendor.index.showToast({ title: "已加入搭配", icon: "none" });
    };
    const openCard = () => {
      common_vendor.index.showToast({ title: "金喜卡", icon: "none" });
    };
    const openCoupon = () => {
      common_vendor.index.showToast({ title: "喜茶券", icon: "none" });
    };
    const doPay = () => {
      common_vendor.index.showToast({ title: "支付演示", icon: "none" });
    };
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0$1,
        b: common_vendor.unref(safeAreaInsets).bottom + "px",
        c: common_vendor.n(orderType.value === "dine" ? "active" : ""),
        d: common_vendor.o(($event) => orderType.value = "dine"),
        e: common_vendor.n(orderType.value === "takeout" ? "active" : ""),
        f: common_vendor.o(($event) => orderType.value = "takeout"),
        g: common_vendor.o(goDiy),
        h: common_vendor.f(orderItems.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.image || "/static/logo.png",
            b: item.cal
          }, item.cal ? {
            c: common_vendor.t(item.cal)
          } : {}, {
            d: common_vendor.t(item.name),
            e: common_vendor.t(item.spec || ""),
            f: common_vendor.t(item.price),
            g: common_vendor.t(item.count),
            h: index
          });
        }),
        i: common_vendor.f(matchList.value, (m, i, i0) => {
          return {
            a: m.image || "/static/logo.png",
            b: common_vendor.t(m.name),
            c: common_vendor.t(m.price),
            d: i,
            e: common_vendor.o(($event) => addMatch(), i)
          };
        }),
        j: common_vendor.o(openCard),
        k: common_vendor.o(openCoupon),
        l: common_vendor.t(totalPrice.value),
        m: common_vendor.o(doPay)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-fd186f5c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/checkout/checkout.js.map
