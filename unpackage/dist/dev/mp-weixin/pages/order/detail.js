"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_order = require("../../common/api/order.js");
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const { safeAreaInsets } = common_vendor.index.getSystemInfoSync();
    const order = common_vendor.ref(null);
    const loading = common_vendor.ref(true);
    const orderId = common_vendor.ref(null);
    const statusMap = { pending: "待支付", paid: "已支付", making: "制作中", ready: "待取杯", finished: "已完成", cancelled: "已取消" };
    const statusText = (s) => statusMap[s] || s;
    const statusIconMap = { pending: "⏳", paid: "✅", making: "🔥", ready: "🔔", finished: "🎉", cancelled: "❌" };
    const statusIcon = (s) => statusIconMap[s] || "📋";
    const formatTime = (t) => {
      if (!t)
        return "";
      const d = new Date(t);
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    common_vendor.onLoad((query) => {
      if (query.id) {
        orderId.value = query.id;
        fetchDetail(query.id);
      } else {
        loading.value = false;
      }
    });
    const fetchDetail = async (id) => {
      loading.value = true;
      try {
        const d = await common_api_order.fetchOrderDetail(id);
        if (d) {
          order.value = {
            ...d,
            total_amount: Number(d.total_amount),
            pay_amount: Number(d.pay_amount),
            discount_amount: Number(d.discount_amount || 0)
          };
        }
      } catch (e) {
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      } finally {
        loading.value = false;
      }
    };
    const goBack = () => {
      try {
        common_vendor.index.navigateBack();
      } catch (e) {
        common_vendor.index.switchTab({ url: "/pages/mine/mine" });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.unref(safeAreaInsets).top + "px",
        c: loading.value
      }, loading.value ? {} : order.value ? common_vendor.e({
        e: common_vendor.t(statusIcon(order.value.status)),
        f: common_vendor.t(statusText(order.value.status)),
        g: common_vendor.t(order.value.store_name),
        h: common_vendor.t(order.value.order_type === "delivery" ? "外送" : "到店自取"),
        i: common_vendor.f(order.value.items, (item, i, i0) => {
          return common_vendor.e({
            a: item.image || "/static/logo.png",
            b: common_vendor.t(item.name),
            c: item.spec
          }, item.spec ? {
            d: common_vendor.t(item.spec)
          } : {}, {
            e: common_vendor.t(item.price),
            f: common_vendor.t(item.count),
            g: i
          });
        }),
        j: common_vendor.t(order.value.total_amount),
        k: order.value.discount_amount > 0
      }, order.value.discount_amount > 0 ? {
        l: common_vendor.t(order.value.discount_amount)
      } : {}, {
        m: common_vendor.t(order.value.pay_amount),
        n: common_vendor.t(order.value.order_no),
        o: common_vendor.t(formatTime(order.value.created_at)),
        p: order.value.paid_at
      }, order.value.paid_at ? {
        q: common_vendor.t(formatTime(order.value.paid_at))
      } : {}) : {}, {
        d: order.value
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6b23c96c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/detail.js.map
