"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_modules_adminOrder = require("../../stores/modules/admin-order.js");
const _sfc_main = {
  __name: "order-manage",
  setup(__props) {
    const orderStore = stores_modules_adminOrder.useAdminOrderStore();
    const safeAreaInsets = (() => {
      try {
        const sys = common_vendor.index.getSystemInfoSync();
        return sys.safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 };
      } catch (_) {
        return { top: 0, bottom: 0, left: 0, right: 0 };
      }
    })();
    const tabs = [
      { key: "all", label: "全部" },
      { key: "paid", label: "待接单" },
      { key: "making", label: "制作中" },
      { key: "ready", label: "待取餐" }
    ];
    const activeTab = common_vendor.ref("paid");
    const pageVisible = common_vendor.ref(false);
    const pollingAttached = common_vendor.ref(false);
    const visibleOrders = common_vendor.computed(() => {
      if (activeTab.value === "all")
        return orderStore.orders;
      return orderStore.orders.filter((item) => item.status === activeTab.value);
    });
    const lastFetchedText = common_vendor.computed(() => formatDateTime(orderStore.lastFetchedAt));
    const tabCount = (tabKey) => {
      if (tabKey === "all")
        return orderStore.orders.length;
      return orderStore.orders.filter((item) => item.status === tabKey).length;
    };
    const statusText = (status) => {
      const map = {
        pending: "待支付",
        paid: "待接单",
        making: "制作中",
        ready: "待取餐",
        finished: "已完成",
        cancelled: "已取消"
      };
      return map[status] || status;
    };
    const formatDateTime = (value) => {
      if (!value)
        return "--";
      const date = new Date(value);
      if (Number.isNaN(date.getTime()))
        return "--";
      const pad = (part) => String(part).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
        date.getHours()
      )}:${pad(date.getMinutes())}`;
    };
    const formatAmount = (value) => {
      const amount = Number(value);
      return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
    };
    const getItemTags = (item = {}) => {
      const values = [
        item.size,
        item.cupSize,
        item.temperature,
        item.temp,
        item.sweet,
        item.sweetness,
        item.spec
      ];
      if (Array.isArray(item.toppings)) {
        values.push(...item.toppings);
      }
      if (Array.isArray(item.addons)) {
        values.push(...item.addons);
      }
      const tags = [];
      values.forEach((value) => {
        if (!value)
          return;
        String(value).split(/[、,，/|]/).map((part) => part.trim()).filter(Boolean).forEach((part) => {
          if (!tags.includes(part)) {
            tags.push(part);
          }
        });
      });
      return tags.slice(0, 6);
    };
    const attachPolling = () => {
      if (pollingAttached.value)
        return;
      orderStore.startPolling();
      pollingAttached.value = true;
    };
    const detachPolling = () => {
      if (!pollingAttached.value)
        return;
      orderStore.stopPolling();
      pollingAttached.value = false;
    };
    const manualRefresh = async () => {
      try {
        await orderStore.refreshOrders();
        common_vendor.index.showToast({ title: "订单已刷新", icon: "success" });
      } catch (_) {
        common_vendor.index.showToast({ title: "刷新失败，请稍后重试", icon: "none" });
      }
    };
    const handleStatusChange = async (order, status) => {
      const actionText = status === "making" ? "开始制作" : "标记已出餐";
      try {
        await orderStore.updateOrderStatus(order.id, status);
        common_vendor.index.showToast({
          title: `${actionText}成功`,
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.showToast({
          title: (error == null ? void 0 : error.message) || `${actionText}失败`,
          icon: "none"
        });
      }
    };
    const handleNewOrder = (payload = {}) => {
      var _a, _b;
      if (!pageVisible.value)
        return;
      const count = Number(payload.count || ((_a = payload.orders) == null ? void 0 : _a.length) || 1);
      const orderNo = ((_b = payload.firstOrder) == null ? void 0 : _b.order_no) || "新订单";
      activeTab.value = "paid";
      try {
        common_vendor.index.vibrateLong();
      } catch (_) {
      }
      common_vendor.index.showToast({
        title: count > 1 ? `有 ${count} 个新订单待接单` : `${orderNo} 已进入待接单`,
        icon: "none",
        duration: 3e3
      });
    };
    const goBack = () => {
      try {
        common_vendor.index.navigateBack();
      } catch (_) {
        common_vendor.index.navigateTo({ url: "/pages/admin/index" });
      }
    };
    common_vendor.onMounted(() => {
      common_vendor.index.$on("admin:new-order", handleNewOrder);
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("admin:new-order", handleNewOrder);
    });
    common_vendor.onShow(() => {
      pageVisible.value = true;
      attachPolling();
    });
    common_vendor.onHide(() => {
      pageVisible.value = false;
      detachPolling();
    });
    common_vendor.onUnload(() => {
      pageVisible.value = false;
      detachPolling();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.o(manualRefresh),
        c: common_vendor.unref(safeAreaInsets).top + "px",
        d: common_vendor.t(common_vendor.unref(orderStore).pendingCount),
        e: common_vendor.t(common_vendor.unref(orderStore).makingOrders.length),
        f: common_vendor.t(common_vendor.unref(orderStore).readyOrders.length),
        g: lastFetchedText.value
      }, lastFetchedText.value ? {
        h: common_vendor.t(lastFetchedText.value)
      } : {}, {
        i: common_vendor.f(tabs, (tab, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(tab.label),
            b: tabCount(tab.key) > 0
          }, tabCount(tab.key) > 0 ? {
            c: common_vendor.t(tabCount(tab.key))
          } : {}, {
            d: tab.key,
            e: common_vendor.n(activeTab.value === tab.key ? "active" : ""),
            f: common_vendor.o(($event) => activeTab.value = tab.key, tab.key)
          });
        }),
        j: common_vendor.unref(orderStore).errorMessage
      }, common_vendor.unref(orderStore).errorMessage ? {
        k: common_vendor.t(common_vendor.unref(orderStore).errorMessage)
      } : {}, {
        l: !visibleOrders.value.length && !common_vendor.unref(orderStore).loading
      }, !visibleOrders.value.length && !common_vendor.unref(orderStore).loading ? {} : {}, {
        m: common_vendor.f(visibleOrders.value, (order, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(order.order_no),
            b: common_vendor.t(order.order_type === "delivery" ? "外卖配送" : "到店自取"),
            c: common_vendor.t(order.store_name),
            d: common_vendor.t(statusText(order.status)),
            e: common_vendor.n(order.status),
            f: common_vendor.t(formatDateTime(order.created_at)),
            g: common_vendor.t(formatAmount(order.pay_amount || order.total_amount)),
            h: common_vendor.f(order.items, (item, index, i1) => {
              return common_vendor.e({
                a: item.image || "/static/order.png",
                b: common_vendor.t(item.name),
                c: common_vendor.t(item.count || 1),
                d: getItemTags(item).length
              }, getItemTags(item).length ? {
                e: common_vendor.f(getItemTags(item), (tag, k2, i2) => {
                  return {
                    a: common_vendor.t(tag),
                    b: tag
                  };
                })
              } : {}, {
                f: `${order.id}-${index}`
              });
            }),
            i: order.status === "paid"
          }, order.status === "paid" ? {
            j: common_vendor.t(common_vendor.unref(orderStore).isUpdating(order.id) ? "处理中..." : "开始制作"),
            k: common_vendor.unref(orderStore).isUpdating(order.id),
            l: common_vendor.o(($event) => handleStatusChange(order, "making"), order.id)
          } : order.status === "making" ? {
            n: common_vendor.t(common_vendor.unref(orderStore).isUpdating(order.id) ? "处理中..." : "已出餐"),
            o: common_vendor.unref(orderStore).isUpdating(order.id),
            p: common_vendor.o(($event) => handleStatusChange(order, "ready"), order.id)
          } : common_vendor.e({
            q: order.status === "ready"
          }, order.status === "ready" ? {} : {}), {
            m: order.status === "making",
            r: order.id
          });
        }),
        n: `${common_vendor.unref(safeAreaInsets).bottom + 40}px`
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8e18869b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/order-manage.js.map
