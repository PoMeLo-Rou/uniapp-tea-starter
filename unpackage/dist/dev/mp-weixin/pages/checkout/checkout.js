"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_order = require("../../common/api/order.js");
const common_api_site = require("../../common/api/site.js");
const stores_modules_member = require("../../stores/modules/member.js");
const _sfc_main = {
  __name: "checkout",
  setup(__props) {
    const memberStore = stores_modules_member.useMemberStore();
    const safeAreaInsets = (() => {
      try {
        return common_vendor.index.getSystemInfoSync().safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 };
      } catch (_) {
        return { top: 0, bottom: 0, left: 0, right: 0 };
      }
    })();
    const DEMO_STORE_VALUES = /* @__PURE__ */ new Set([
      "贵港平南中心购物广场店",
      "距离您 3km · 步行约 15 分钟",
      "请选择收货地址 >",
      "➜ 贵港平南中心购物广场店 · 送出外卖",
      "new style tea, by inspiration >"
    ]);
    const orderItems = common_vendor.ref([]);
    const orderType = common_vendor.ref("pickup");
    const paying = common_vendor.ref(false);
    const loading = common_vendor.ref(true);
    const rawStoreInfo = common_vendor.ref({});
    const siteConfig = common_vendor.ref({});
    const sanitizeStoreValue = (value) => {
      if (!value)
        return "";
      const text = String(value).trim();
      if (!text || DEMO_STORE_VALUES.has(text)) {
        return "";
      }
      return text;
    };
    const normalizeItem = (item = {}) => ({
      id: item.id || item.productId || item.product_id || "",
      name: item.name || item.productName || "未命名商品",
      price: Number(item.price || 0),
      image: item.image || "",
      count: Math.max(1, Number(item.count || 1)),
      spec: item.spec || "",
      cal: item.cal || ""
    });
    const hasItems = common_vendor.computed(() => orderItems.value.length > 0);
    const totalCount = common_vendor.computed(
      () => orderItems.value.reduce((sum, item) => sum + Number(item.count || 0), 0)
    );
    const totalPrice = common_vendor.computed(
      () => orderItems.value.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.count || 0), 0)
    );
    const totalPriceText = common_vendor.computed(() => formatAmount(totalPrice.value));
    const resolvedStoreInfo = common_vendor.computed(() => {
      const raw = rawStoreInfo.value || {};
      const cfg = siteConfig.value || {};
      return {
        storeName: sanitizeStoreValue(cfg.storeName) || sanitizeStoreValue(raw.storeName),
        storeAddress: sanitizeStoreValue(cfg.storeAddress) || sanitizeStoreValue(raw.storeAddress),
        pickupDistanceText: sanitizeStoreValue(raw.pickupDistanceText) || sanitizeStoreValue(cfg.pickupDistanceText),
        deliveryAddressText: sanitizeStoreValue(cfg.deliveryAddressText) || sanitizeStoreValue(raw.deliveryAddressText) || sanitizeStoreValue(cfg.storeAddress) || sanitizeStoreValue(raw.storeAddress),
        deliveryStoreLine: sanitizeStoreValue(cfg.deliveryStoreLine) || sanitizeStoreValue(raw.deliveryStoreLine),
        storeSlogan: sanitizeStoreValue(cfg.storeSlogan) || sanitizeStoreValue(raw.storeSlogan)
      };
    });
    const orderTypeLabel = common_vendor.computed(
      () => orderType.value === "delivery" ? "外卖配送" : "到店自取"
    );
    const primaryAddressLine = common_vendor.computed(() => {
      if (orderType.value === "delivery") {
        return resolvedStoreInfo.value.deliveryAddressText || resolvedStoreInfo.value.storeAddress || "配送地址信息待完善";
      }
      return resolvedStoreInfo.value.storeAddress || resolvedStoreInfo.value.pickupDistanceText || "门店地址信息待完善";
    });
    const secondaryAddressLine = common_vendor.computed(() => {
      if (orderType.value === "delivery") {
        return resolvedStoreInfo.value.deliveryStoreLine || resolvedStoreInfo.value.storeSlogan || "";
      }
      return resolvedStoreInfo.value.pickupDistanceText || "";
    });
    const pickupTypeDesc = common_vendor.computed(
      () => resolvedStoreInfo.value.pickupDistanceText || "到店后由门店出杯"
    );
    const deliveryTypeDesc = common_vendor.computed(
      () => resolvedStoreInfo.value.deliveryAddressText || "配送地址信息待完善"
    );
    const formatAmount = (value) => {
      const amount = Number(value);
      return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
    };
    const persistCheckoutOrder = () => {
      try {
        const current = common_vendor.index.getStorageSync("checkoutOrder") || {};
        common_vendor.index.setStorageSync("checkoutOrder", {
          ...current,
          items: orderItems.value,
          orderType: orderType.value,
          storeInfo: rawStoreInfo.value
        });
      } catch (_) {
      }
    };
    common_vendor.watch(orderType, async () => {
      if (loading.value)
        return;
      persistCheckoutOrder();
      if (orderType.value === "pickup") {
        await updatePickupDistance();
      }
    });
    const loadSiteDisplayConfig = async () => {
      try {
        const cfg = await common_api_site.fetchSiteConfig();
        siteConfig.value = cfg || {};
      } catch (_) {
        siteConfig.value = {};
      }
    };
    const updatePickupDistance = async () => {
      if (orderType.value !== "pickup")
        return;
      try {
        const location = await new Promise((resolve, reject) => {
          common_vendor.index.getLocation({
            type: "gcj02",
            success: resolve,
            fail: reject
          });
        });
        const userLat = Number(location.latitude);
        const userLng = Number(location.longitude);
        if (!Number.isFinite(userLat) || !Number.isFinite(userLng))
          return;
        const distance = await common_api_site.fetchStoreDistance({ userLat, userLng });
        if (distance == null ? void 0 : distance.distanceText) {
          rawStoreInfo.value = {
            ...rawStoreInfo.value,
            pickupDistanceText: distance.distanceText
          };
          persistCheckoutOrder();
        }
      } catch (_) {
      }
    };
    const loadCheckoutData = async () => {
      loading.value = true;
      try {
        const raw = common_vendor.index.getStorageSync("checkoutOrder") || {};
        orderItems.value = Array.isArray(raw.items) ? raw.items.map(normalizeItem).filter((item) => item.id) : [];
        orderType.value = raw.orderType === "delivery" ? "delivery" : "pickup";
        rawStoreInfo.value = raw.storeInfo && typeof raw.storeInfo === "object" ? { ...raw.storeInfo } : {};
        await loadSiteDisplayConfig();
        await updatePickupDistance();
      } finally {
        loading.value = false;
      }
    };
    const setOrderType = (type) => {
      orderType.value = type === "delivery" ? "delivery" : "pickup";
    };
    const cancelCheckout = () => {
      try {
        common_vendor.index.navigateBack();
      } catch (_) {
        goToOrderPage();
      }
    };
    const goToOrderPage = () => {
      common_vendor.index.switchTab({ url: "/pages/order/order" });
    };
    const doPay = async () => {
      if (paying.value || !hasItems.value)
        return;
      const userId = Number(memberStore.userId || 0);
      if (!userId) {
        common_vendor.index.showToast({ title: "请先登录后再结算", icon: "none" });
        setTimeout(() => {
          common_vendor.index.navigateTo({ url: "/pages/login/login" });
        }, 500);
        return;
      }
      paying.value = true;
      common_vendor.index.showLoading({ title: "正在创建订单...", mask: true });
      try {
        const orderRes = await common_api_order.createOrder({
          userId,
          items: orderItems.value,
          orderType: orderType.value,
          totalPrice: Number(totalPrice.value)
        });
        const { orderId, orderNo } = orderRes || {};
        common_vendor.index.showLoading({ title: "支付中...", mask: true });
        await common_api_order.payOrder(orderId);
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
          totalPrice: totalPriceText.value,
          items: orderItems.value,
          orderType: orderType.value,
          paidAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        common_vendor.index.showToast({ title: "支付成功", icon: "success", duration: 1500 });
        setTimeout(() => {
          common_vendor.index.switchTab({ url: "/pages/order/order" });
        }, 1500);
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/checkout/checkout.vue:359", "[checkout] pay error:", error);
        common_vendor.index.showModal({
          title: "支付失败",
          content: (error == null ? void 0 : error.message) || "网络异常，请稍后重试",
          showCancel: false
        });
      } finally {
        paying.value = false;
      }
    };
    common_vendor.onLoad(() => {
      loadCheckoutData();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(cancelCheckout),
        b: common_vendor.unref(safeAreaInsets).top + "px",
        c: loading.value
      }, loading.value ? {} : !hasItems.value ? {
        e: common_vendor.o(goToOrderPage)
      } : common_vendor.e({
        f: common_vendor.t(orderTypeLabel.value),
        g: common_vendor.t(resolvedStoreInfo.value.storeName || "门店信息未配置"),
        h: common_vendor.t(primaryAddressLine.value),
        i: secondaryAddressLine.value
      }, secondaryAddressLine.value ? {
        j: common_vendor.t(secondaryAddressLine.value)
      } : {}, {
        k: common_vendor.t(pickupTypeDesc.value),
        l: common_vendor.n(orderType.value === "pickup" ? "active" : ""),
        m: common_vendor.o(($event) => setOrderType("pickup")),
        n: common_vendor.t(deliveryTypeDesc.value),
        o: common_vendor.n(orderType.value === "delivery" ? "active" : ""),
        p: common_vendor.o(($event) => setOrderType("delivery")),
        q: common_vendor.t(totalCount.value),
        r: common_vendor.f(orderItems.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.image || "/static/order.png",
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.count),
            d: item.spec
          }, item.spec ? {
            e: common_vendor.t(item.spec)
          } : {}, {
            f: item.cal
          }, item.cal ? {
            g: common_vendor.t(item.cal)
          } : {}, {
            h: common_vendor.t(formatAmount(item.price)),
            i: common_vendor.t(formatAmount(item.price * item.count)),
            j: `${item.id}-${index}`
          });
        }),
        s: common_vendor.t(totalPriceText.value),
        t: common_vendor.t(totalCount.value),
        v: common_vendor.t(orderTypeLabel.value),
        w: common_vendor.t(totalPriceText.value),
        x: `${common_vendor.unref(safeAreaInsets).bottom + 150}px`
      }), {
        d: !hasItems.value,
        y: hasItems.value
      }, hasItems.value ? {
        z: common_vendor.t(totalPriceText.value),
        A: common_vendor.t(paying.value ? "支付中..." : "确认支付"),
        B: paying.value ? 1 : "",
        C: common_vendor.o(doPay),
        D: paying.value,
        E: `${common_vendor.unref(safeAreaInsets).bottom}px`
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-fd186f5c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/checkout/checkout.js.map
