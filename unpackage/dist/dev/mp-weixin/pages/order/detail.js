"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const { safeAreaInsets } = common_vendor.index.getSystemInfoSync();
    const orderId = common_vendor.ref("");
    const order = common_vendor.ref(null);
    const loading = common_vendor.ref(true);
    const statusText = common_vendor.computed(() => {
      if (!order.value)
        return "";
      const map = { pending_pay: "待支付", paid: "已支付", making: "制作中", completed: "已完成", cancelled: "已取消" };
      return map[order.value.status] || order.value.status;
    });
    const goBack = () => {
      common_vendor.index.navigateBack({ fail: () => {
        common_vendor.index.switchTab({ url: "/pages/order/order" });
      } });
    };
    common_vendor.onLoad((query) => {
      const id = query.id || "";
      orderId.value = id;
      if (id === "local") {
        const local = common_vendor.index.getStorageSync("lastOrder");
        loading.value = false;
        order.value = local || null;
        return;
      }
      const match = id.match(/^local_(\d+)$/);
      if (match) {
        const index = parseInt(match[1], 10);
        const history = common_vendor.index.getStorageSync("orderHistory") || [];
        loading.value = false;
        order.value = Array.isArray(history) && history[index] ? history[index] : null;
        return;
      }
      if (!id) {
        loading.value = false;
        return;
      }
      common_vendor.index.request({
        url: `http://localhost:3000/api/orders/${id}`,
        success: (res) => {
          loading.value = false;
          if (res.statusCode === 200 && res.data)
            order.value = res.data;
        },
        fail: () => {
          loading.value = false;
        }
      });
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.unref(safeAreaInsets).top + "px",
        c: loading.value
      }, loading.value ? {} : order.value ? {
        e: common_vendor.t(statusText.value),
        f: common_vendor.t(order.value.order_no),
        g: common_vendor.t(order.value.store_name),
        h: common_vendor.t(order.value.order_type === "takeout" ? "外带" : "堂食"),
        i: common_vendor.f(order.value.items, (it, i, i0) => {
          return common_vendor.e({
            a: it.image || "/static/logo.png",
            b: common_vendor.t(it.name),
            c: it.spec
          }, it.spec ? {
            d: common_vendor.t(it.spec)
          } : {}, {
            e: common_vendor.t(it.price),
            f: common_vendor.t(it.count),
            g: i
          });
        }),
        j: common_vendor.t(order.value.total_amount)
      } : {}, {
        d: order.value
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6b23c96c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/detail.js.map
