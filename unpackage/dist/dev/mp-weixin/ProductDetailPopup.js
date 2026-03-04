"use strict";
const common_vendor = require("./common/vendor.js");
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "./node-modules/@dcloudio/uni-ui/lib/uni-popup/uni-popup.js";
if (!Math) {
  _easycom_uni_popup();
}
const _sfc_main = {
  __name: "ProductDetailPopup",
  emits: ["confirm"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const emit = __emit;
    const popupRef = common_vendor.ref(null);
    const selectedProd = common_vendor.reactive({ id: null, name: "", price: 0 });
    const sweetOptions = common_vendor.ref(["常规", "七分糖", "五分糖", "不加糖"]);
    const iceOptions = common_vendor.ref(["多冰", "正常冰", "少冰", "去冰", "常温", "热饮"]);
    const currentSweet = common_vendor.ref("常规");
    const currentIce = common_vendor.ref("正常冰");
    const setSweet = (v) => {
      currentSweet.value = v;
    };
    const setIce = (v) => {
      currentIce.value = v;
    };
    const open = (product) => {
      var _a;
      if (!product)
        return;
      selectedProd.id = product.id;
      selectedProd.name = product.name || "";
      selectedProd.price = product.price ?? 0;
      currentSweet.value = "常规";
      currentIce.value = "正常冰";
      (_a = popupRef.value) == null ? void 0 : _a.open();
    };
    const close = () => {
      var _a;
      (_a = popupRef.value) == null ? void 0 : _a.close();
    };
    const addToCart = () => {
      emit("confirm", {
        id: selectedProd.id,
        specs: {
          sweet: currentSweet.value,
          ice: currentIce.value
        }
      });
      close();
    };
    __expose({ open, close });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(selectedProd.name),
        b: common_vendor.f(sweetOptions.value, (s, idx, i0) => {
          return {
            a: common_vendor.t(s),
            b: "sweet-" + idx,
            c: common_vendor.n("spec-tag" + (currentSweet.value === s ? " active" : "")),
            d: common_vendor.o(($event) => setSweet(s), "sweet-" + idx)
          };
        }),
        c: common_vendor.f(iceOptions.value, (i, idx, i0) => {
          return {
            a: common_vendor.t(i),
            b: "ice-" + idx,
            c: common_vendor.n("spec-tag" + (currentIce.value === i ? " active" : "")),
            d: common_vendor.o(($event) => setIce(i), "ice-" + idx)
          };
        }),
        d: common_vendor.o(addToCart),
        e: common_vendor.sr(popupRef, "6255fdd0-0", {
          "k": "popupRef"
        }),
        f: common_vendor.o(close),
        g: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6255fdd0"]]);
exports.MiniProgramPage = MiniProgramPage;
//# sourceMappingURL=../.sourcemap/mp-weixin/ProductDetailPopup.js.map
