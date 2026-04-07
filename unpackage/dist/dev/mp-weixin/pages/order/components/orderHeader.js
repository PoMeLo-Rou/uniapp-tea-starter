"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "orderHeader",
  props: {
    orderType: { type: String, default: "pickup" },
    storeInfo: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["update:orderType"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { safeAreaInsets } = common_vendor.index.getSystemInfoSync();
    const mode = common_vendor.ref(props.orderType);
    const mergedStoreInfo = common_vendor.computed(() => {
      var _a, _b, _c, _d, _e;
      return {
        storeName: ((_a = props.storeInfo) == null ? void 0 : _a.storeName) || "森柠鹤南中路店",
        pickupDistanceText: ((_b = props.storeInfo) == null ? void 0 : _b.pickupDistanceText) || "距离信息待地图API计算",
        deliveryAddressText: ((_c = props.storeInfo) == null ? void 0 : _c.deliveryAddressText) || "广东省广州市白云区鹤龙街道鹤南中路51号",
        deliveryStoreLine: ((_d = props.storeInfo) == null ? void 0 : _d.deliveryStoreLine) || "⇄ 森柠鹤南中路店 ｜ 送出外卖",
        storeSlogan: ((_e = props.storeInfo) == null ? void 0 : _e.storeSlogan) || "new style tea, by inspiration >"
      };
    });
    common_vendor.watch(() => props.orderType, (val) => {
      mode.value = val;
    });
    const setMode = (val) => {
      mode.value = val;
      emit("update:orderType", val);
    };
    const handleOrderModeChange = (val) => {
      if (val === "delivery" || val === "pickup") {
        setMode(val);
      }
    };
    common_vendor.onMounted(() => {
      common_vendor.index.$on("orderModeChange", handleOrderModeChange);
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("orderModeChange", handleOrderModeChange);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: mode.value === "pickup" ? 1 : "",
        b: common_vendor.o(($event) => setMode("pickup")),
        c: mode.value === "delivery" ? 1 : "",
        d: common_vendor.o(($event) => setMode("delivery")),
        e: mode.value === "pickup"
      }, mode.value === "pickup" ? {
        f: common_vendor.t(mergedStoreInfo.value.storeName),
        g: common_vendor.t(mergedStoreInfo.value.pickupDistanceText)
      } : {
        h: common_vendor.t(mergedStoreInfo.value.deliveryAddressText),
        i: common_vendor.t(mergedStoreInfo.value.deliveryStoreLine),
        j: common_vendor.t(mergedStoreInfo.value.storeSlogan)
      }, {
        k: common_vendor.unref(safeAreaInsets).top + "px"
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f6ccaf73"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/order/components/orderHeader.js.map
