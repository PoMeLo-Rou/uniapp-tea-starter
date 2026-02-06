"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "order",
  setup(__props) {
    const activeCategory = common_vendor.ref(1);
    const rightScrollIntoView = common_vendor.ref("");
    const cart = common_vendor.ref({});
    const showCartDetail = common_vendor.ref(false);
    const categories = [
      { id: 1, name: "当季限定", icon: "🌟" },
      { id: 2, name: "人气必喝", icon: "🔥" },
      { id: 3, name: "清爽果茶", icon: "🍇" },
      { id: 4, name: "浓郁奶茶", icon: "🥤" },
      { id: 5, name: "纯茶系列", icon: "🍵" },
      { id: 6, name: "热麦面包", icon: "🥯" }
    ];
    const products = [
      { id: 101, categoryId: 1, name: "多肉葡萄冻", price: 29, desc: "鲜剥葡萄肉，搭配清新绿茶底", image: "", tag: "人气TOP" },
      { id: 102, categoryId: 1, name: "酷黑莓桑", price: 19, desc: "桑葚与草莓的奇妙碰撞", image: "", tag: "新品" },
      { id: 201, categoryId: 2, name: "烤黑糖波波牛乳", price: 21, desc: "焦香黑糖，Q弹波波", image: "", tag: "推荐" },
      { id: 202, categoryId: 2, name: "芝芝莓莓", price: 28, desc: "精选草莓，搭配浓郁芝士奶盖", image: "", tag: null },
      { id: 301, categoryId: 3, name: "满杯红柚", price: 23, desc: "满满红柚果肉，清新解腻", image: "", tag: null },
      { id: 401, categoryId: 4, name: "雪山纯奶", price: 18, desc: "纯净高原奶源", image: "", tag: null },
      { id: 501, categoryId: 5, name: "金凤茶王", price: 16, desc: "独家定制乌龙茶底", image: "", tag: null }
    ];
    const getProductsByCategory = (catId) => products.filter((p) => p.categoryId === catId);
    const getProductById = (pid) => products.find((p) => p.id == pid);
    const totalCount = common_vendor.computed(() => Object.values(cart.value).reduce((a, b) => a + b, 0));
    const totalPrice = common_vendor.computed(() => {
      return Object.entries(cart.value).reduce((total, [pid, count]) => {
        const p = getProductById(pid);
        return total + (p ? p.price * count : 0);
      }, 0);
    });
    const getCategoryCount = (catId) => {
      const catProducts = getProductsByCategory(catId);
      let count = 0;
      catProducts.forEach((p) => {
        if (cart.value[p.id])
          count += cart.value[p.id];
      });
      return count;
    };
    const updateCart = (productId, delta) => {
      const current = cart.value[productId] || 0;
      const next = current + delta;
      if (next <= 0) {
        delete cart.value[productId];
      } else {
        cart.value[productId] = next;
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
    const scrollToCategory = (catId) => {
      activeCategory.value = catId;
      rightScrollIntoView.value = "category-" + catId;
    };
    const handleScroll = (e) => {
    };
    const checkout = () => {
      if (totalCount.value === 0)
        return;
      common_vendor.index.showToast({
        title: "结算功能演示",
        icon: "none"
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(categories, (cat, k0, i0) => {
          return common_vendor.e({
            a: activeCategory.value === cat.id
          }, activeCategory.value === cat.id ? {} : {}, {
            b: common_vendor.t(cat.icon),
            c: common_vendor.t(cat.name),
            d: getCategoryCount(cat.id) > 0
          }, getCategoryCount(cat.id) > 0 ? {
            e: common_vendor.t(getCategoryCount(cat.id))
          } : {}, {
            f: cat.id,
            g: "nav-" + cat.id,
            h: common_vendor.n(activeCategory.value === cat.id ? "active" : ""),
            i: common_vendor.o(($event) => scrollToCategory(cat.id), cat.id)
          });
        }),
        b: "nav-" + activeCategory.value,
        c: common_vendor.f(categories, (cat, k0, i0) => {
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
                g: cart.value[product.id]
              }, cart.value[product.id] ? {
                h: common_vendor.o(($event) => updateCart(product.id, -1), product.id)
              } : {}, {
                i: cart.value[product.id]
              }, cart.value[product.id] ? {
                j: common_vendor.t(cart.value[product.id])
              } : {}, {
                k: common_vendor.o(($event) => updateCart(product.id, 1), product.id),
                l: product.id
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
        g: common_vendor.t(totalCount.value)
      } : {}, {
        h: common_vendor.o(toggleCartDetail),
        i: totalCount.value > 0
      }, totalCount.value > 0 ? {
        j: common_vendor.t(totalPrice.value)
      } : {}, {
        k: totalCount.value === 0 ? 1 : "",
        l: common_vendor.o(checkout),
        m: showCartDetail.value && totalCount.value > 0
      }, showCartDetail.value && totalCount.value > 0 ? {
        n: common_vendor.o(clearCart),
        o: common_vendor.f(cart.value, (count, pid, i0) => {
          return {
            a: common_vendor.t(getProductById(pid).name),
            b: common_vendor.t(getProductById(pid).price * count),
            c: common_vendor.o(($event) => updateCart(pid, -1), pid),
            d: common_vendor.t(count),
            e: common_vendor.o(($event) => updateCart(pid, 1), pid),
            f: pid
          };
        }),
        p: common_vendor.o(() => {
        }),
        q: common_vendor.o(($event) => showCartDetail.value = false)
      } : {});
    };
  }
};
wx.createPage(_sfc_main);
