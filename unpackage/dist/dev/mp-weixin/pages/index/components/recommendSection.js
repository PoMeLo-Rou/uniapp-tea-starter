"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "recommendSection",
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  emits: ["click"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const onClick = (item) => {
      emit("click", item);
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(__props.list, (item, index, i0) => {
          return {
            a: item.image,
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.price),
            d: common_vendor.o(($event) => onClick(item), item.id || index),
            e: item.id || index,
            f: common_vendor.o(($event) => onClick(item), item.id || index)
          };
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8b79574f"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/index/components/recommendSection.js.map
