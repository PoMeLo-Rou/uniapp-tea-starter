"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "checkout",
  setup(__props) {
    const { safeAreaInsets } = common_vendor.index.getSystemInfoSync();
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
      function applyOrderTypePref() {
        const pref = common_vendor.index.getStorageSync("orderTypePref");
        if (pref === "takeout" || pref === "dine") {
          orderType.value = pref;
        }
      }
      try {
        const raw = common_vendor.index.getStorageSync("checkoutOrder");
        if (raw && raw.items && raw.items.length) {
          orderItems.value = raw.items;
          if (raw.orderType === "takeout" || raw.orderType === "dine") {
            orderType.value = raw.orderType;
          } else {
            applyOrderTypePref();
          }
          return;
        }
      } catch (e) {
      }
      applyOrderTypePref();
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
    const cancelCheckout = () => {
      try {
        common_vendor.index.navigateBack();
      } catch (e) {
        common_vendor.index.switchTab({ url: "/pages/order/order" });
      }
    };
    const doPay = () => {
      const items = orderItems.value;
      if (!items || items.length === 0) {
        common_vendor.index.showToast({ title: "请先添加商品", icon: "none" });
        return;
      }
      const total = Number(totalPrice.value);
      if (total <= 0) {
        common_vendor.index.showToast({ title: "订单金额异常", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "提交中..." });
      const orderNo = "ORD" + Date.now();
      const orderData = {
        order_no: orderNo,
        order_type: orderType.value,
        total_amount: total,
        store_name: "贵港平南中心购物广场店",
        status: "paid",
        created_at: Date.now(),
        items: items.map((it) => ({
          name: it.name,
          image: it.image || "",
          spec: it.spec || "",
          price: it.price,
          count: it.count
        }))
      };
      common_vendor.index.setStorageSync("lastOrder", orderData);
      try {
        const history = common_vendor.index.getStorageSync("orderHistory") || [];
        common_vendor.index.setStorageSync("orderHistory", [orderData, ...history].slice(0, 50));
      } catch (e) {
      }
      common_vendor.index.removeStorageSync("checkoutOrder");
      common_vendor.index.$emit("orderSuccess");
      common_vendor.index.hideLoading();
      common_vendor.index.showToast({ title: "支付成功", icon: "success" });
      setTimeout(() => {
        common_vendor.index.redirectTo({ url: "/pages/order/detail?id=local" });
      }, 800);
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(cancelCheckout),
        b: common_vendor.unref(safeAreaInsets).top + "px",
        c: common_assets._imports_0$1,
        d: common_vendor.n(orderType.value === "dine" ? "active" : ""),
        e: common_vendor.o(($event) => orderType.value = "dine"),
        f: common_vendor.n(orderType.value === "takeout" ? "active" : ""),
        g: common_vendor.o(($event) => orderType.value = "takeout"),
        h: common_vendor.o(goDiy),
        i: common_vendor.f(orderItems.value, (item, index, i0) => {
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
        j: common_vendor.f(matchList.value, (m, i, i0) => {
          return {
            a: m.image || "/static/logo.png",
            b: common_vendor.t(m.name),
            c: common_vendor.t(m.price),
            d: i,
            e: common_vendor.o(($event) => addMatch(), i)
          };
        }),
        k: common_vendor.o(openCard),
        l: common_vendor.o(openCoupon),
        m: common_vendor.t(totalPrice.value),
        n: common_vendor.o(doPay)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-fd186f5c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/checkout/checkout.js.map
