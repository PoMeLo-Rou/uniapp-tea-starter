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
const API_BASE = "http://localhost:3000";
const _sfc_main = {
  __name: "ProductDetailPopup",
  emits: ["confirm"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const emit = __emit;
    const popupRef = common_vendor.ref(null);
    const selectedProd = common_vendor.reactive({ id: null, name: "", price: 0 });
    const specGroups = common_vendor.ref([]);
    const currentSweetId = common_vendor.ref(null);
    const currentTempId = common_vendor.ref(null);
    const currentIceId = common_vendor.ref(null);
    const sweetGroup = common_vendor.computed(
      () => specGroups.value.find((g) => g.groupCode === "sweet") || null
    );
    const tempGroup = common_vendor.computed(
      () => specGroups.value.find((g) => g.groupCode === "temp") || null
    );
    const iceGroup = common_vendor.computed(
      () => specGroups.value.find((g) => g.groupCode === "ice") || null
    );
    const currentSweetOption = common_vendor.computed(() => {
      const g = sweetGroup.value;
      if (!g)
        return null;
      return g.options.find((o) => o.id === currentSweetId.value) || null;
    });
    const currentTempOption = common_vendor.computed(() => {
      const g = tempGroup.value;
      if (!g)
        return null;
      return g.options.find((o) => o.id === currentTempId.value) || null;
    });
    const currentIceOption = common_vendor.computed(() => {
      const g = iceGroup.value;
      if (!g)
        return null;
      return g.options.find((o) => o.id === currentIceId.value) || null;
    });
    const showIceGroup = common_vendor.computed(() => {
      const temp = currentTempOption.value;
      if (!iceGroup.value || !temp)
        return false;
      return temp.code === "temp_cold";
    });
    const setSweet = (opt) => {
      if (!opt)
        return;
      currentSweetId.value = opt.id;
    };
    const setTemp = (opt) => {
      if (!opt)
        return;
      currentTempId.value = opt.id;
      if (opt.code !== "temp_cold") {
        currentIceId.value = null;
      } else if (iceGroup.value && iceGroup.value.options.length > 0 && !currentIceId.value) {
        currentIceId.value = iceGroup.value.options[0].id;
      }
    };
    const setIce = (opt) => {
      if (!opt)
        return;
      currentIceId.value = opt.id;
    };
    const fetchSpecs = (productId) => {
      if (!productId)
        return;
      common_vendor.index.request({
        url: `${API_BASE}/api/products/${productId}/specs`,
        method: "GET",
        success: (res) => {
          specGroups.value = res.data || [];
          const s = sweetGroup.value;
          currentSweetId.value = s && s.options.length ? s.options[0].id : null;
          const t = tempGroup.value;
          if (t && t.options.length) {
            const cold = t.options.find((o) => o.code === "temp_cold");
            currentTempId.value = (cold || t.options[0]).id;
          } else {
            currentTempId.value = null;
          }
          const i = iceGroup.value;
          if (i && i.options.length && showIceGroup.value) {
            currentIceId.value = i.options[0].id;
          } else {
            currentIceId.value = null;
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/order/components/ProductDetailPopup.vue:165", "fetch specs error:", err);
          specGroups.value = [];
          currentSweetId.value = null;
          currentTempId.value = null;
          currentIceId.value = null;
        }
      });
    };
    const open = (product) => {
      var _a;
      if (!product)
        return;
      selectedProd.id = product.id;
      selectedProd.name = product.name || "";
      selectedProd.price = product.price ?? 0;
      (_a = popupRef.value) == null ? void 0 : _a.open();
      fetchSpecs(product.id);
    };
    const close = () => {
      var _a;
      (_a = popupRef.value) == null ? void 0 : _a.close();
    };
    const addToCart = () => {
      var _a;
      const sweetText = ((_a = currentSweetOption.value) == null ? void 0 : _a.name) || "";
      let iceText = "";
      const temp = currentTempOption.value;
      const ice = currentIceOption.value;
      if (temp) {
        if (temp.code === "temp_cold") {
          iceText = (ice == null ? void 0 : ice.name) || temp.name;
        } else {
          iceText = temp.name;
        }
      } else if (ice) {
        iceText = ice.name;
      }
      emit("confirm", {
        id: selectedProd.id,
        specs: {
          sweet: sweetText,
          ice: iceText
        }
      });
      close();
    };
    __expose({ open, close });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(selectedProd.name),
        b: sweetGroup.value
      }, sweetGroup.value ? {
        c: common_vendor.t(sweetGroup.value.groupName),
        d: common_vendor.f(sweetGroup.value.options, (opt, k0, i0) => {
          return {
            a: common_vendor.t(opt.name),
            b: "sweet-" + opt.id,
            c: common_vendor.n("spec-tag" + (currentSweetId.value === opt.id ? " active" : "")),
            d: common_vendor.o(($event) => setSweet(opt), "sweet-" + opt.id)
          };
        })
      } : {}, {
        e: tempGroup.value
      }, tempGroup.value ? {
        f: common_vendor.t(tempGroup.value.groupName),
        g: common_vendor.f(tempGroup.value.options, (opt, k0, i0) => {
          return {
            a: common_vendor.t(opt.name),
            b: "temp-" + opt.id,
            c: common_vendor.n("spec-tag" + (currentTempId.value === opt.id ? " active" : "")),
            d: common_vendor.o(($event) => setTemp(opt), "temp-" + opt.id)
          };
        })
      } : {}, {
        h: iceGroup.value && showIceGroup.value
      }, iceGroup.value && showIceGroup.value ? {
        i: common_vendor.t(iceGroup.value.groupName),
        j: common_vendor.f(iceGroup.value.options, (opt, k0, i0) => {
          return {
            a: common_vendor.t(opt.name),
            b: "ice-" + opt.id,
            c: common_vendor.n("spec-tag" + (currentIceId.value === opt.id ? " active" : "")),
            d: common_vendor.o(($event) => setIce(opt), "ice-" + opt.id)
          };
        })
      } : {}, {
        k: common_vendor.o(addToCart),
        l: common_vendor.sr(popupRef, "6255fdd0-0", {
          "k": "popupRef"
        }),
        m: common_vendor.o(close),
        n: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6255fdd0"]]);
exports.MiniProgramPage = MiniProgramPage;
//# sourceMappingURL=../.sourcemap/mp-weixin/ProductDetailPopup.js.map
