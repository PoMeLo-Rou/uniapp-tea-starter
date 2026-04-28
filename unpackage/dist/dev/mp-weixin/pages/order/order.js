"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const common_api_product = require("../../common/api/product.js");
const common_api_site = require("../../common/api/site.js");
const common_utils_orderSpec = require("../../common/utils/order-spec.js");
if (!Math) {
  (orderHeader + CustomTabBar + cartPopup + ProductDetailPopup)();
}
const orderHeader = () => "./components/orderHeader.js";
const cartPopup = () => "./components/cartPopup.js";
const ProductDetailPopup = () => "./components/ProductDetailPopup.js";
const CustomTabBar = () => "../../components/custom-tab-bar.js";
const _sfc_main = {
  __name: "order",
  setup(__props) {
    const activeCategory = common_vendor.ref(1);
    const rightScrollIntoView = common_vendor.ref("");
    const cart = common_vendor.ref({});
    const showCartDetail = common_vendor.ref(false);
    const isClickScrolling = common_vendor.ref(false);
    const rightScrollTop = common_vendor.ref(0);
    const rightViewportHeight = common_vendor.ref(0);
    const categoryPositions = common_vendor.ref([]);
    const categories = common_vendor.ref([]);
    const products = common_vendor.ref([]);
    const searchKeyword = common_vendor.ref("");
    const orderType = common_vendor.ref("pickup");
    const searchSuggestions = ["奶茶", "果茶", "珍珠", "少糖"];
    const storeInfo = common_vendor.ref({
      storeName: "贵港平南中心购物广场店",
      storeAddress: "",
      pickupDistanceText: "距离您 3km · 步行约 15 分钟",
      deliveryAddressText: "请选择收货地址 >",
      deliveryStoreLine: "⇄ 贵港平南中心购物广场店 ｜ 送出外卖",
      storeSlogan: "new style tea, by inspiration >"
    });
    const orderPageBannerImage = common_vendor.ref("https://dummyimage.com/750x280/f3f4f6/9ca3af&text=Order+Banner");
    const orderPageBannerText = common_vendor.ref("当季 · 多肉葡萄");
    const isProductOnSale = (product) => {
      if ((product == null ? void 0 : product.status) === void 0 || (product == null ? void 0 : product.status) === null)
        return true;
      if (typeof product.status === "number")
        return product.status === 1;
      const status = String(product.status).toLowerCase();
      return status === "1" || status === "on" || status === "onsale" || status === "on_sale" || status === "active";
    };
    const normalizedSearchKeyword = common_vendor.computed(() => searchKeyword.value.trim().toLowerCase());
    const hasSearchKeyword = common_vendor.computed(() => Boolean(normalizedSearchKeyword.value));
    const searchableProducts = common_vendor.computed(
      () => products.value.filter((product) => isProductOnSale(product))
    );
    const productMatchesKeyword = (product, keyword) => {
      if (!keyword)
        return true;
      const text = [product == null ? void 0 : product.name, product == null ? void 0 : product.desc, product == null ? void 0 : product.tag].map((item) => String(item || "").toLowerCase()).join(" ");
      return text.includes(keyword);
    };
    const visibleProducts = common_vendor.computed(() => {
      const keyword = normalizedSearchKeyword.value;
      return searchableProducts.value.filter((product) => productMatchesKeyword(product, keyword));
    });
    const visibleCategoryIds = common_vendor.computed(() => new Set(visibleProducts.value.map((product) => product.category_id)));
    const visibleCategories = common_vendor.computed(
      () => categories.value.filter((category) => visibleCategoryIds.value.has(category.id))
    );
    const matchedProductCount = common_vendor.computed(() => visibleProducts.value.length);
    const getProductsByCategory = (catId) => visibleProducts.value.filter((p) => p.category_id === catId);
    const getProductById = (pid) => products.value.find((p) => p.id == pid);
    const totalCount = common_vendor.computed(() => {
      return Object.values(cart.value).reduce((sum, item) => {
        return sum + ((item == null ? void 0 : item.count) || 0);
      }, 0);
    });
    const totalPrice = common_vendor.computed(() => {
      return Object.values(cart.value).reduce((total, item) => {
        if (!item)
          return total;
        const p = getProductById(item.id);
        return total + (p ? p.price * (item.count || 0) : 0);
      }, 0);
    });
    const getProductCount = (productId) => {
      let total = 0;
      Object.values(cart.value).forEach((item) => {
        if (item && item.id === productId) {
          total += item.count || 0;
        }
      });
      return total;
    };
    const updateCart = (keyOrProductId, delta) => {
      const itemByKey = cart.value[keyOrProductId];
      if (itemByKey) {
        const next2 = (itemByKey.count || 0) + delta;
        if (next2 <= 0) {
          delete cart.value[keyOrProductId];
        } else {
          cart.value[keyOrProductId] = {
            ...itemByKey,
            count: next2
          };
        }
        return;
      }
      const entries = Object.entries(cart.value).filter(
        ([, item2]) => item2 && item2.id === keyOrProductId
      );
      if (!entries.length)
        return;
      const [targetKey, item] = entries[0];
      const next = (item.count || 0) + delta;
      if (next <= 0) {
        delete cart.value[targetKey];
      } else {
        cart.value[targetKey] = {
          ...item,
          count: next
        };
      }
    };
    const clearCart = () => {
      cart.value = {};
      showCartDetail.value = false;
    };
    const toggleCartDetail = () => {
      if (totalCount.value > 0)
        showCartDetail.value = !showCartDetail.value;
    };
    const setShowCartDetail = (v) => {
      showCartDetail.value = !!v;
    };
    const clearSearch = () => {
      searchKeyword.value = "";
    };
    const applySearchKeyword = (keyword) => {
      searchKeyword.value = String(keyword || "").trim();
    };
    const scrollToCategory = (catId) => {
      activeCategory.value = catId;
      rightScrollIntoView.value = "category-" + catId;
      isClickScrolling.value = true;
      setTimeout(() => {
        isClickScrolling.value = false;
      }, 400);
    };
    const handleScroll = (e) => {
      rightScrollTop.value = e.detail.scrollTop || 0;
      if (isClickScrolling.value)
        return;
      const scrollTop = rightScrollTop.value;
      if (!categoryPositions.value.length)
        return;
      const activationOffset = Math.max(80, rightViewportHeight.value * 0.25);
      for (let i = categoryPositions.value.length - 1; i >= 0; i--) {
        const item = categoryPositions.value[i];
        if (scrollTop + activationOffset >= item.top) {
          if (activeCategory.value !== item.id) {
            activeCategory.value = item.id;
          }
          break;
        }
      }
    };
    const checkout = () => {
      if (totalCount.value === 0)
        return;
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.showToast({ title: "请先登录后再结算", icon: "none" });
        setTimeout(() => {
          common_vendor.index.navigateTo({ url: "/pages/login/login" });
        }, 500);
        return;
      }
      const items = [];
      Object.values(cart.value).forEach((item) => {
        if (!item || !item.count)
          return;
        const p = getProductById(item.id);
        if (!p)
          return;
        const spec = common_utils_orderSpec.formatSpecText(item.specs || {});
        items.push({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image || "",
          count: item.count,
          spec
        });
      });
      if (items.length === 0) {
        common_vendor.index.showToast({ title: "购物车为空", icon: "none" });
        return;
      }
      common_vendor.index.setStorageSync("checkoutOrder", {
        items,
        orderType: orderType.value,
        storeInfo: {
          storeName: storeInfo.value.storeName || "",
          storeAddress: storeInfo.value.storeAddress || "",
          pickupDistanceText: storeInfo.value.pickupDistanceText || "",
          deliveryAddressText: storeInfo.value.deliveryAddressText || "",
          deliveryStoreLine: storeInfo.value.deliveryStoreLine || "",
          storeSlogan: storeInfo.value.storeSlogan || ""
        }
      });
      common_vendor.index.navigateTo({ url: "/pages/checkout/checkout" });
    };
    const fetchCategories = () => {
      return common_api_product.fetchCategories().then((list) => {
        const arr = list || [];
        categories.value = arr;
        if (arr.length > 0) {
          activeCategory.value = arr[0].id;
        }
      });
    };
    const fetchProducts = () => {
      return common_api_product.fetchProducts().then((list) => {
        products.value = list || [];
      });
    };
    const fetchSiteDisplayConfig = () => {
      return common_api_site.fetchSiteConfig().then((cfg) => {
        if (!cfg)
          return;
        storeInfo.value = {
          storeName: cfg.storeName || storeInfo.value.storeName,
          storeAddress: cfg.storeAddress || storeInfo.value.storeAddress,
          pickupDistanceText: cfg.pickupDistanceText || storeInfo.value.pickupDistanceText,
          deliveryAddressText: cfg.deliveryAddressText || cfg.storeAddress || storeInfo.value.deliveryAddressText,
          deliveryStoreLine: cfg.deliveryStoreLine || storeInfo.value.deliveryStoreLine,
          storeSlogan: cfg.storeSlogan || storeInfo.value.storeSlogan
        };
        orderPageBannerImage.value = cfg.orderPageBanner || orderPageBannerImage.value;
        orderPageBannerText.value = cfg.orderPageBannerText || orderPageBannerText.value;
      });
    };
    const updateStoreDistanceByLocation = async () => {
      try {
        const location = await new Promise((resolve, reject) => {
          common_vendor.index.getLocation({
            type: "gcj02",
            success: resolve,
            fail: reject
          });
        });
        const userLat = Number(location.latitude);
        const userLng = Number(location.longitude);
        if (!Number.isFinite(userLat) || !Number.isFinite(userLng))
          return;
        const distance = await common_api_site.fetchStoreDistance({ userLat, userLng });
        if (distance == null ? void 0 : distance.distanceText) {
          storeInfo.value.pickupDistanceText = distance.distanceText;
        }
      } catch (_) {
      }
    };
    const calcCategoryPositions = () => {
      const instance = common_vendor.getCurrentInstance();
      if (!instance)
        return;
      common_vendor.nextTick$1(() => {
        const query = common_vendor.index.createSelectorQuery().in(instance.proxy);
        query.select(".right-content").boundingClientRect();
        query.selectAll(".category-section").boundingClientRect();
        query.exec((res) => {
          const rightRect = res[0];
          const rects = res[1] || [];
          if (!rightRect || !rects.length)
            return;
          rightViewportHeight.value = rightRect.height || 0;
          categoryPositions.value = rects.map((rect, index) => {
            var _a;
            return {
              id: (_a = visibleCategories.value[index]) == null ? void 0 : _a.id,
              // 记录相对 scroll-view 顶部的偏移
              top: rect.top - rightRect.top + rightScrollTop.value
            };
          }).filter((item) => item.id);
        });
      });
    };
    common_vendor.watch(
      () => ({
        keyword: normalizedSearchKeyword.value,
        categoryIds: visibleCategories.value.map((category) => category.id).join(",")
      }),
      ({ keyword }) => {
        const nextCategories = visibleCategories.value;
        if (!nextCategories.length) {
          activeCategory.value = 0;
          rightScrollIntoView.value = "";
          categoryPositions.value = [];
          return;
        }
        if (!nextCategories.some((category) => category.id === activeCategory.value)) {
          activeCategory.value = nextCategories[0].id;
        }
        common_vendor.nextTick$1(() => {
          calcCategoryPositions();
          if (keyword) {
            rightScrollIntoView.value = "";
            common_vendor.nextTick$1(() => {
              rightScrollIntoView.value = "category-" + nextCategories[0].id;
            });
          }
        });
      },
      { immediate: true }
    );
    common_vendor.onMounted(async () => {
      await fetchCategories();
      await fetchProducts();
      await fetchSiteDisplayConfig();
      await updateStoreDistanceByLocation();
      calcCategoryPositions();
      common_vendor.index.$on("openSpec", onOpenSpecFromHome);
      common_vendor.nextTick$1(processPendingOpenSpec);
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("openSpec", onOpenSpecFromHome);
    });
    common_vendor.onShow(() => {
      common_vendor.nextTick$1(processPendingOpenSpec);
      if (common_vendor.index.getStorageSync("justPaid")) {
        cart.value = {};
        showCartDetail.value = false;
        common_vendor.index.removeStorageSync("justPaid");
        const lastOrder = common_vendor.index.getStorageSync("lastPaidOrder");
        if (lastOrder) {
          common_vendor.index.showToast({
            title: `订单 ¥${lastOrder.totalPrice} 已支付`,
            icon: "success",
            duration: 2e3
          });
          common_vendor.index.removeStorageSync("lastPaidOrder");
        }
      }
    });
    const onOpenSpecFromHome = ({ productId }) => {
      const product = getProductById(productId);
      if (product)
        openSpecPopup(product);
    };
    const processPendingOpenSpec = () => {
      const productId = common_vendor.index.getStorageSync("pendingOpenSpecProductId");
      if (!productId)
        return;
      const product = getProductById(productId);
      if (!product)
        return;
      common_vendor.index.removeStorageSync("pendingOpenSpecProductId");
      openSpecPopup(product);
    };
    const detailPopup = common_vendor.ref(null);
    common_vendor.ref([
      { id: "TEA123456", statusText: "制作中", step: 1 }
    ]);
    const openSpecPopup = (product) => {
      var _a;
      (_a = detailPopup.value) == null ? void 0 : _a.open(product);
    };
    const onAddToCart = (data) => {
      const normalizedSpecs = common_utils_orderSpec.normalizeOrderSpecs(data.specs || {});
      const key = common_utils_orderSpec.buildCartKey(data.id, normalizedSpecs);
      const existing = cart.value[key];
      const addCount = Math.max(1, Number(data.count || 1));
      const nextCount = ((existing == null ? void 0 : existing.count) || 0) + addCount;
      cart.value[key] = {
        id: data.id,
        specs: normalizedSpecs,
        count: nextCount
      };
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => orderType.value = $event),
        b: common_vendor.p({
          orderType: orderType.value,
          storeInfo: storeInfo.value
        }),
        c: common_vendor.t(hasSearchKeyword.value ? `正在查找「${searchKeyword.value.trim()}」` : "今天想喝点什么？"),
        d: searchKeyword.value,
        e: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        f: searchKeyword.value
      }, searchKeyword.value ? {
        g: common_vendor.o(clearSearch)
      } : {}, {
        h: common_vendor.n(hasSearchKeyword.value ? "active" : ""),
        i: common_vendor.f(searchSuggestions, (item, k0, i0) => {
          return {
            a: common_vendor.t(item),
            b: item,
            c: common_vendor.n(normalizedSearchKeyword.value === item.toLowerCase() ? "active" : ""),
            d: common_vendor.o(($event) => applySearchKeyword(item), item)
          };
        }),
        j: common_vendor.f(visibleCategories.value, (cat, k0, i0) => {
          return common_vendor.e({
            a: activeCategory.value === cat.id
          }, activeCategory.value === cat.id ? {} : {}, {
            b: common_vendor.t(cat.icon),
            c: common_vendor.t(cat.name),
            d: cat.id,
            e: "nav-" + cat.id,
            f: common_vendor.n(activeCategory.value === cat.id ? "active" : ""),
            g: common_vendor.o(($event) => scrollToCategory(cat.id), cat.id)
          });
        }),
        k: !visibleCategories.value.length
      }, !visibleCategories.value.length ? {} : {}, {
        l: "nav-" + activeCategory.value,
        m: !hasSearchKeyword.value
      }, !hasSearchKeyword.value ? {
        n: orderPageBannerImage.value,
        o: common_vendor.t(orderPageBannerText.value)
      } : {
        p: common_vendor.t(matchedProductCount.value),
        q: common_vendor.o(clearSearch)
      }, {
        r: common_vendor.f(visibleCategories.value, (cat, k0, i0) => {
          return {
            a: common_vendor.t(cat.name),
            b: common_vendor.f(getProductsByCategory(cat.id), (product, k1, i1) => {
              return common_vendor.e({
                a: product.image,
                b: product.tag
              }, product.tag ? {
                c: common_vendor.t(product.tag)
              } : {}, {
                d: common_vendor.t(product.name),
                e: common_vendor.t(product.desc),
                f: common_vendor.t(product.price),
                g: getProductCount(product.id)
              }, getProductCount(product.id) ? {
                h: common_vendor.t(getProductCount(product.id))
              } : {}, {
                i: common_vendor.o(($event) => openSpecPopup(product), product.id),
                j: product.id
              });
            }),
            c: cat.id,
            d: "category-" + cat.id
          };
        }),
        s: !visibleCategories.value.length
      }, !visibleCategories.value.length ? {} : {}, {
        t: rightScrollIntoView.value,
        v: common_vendor.o(handleScroll),
        w: totalCount.value > 0
      }, totalCount.value > 0 ? {
        x: common_assets._imports_0,
        y: common_vendor.t(totalCount.value),
        z: common_vendor.o(toggleCartDetail),
        A: common_vendor.t(totalPrice.value),
        B: common_vendor.o(checkout)
      } : {}, {
        C: common_vendor.p({
          ["current-path"]: "/pages/order/order"
        }),
        D: common_vendor.o(setShowCartDetail),
        E: common_vendor.o(updateCart),
        F: common_vendor.o(clearCart),
        G: common_vendor.p({
          show: showCartDetail.value,
          items: cart.value,
          getProduct: getProductById
        }),
        H: common_vendor.sr(detailPopup, "93207a4f-3", {
          "k": "detailPopup"
        }),
        I: common_vendor.o(onAddToCart)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-93207a4f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/order.js.map
