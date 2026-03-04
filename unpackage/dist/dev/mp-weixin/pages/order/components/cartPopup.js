"use strict";
const common_vendor = require("../../../common/vendor.js");
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "../../../node-modules/@dcloudio/uni-ui/lib/uni-popup/uni-popup.js";
if (!Math) {
  _easycom_uni_popup();
}
const _sfc_main = {
  __name: "cartPopup",
  props: {
    show: Boolean,
    items: { type: Object, default: () => ({}) },
    getProduct: { type: Function, default: () => null }
  },
  emits: ["update:show", "update", "clear"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const popupRef = common_vendor.ref(null);
    const cartList = common_vendor.computed(() => {
      const list = [];
      const entries = Object.entries(props.items || {});
      entries.forEach(([key, raw]) => {
        if (!raw)
          return;
        const p = props.getProduct ? props.getProduct(raw.id) : null;
        if (!p)
          return;
        const count = raw.count ?? 0;
        const specs = raw.specs || {};
        const specText = [specs.sweet, specs.ice].filter(Boolean).join(" / ");
        list.push({
          key,
          id: raw.id,
          name: p.name,
          price: p.price,
          count,
          specs,
          specText
        });
      });
      return list;
    });
    common_vendor.watch(() => props.show, (val) => {
      if (val) {
        common_vendor.nextTick$1(() => {
          setTimeout(() => {
            const popup = popupRef.value;
            if (popup && typeof popup.open === "function")
              popup.open();
          }, 50);
        });
      } else {
        const popup = popupRef.value;
        if (popup && typeof popup.close === "function")
          popup.close();
      }
    }, { immediate: true });
    const close = () => {
      emit("update:show", false);
    };
    const onClear = () => {
      emit("clear");
      close();
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(onClear),
        b: common_vendor.f(cartList.value, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.name),
            b: item.specText
          }, item.specText ? {
            c: common_vendor.t(item.specText)
          } : {}, {
            d: common_vendor.t(item.price * item.count),
            e: common_vendor.o(($event) => emit("update", item.key, -1), item.key),
            f: common_vendor.t(item.count),
            g: common_vendor.o(($event) => emit("update", item.key, 1), item.key),
            h: item.key
          });
        }),
        c: cartList.value.length === 0
      }, cartList.value.length === 0 ? {} : {}, {
        d: common_vendor.sr(popupRef, "3b58c82a-0", {
          "k": "popupRef"
        }),
        e: common_vendor.o(close),
        f: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3b58c82a"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/order/components/cartPopup.js.map
