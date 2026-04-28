"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_modules_member = require("../../stores/modules/member.js");
const common_api_product = require("../../common/api/product.js");
const common_api_order = require("../../common/api/order.js");
const common_api_site = require("../../common/api/site.js");
const common_api_request = require("../../common/api/request.js");
if (!Math) {
  (bannerBox + memberCard + mainAction + AiChat + CustomTabBar)();
}
const bannerBox = () => "./components/bannerBox.js";
const memberCard = () => "./components/memberCard.js";
const mainAction = () => "./components/mainAction.js";
const CustomTabBar = () => "../../components/custom-tab-bar.js";
const AiChat = () => "../../components/AiChat.js";
const MIN_HISTORY_ITEM_COUNT = 2;
const RECOMMEND_LIMIT = 8;
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const memberStore = stores_modules_member.useMemberStore();
    const bannerData = common_vendor.ref([]);
    const recommendList = common_vendor.ref([]);
    const normalizeList = (payload) => {
      if (Array.isArray(payload))
        return payload;
      if (Array.isArray(payload == null ? void 0 : payload.list))
        return payload.list;
      if (Array.isArray(payload == null ? void 0 : payload.rows))
        return payload.rows;
      if (Array.isArray(payload == null ? void 0 : payload.records))
        return payload.records;
      if (Array.isArray(payload == null ? void 0 : payload.data))
        return payload.data;
      if ((payload == null ? void 0 : payload.data) && typeof payload.data === "object")
        return normalizeList(payload.data);
      return [];
    };
    const toRecommendItem = (item = {}) => ({
      id: item.id || item.productId || item.product_id,
      name: item.name || item.productName || item.product_name || "",
      price: item.price || 0,
      image: item.image || "/static/logo.png"
    });
    const isProductOnSale = (product) => {
      if ((product == null ? void 0 : product.status) === void 0 || (product == null ? void 0 : product.status) === null)
        return true;
      if (typeof product.status === "number")
        return product.status === 1;
      return ["1", "on", "onsale", "on_sale", "active"].includes(String(product.status).toLowerCase());
    };
    const tokenize = (value) => String(value || "").toLowerCase().split(/[^a-z0-9\u4e00-\u9fa5]+/i).map((item) => item.trim()).filter((item) => item.length >= 2);
    const getOrderItems = (order = {}) => {
      if ((order == null ? void 0 : order.data) && typeof order.data === "object")
        return getOrderItems(order.data);
      const source = order.items || order.orderItems || order.products || order.details || order.order_details || order.productList || [];
      if (Array.isArray(source))
        return source;
      if (typeof source === "string") {
        try {
          return JSON.parse(source);
        } catch (_) {
          return [];
        }
      }
      return [];
    };
    const loadHistoryItems = async () => {
      if (!memberStore.isLoggedIn || !memberStore.userId)
        return [];
      const orderPayload = await common_api_order.fetchOrderList({ userId: memberStore.userId });
      const orders = normalizeList(orderPayload).slice(0, 10);
      const detailList = await Promise.all(
        orders.map(async (order) => {
          const id = order.id || order.orderId || order.order_id;
          if (!id || getOrderItems(order).length)
            return order;
          try {
            return await common_api_order.fetchOrderDetail(id);
          } catch (_) {
            return order;
          }
        })
      );
      return detailList.flatMap(getOrderItems);
    };
    const buildPersonalizedRecommend = (products, historyItems) => {
      if (historyItems.length < MIN_HISTORY_ITEM_COUNT)
        return [];
      const productById = new Map(products.map((item) => [String(item.id), item]));
      const purchasedIds = /* @__PURE__ */ new Set();
      const categoryScore = /* @__PURE__ */ new Map();
      const tokenScore = /* @__PURE__ */ new Map();
      historyItems.forEach((item) => {
        const id = item.id || item.productId || item.product_id;
        const product = productById.get(String(id)) || products.find((p) => p.name === item.name || p.name === item.productName);
        const count = Math.max(1, Number(item.count || item.quantity || 1));
        if (product == null ? void 0 : product.id)
          purchasedIds.add(String(product.id));
        if (product == null ? void 0 : product.category_id)
          categoryScore.set(product.category_id, (categoryScore.get(product.category_id) || 0) + count * 3);
        tokenize([product == null ? void 0 : product.name, product == null ? void 0 : product.desc, product == null ? void 0 : product.tag, item.spec].join(" ")).forEach((token) => {
          tokenScore.set(token, (tokenScore.get(token) || 0) + count);
        });
      });
      return products.filter((item) => item.id && isProductOnSale(item) && !purchasedIds.has(String(item.id))).map((item) => {
        let score = categoryScore.get(item.category_id) || 0;
        tokenize([item.name, item.desc, item.tag].join(" ")).forEach((token) => {
          score += tokenScore.get(token) || 0;
        });
        return { ...item, score };
      }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, RECOMMEND_LIMIT).map(toRecommendItem);
    };
    const loadDefaultRecommend = async () => normalizeList(await common_api_product.fetchRecommendProducts()).map(toRecommendItem);
    const loadRecommendProducts = async () => {
      try {
        const [allProducts, historyItems] = await Promise.all([common_api_product.fetchProducts(), loadHistoryItems()]);
        const personalized = buildPersonalizedRecommend(normalizeList(allProducts), historyItems);
        if (personalized.length)
          return personalized;
      } catch (error) {
        common_vendor.index.__f__("warn", "at pages/index/index.vue:157", "[home] personalized recommend fallback:", error);
      }
      return loadDefaultRecommend();
    };
    const loadHomeData = async () => {
      try {
        const [siteConfig, products] = await Promise.all([common_api_site.fetchSiteConfig(), loadRecommendProducts()]);
        if (Array.isArray(siteConfig == null ? void 0 : siteConfig.homeBanners) && siteConfig.homeBanners.length) {
          bannerData.value = siteConfig.homeBanners;
        }
        recommendList.value = products;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:170", "load home data failed:", e);
        common_vendor.index.showToast({ title: "数据加载异常", icon: "none" });
      }
    };
    const refreshUserInfo = () => {
      if (memberStore.isLoggedIn && typeof memberStore.fetchUserInfo === "function") {
        memberStore.fetchUserInfo();
      }
    };
    const goToOrder = () => {
      common_vendor.index.switchTab({
        url: "/pages/order/order"
      });
    };
    const onRecommendClick = (item) => {
      if (!(item == null ? void 0 : item.id))
        return;
      common_vendor.index.setStorageSync("pendingOpenSpecProductId", item.id);
      common_vendor.index.switchTab({
        url: "/pages/order/order",
        success: () => {
          setTimeout(() => {
            common_vendor.index.$emit("openSpec", { productId: item.id });
          }, 450);
        }
      });
    };
    common_vendor.onMounted(() => {
      loadHomeData();
      refreshUserInfo();
    });
    common_vendor.onShow(() => {
      loadHomeData();
      refreshUserInfo();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          banners: bannerData.value
        }),
        b: common_vendor.p({
          points: 128,
          level: "尊享会员"
        }),
        c: common_vendor.f(recommendList.value, (item, index, i0) => {
          return {
            a: common_vendor.unref(common_api_request.normalizeImageUrl)(item.image),
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.price),
            d: common_vendor.o(($event) => onRecommendClick(item), item.id || index),
            e: item.id || index,
            f: common_vendor.o(($event) => onRecommendClick(item), item.id || index)
          };
        }),
        d: common_vendor.o(goToOrder),
        e: common_vendor.p({
          ["current-path"]: "/pages/index/index"
        })
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
