"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_api_order = require("../../common/api/order.js");
const stores_modules_member = require("../../stores/modules/member.js");
const _sfc_main = {
  __name: "checkout",
  setup(__props) {
    const { safeAreaInsets } = common_vendor.index.getSystemInfoSync();
    const memberStore = stores_modules_member.useMemberStore();
    const orderItems = common_vendor.ref([]);
    const orderType = common_vendor.ref("pickup");
    const paying = common_vendor.ref(false);
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
          if (raw.orderType)
            orderType.value = raw.orderType;
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
    const cancelCheckout = () => {
      try {
        common_vendor.index.navigateBack();
      } catch (e) {
        common_vendor.index.switchTab({ url: "/pages/order/order" });
      }
    };
    const doPay = async () => {
      if (paying.value)
        return;
      if (!orderItems.value.length) {
        common_vendor.index.showToast({ title: "订单为空", icon: "none" });
        return;
      }
      paying.value = true;
      common_vendor.index.showLoading({ title: "正在创建订单...", mask: true });
      try {
        const storedUserId = Number(memberStore.userId || 0) || 1;
        const orderRes = await common_api_order.createOrder({
          userId: storedUserId,
          items: orderItems.value,
          orderType: orderType.value,
          totalPrice: Number(totalPrice.value)
        });
        const { orderId, orderNo } = orderRes;
        common_vendor.index.__f__("log", "at pages/checkout/checkout.vue:202", "[checkout] 订单已创建:", orderNo, "id:", orderId);
        common_vendor.index.showLoading({ title: "支付中...", mask: true });
        await common_api_order.payOrder(orderId);
        common_vendor.index.__f__("log", "at pages/checkout/checkout.vue:208", "[checkout] 支付成功, orderId:", orderId);
        common_vendor.index.hideLoading();
        const deltaPoints = Math.max(0, Math.round(Number(totalPrice.value) || 0));
        if (deltaPoints > 0) {
          memberStore.points = Number(memberStore.points || 0) + deltaPoints;
        }
        common_vendor.index.removeStorageSync("checkoutOrder");
        common_vendor.index.setStorageSync("justPaid", true);
        common_vendor.index.setStorageSync("lastPaidOrder", {
          orderId,
          orderNo,
          totalPrice: totalPrice.value,
          items: orderItems.value,
          orderType: orderType.value,
          paidAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        common_vendor.index.showToast({ title: "支付成功！", icon: "success", duration: 1500 });
        setTimeout(() => {
          common_vendor.index.switchTab({ url: "/pages/order/order" });
        }, 1500);
      } catch (err) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/checkout/checkout.vue:236", "[checkout] 支付流程出错:", err);
        common_vendor.index.showModal({
          title: "支付失败",
          content: err.message || "网络异常，请稍后重试",
          showCancel: false
        });
      } finally {
        paying.value = false;
      }
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(cancelCheckout),
        b: common_vendor.unref(safeAreaInsets).top + "px",
        c: common_assets._imports_0$1,
        d: common_vendor.n(orderType.value === "pickup" ? "active" : ""),
        e: common_vendor.o(($event) => orderType.value = "pickup"),
        f: common_vendor.n(orderType.value === "delivery" ? "active" : ""),
        g: common_vendor.o(($event) => orderType.value = "delivery"),
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
        n: common_vendor.t(paying.value ? "支付中..." : "支付"),
        o: paying.value ? 1 : "",
        p: common_vendor.o(doPay),
        q: paying.value
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-fd186f5c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/checkout/checkout.js.map
