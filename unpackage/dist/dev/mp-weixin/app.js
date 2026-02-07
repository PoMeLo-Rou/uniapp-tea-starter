"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const store_loading = require("./store/loading.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/order/order.js";
  "./pages/mine/mine.js";
}
const _sfc_main$1 = {
  name: "LoadingMask",
  props: {
    // 是否显示
    visible: {
      type: Boolean,
      default: false
    },
    // 提示文字
    title: {
      type: String,
      default: "加载中..."
    },
    // 自定义 logo 图片地址（设置后优先显示图片）
    logo: {
      type: String,
      default: ""
    },
    // logo 是否旋转
    logoSpin: {
      type: Boolean,
      default: true
    },
    // 内置样式类型：'spinner' | 'dots' | 'tea'
    styleType: {
      type: String,
      default: "tea"
    },
    // 是否背景模糊
    blur: {
      type: Boolean,
      default: true
    },
    // 点击遮罩是否关闭（一般 loading 不关闭，按需开启）
    maskClosable: {
      type: Boolean,
      default: false
    }
  },
  emits: ["maskTap"],
  setup(props, { emit }) {
    const onMaskTap = () => {
      if (props.maskClosable)
        emit("maskTap");
    };
    return { onMaskTap };
  }
};
function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.visible
  }, $props.visible ? common_vendor.e({
    b: $props.logo
  }, $props.logo ? {
    c: $props.logoSpin ? 1 : "",
    d: $props.logo
  } : common_vendor.e({
    e: $props.styleType === "spinner"
  }, $props.styleType === "spinner" ? {} : $props.styleType === "dots" ? {} : {}, {
    f: $props.styleType === "dots"
  }), {
    g: $props.title
  }, $props.title ? {
    h: common_vendor.t($props.title)
  } : {}, {
    i: common_vendor.o(() => {
    }),
    j: $props.blur ? 1 : "",
    k: common_vendor.o((...args) => $setup.onMaskTap && $setup.onMaskTap(...args))
  }) : {});
}
const _easycom_loading_mask = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main$1, [["render", _sfc_render$1], ["__scopeId", "data-v-8706b652"]]);
const _sfc_main = {
  data() {
    return {
      loadingState: store_loading.loadingState
    };
  },
  onLaunch: function() {
    const app = this;
    app.$showLoading = function(options) {
      store_loading.showLoading(options);
    };
    app.$hideLoading = function() {
      store_loading.hideLoading();
    };
    common_vendor.index.__f__("log", "at App.vue:20", "App Launch");
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:23", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:26", "App Hide");
  }
};
if (!Array) {
  const _easycom_loading_mask2 = common_vendor.resolveComponent("loading-mask");
  _easycom_loading_mask2();
}
if (!Math) {
  _easycom_loading_mask();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      visible: $data.loadingState.visible,
      title: $data.loadingState.title,
      logo: $data.loadingState.logo,
      ["style-type"]: $data.loadingState.styleType,
      ["logo-spin"]: $data.loadingState.logoSpin,
      blur: $data.loadingState.blur
    })
  };
}
const App = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
function createApp() {
  const app = common_vendor.createSSRApp(App);
  app.config.globalProperties.$showLoading = store_loading.showLoading;
  app.config.globalProperties.$hideLoading = store_loading.hideLoading;
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
