"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
if (!Math) {
  (orderHeader + CustomTabBar + cartPopup + ProductDetailPopup)();
}
const orderHeader = () => "./components/orderHeader.js";
const cartPopup = () => "./components/cartPopup.js";
const ProductDetailPopup = () => "./components/ProductDetailPopup2.js";
const CustomTabBar = () => "../../components/custom-tab-bar.js";
const API_BASE = "http://localhost:3000";
const _sfc_main = {
  __name: "order",
  setup(__props) {
    const activeCategory = common_vendor.ref(1);
    const rightScrollIntoView = common_vendor.ref("");
    const cart = common_vendor.ref({});
    const showCartDetail = common_vendor.ref(false);
    const categoryPositions = common_vendor.ref([]);
    const isClickScrolling = common_vendor.ref(false);
    const categories = common_vendor.ref([]);
    const products = common_vendor.ref([]);
    const getProductsByCategory = (catId) => products.value.filter((p) => p.category_id === catId);
    const getProductById = (pid) => products.value.find((p) => p.id == pid);
    const buildCartKey = (id, specs = {}) => {
      return `${id}__${specs.sweet || ""}__${specs.ice || ""}`;
    };
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
    const scrollToCategory = (catId) => {
      activeCategory.value = catId;
      rightScrollIntoView.value = "category-" + catId;
      isClickScrolling.value = true;
      setTimeout(() => {
        isClickScrolling.value = false;
      }, 400);
    };
    const handleScroll = (e) => {
      if (isClickScrolling.value)
        return;
      const scrollTop = e.detail.scrollTop || 0;
      if (!categoryPositions.value.length)
        return;
      for (let i = categoryPositions.value.length - 1; i >= 0; i--) {
        const item = categoryPositions.value[i];
        if (scrollTop + 10 >= item.top) {
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
      const items = [];
      Object.values(cart.value).forEach((item) => {
        if (!item || !item.count)
          return;
        const p = getProductById(item.id);
        if (!p)
          return;
        const specParts = item.specs ? [item.specs.sweet, item.specs.ice].filter(Boolean) : [];
        const spec = specParts.length ? specParts.join(" / ") : "";
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
      common_vendor.index.setStorageSync("checkoutOrder", { items });
      common_vendor.index.navigateTo({ url: "/pages/checkout/checkout" });
    };
    const fetchCategories = () => {
      return new Promise((resolve, reject) => {
        common_vendor.index.request({
          url: `${API_BASE}/api/categories`,
          success: (res) => {
            const list = res.data || [];
            categories.value = list;
            if (list.length > 0) {
              activeCategory.value = list[0].id;
            }
            resolve();
          },
          fail: reject
        });
      });
    };
    const fetchProducts = () => {
      return new Promise((resolve, reject) => {
        common_vendor.index.request({
          url: `${API_BASE}/api/products`,
          success: (res) => {
            products.value = res.data || [];
            resolve();
          },
          fail: reject
        });
      });
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
          categoryPositions.value = rects.map((rect, index) => {
            var _a;
            return {
              id: (_a = categories[index]) == null ? void 0 : _a.id,
              // 记录相对 scroll-view 顶部的偏移
              top: rect.top - rightRect.top
            };
          }).filter((item) => item.id);
        });
      });
    };
    common_vendor.onMounted(async () => {
      await fetchCategories();
      await fetchProducts();
      calcCategoryPositions();
      common_vendor.index.$on("openSpec", onOpenSpecFromHome);
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("openSpec", onOpenSpecFromHome);
    });
    common_vendor.onShow(() => {
      if (common_vendor.index.getStorageSync("justPaid")) {
        cart.value = {};
        showCartDetail.value = false;
        common_vendor.index.removeStorageSync("justPaid");
      }
    });
    const onOpenSpecFromHome = ({ productId }) => {
      const product = getProductById(productId);
      if (product)
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
      const key = buildCartKey(data.id, data.specs || {});
      const existing = cart.value[key];
      const nextCount = ((existing == null ? void 0 : existing.count) || 0) + 1;
      cart.value[key] = {
        id: data.id,
        specs: data.specs || {},
        count: nextCount
      };
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(categories.value, (cat, k0, i0) => {
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
        b: "nav-" + activeCategory.value,
        c: common_vendor.f(categories.value, (cat, k0, i0) => {
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
        d: rightScrollIntoView.value,
        e: common_vendor.o(handleScroll),
        f: totalCount.value > 0
      }, totalCount.value > 0 ? {
        g: common_assets._imports_0,
        h: common_vendor.t(totalCount.value),
        i: common_vendor.o(toggleCartDetail),
        j: common_vendor.t(totalPrice.value),
        k: common_vendor.o(checkout)
      } : {}, {
        l: common_vendor.p({
          ["current-path"]: "/pages/order/order"
        }),
        m: common_vendor.o(setShowCartDetail),
        n: common_vendor.o(updateCart),
        o: common_vendor.o(clearCart),
        p: common_vendor.p({
          show: showCartDetail.value,
          items: cart.value,
          getProduct: getProductById
        }),
        q: common_vendor.sr(detailPopup, "93207a4f-3", {
          "k": "detailPopup"
        }),
        r: common_vendor.o(onAddToCart)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-93207a4f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/order.js.map
