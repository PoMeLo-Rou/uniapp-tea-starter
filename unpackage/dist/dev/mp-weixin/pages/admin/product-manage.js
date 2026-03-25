"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_product = require("../../common/api/product.js");
const stores_modules_member = require("../../stores/modules/member.js");
const defaultImage = "https://dummyimage.com/200x200/f3f4f6/9ca3af&text=Tea";
const _sfc_main = {
  __name: "product-manage",
  setup(__props) {
    const memberStore = stores_modules_member.useMemberStore();
    const loading = common_vendor.ref(false);
    const saving = common_vendor.ref(false);
    const uploading = common_vendor.ref(false);
    const showEditor = common_vendor.ref(false);
    const keyword = common_vendor.ref("");
    const selectedCategoryId = common_vendor.ref(0);
    const categories = common_vendor.ref([]);
    const products = common_vendor.ref([]);
    const form = common_vendor.reactive({
      id: null,
      name: "",
      desc: "",
      price: "",
      image: "",
      category_id: null,
      status: 1
    });
    const specDraft = common_vendor.ref([]);
    const isOnSale = (product) => {
      if (product.status === void 0 || product.status === null)
        return true;
      if (typeof product.status === "number")
        return product.status === 1;
      const status = String(product.status).toLowerCase();
      return status === "1" || status === "on" || status === "onsale" || status === "on_sale" || status === "active";
    };
    const normalizeSpecDraft = (groups) => {
      return (groups || []).map((g) => ({
        id: g.id || null,
        groupName: g.groupName || "",
        groupCode: g.groupCode || "",
        options: Array.isArray(g.options) ? g.options : [],
        optionsText: (Array.isArray(g.options) ? g.options : []).map((opt) => opt.name).join("，")
      }));
    };
    const buildSpecsPayload = () => {
      return specDraft.value.map((group) => {
        const names = String(group.optionsText || "").split(/[，,、]/).map((s) => s.trim()).filter(Boolean);
        const oldOptions = Array.isArray(group.options) ? group.options : [];
        return {
          id: group.id || void 0,
          groupName: (group.groupName || "").trim(),
          groupCode: (group.groupCode || "").trim(),
          options: names.map((name, idx) => {
            const old = oldOptions[idx] || {};
            return {
              id: old.id || void 0,
              code: old.code || void 0,
              name
            };
          })
        };
      }).filter((group) => group.groupName && group.groupCode);
    };
    const filteredProducts = common_vendor.computed(() => {
      const key = keyword.value.trim().toLowerCase();
      return products.value.filter((p) => {
        const matchCategory = selectedCategoryId.value === 0 || p.category_id === selectedCategoryId.value;
        if (!matchCategory)
          return false;
        if (!key)
          return true;
        return String(p.name || "").toLowerCase().includes(key);
      });
    });
    const ensureAdminAccess = () => {
      if (!memberStore.isLoggedIn) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        common_vendor.index.switchTab({ url: "/pages/mine/mine" });
        return false;
      }
      if (!memberStore.isAdmin) {
        common_vendor.index.showToast({ title: "无管理员权限", icon: "none" });
        common_vendor.index.switchTab({ url: "/pages/mine/mine" });
        return false;
      }
      return true;
    };
    const loadData = async () => {
      loading.value = true;
      try {
        const [categoryList, productList] = await Promise.all([common_api_product.fetchCategories(), common_api_product.fetchProducts()]);
        categories.value = categoryList || [];
        products.value = productList || [];
      } catch (e) {
        common_vendor.index.showToast({ title: e.message || "加载失败", icon: "none" });
      } finally {
        loading.value = false;
      }
    };
    const toggleStatus = async (item) => {
      const nextOnSale = !isOnSale(item);
      try {
        await common_api_product.updateProductStatus(item.id, nextOnSale);
        item.status = nextOnSale ? 1 : 0;
        common_vendor.index.showToast({ title: nextOnSale ? "已上架" : "已下架", icon: "success" });
      } catch (e) {
        common_vendor.index.showToast({ title: e.message || "更新状态失败", icon: "none" });
      }
    };
    const openEditor = async (item) => {
      form.id = item.id;
      form.name = item.name || "";
      form.desc = item.desc || "";
      form.price = String(item.price ?? "");
      form.image = item.image || "";
      form.category_id = item.category_id || null;
      form.status = isOnSale(item) ? 1 : 0;
      specDraft.value = [];
      showEditor.value = true;
      try {
        const groups = await common_api_product.fetchProductSpecs(item.id);
        specDraft.value = normalizeSpecDraft(groups);
      } catch (e) {
        common_vendor.index.showToast({ title: "规格加载失败，可直接保存基础信息", icon: "none" });
      }
    };
    const closeEditor = () => {
      showEditor.value = false;
    };
    const chooseAndUploadImage = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        success: async (res) => {
          const filePath = res.tempFilePaths && res.tempFilePaths[0];
          if (!filePath)
            return;
          uploading.value = true;
          try {
            const imageUrl = await common_api_product.uploadProductImage(filePath);
            form.image = imageUrl;
            common_vendor.index.showToast({ title: "上传成功", icon: "success" });
          } catch (e) {
            common_vendor.index.showToast({ title: e.message || "上传失败", icon: "none" });
          } finally {
            uploading.value = false;
          }
        }
      });
    };
    const addSpecGroup = () => {
      specDraft.value.push({
        id: null,
        groupName: "",
        groupCode: "",
        options: [],
        optionsText: ""
      });
    };
    const removeSpecGroup = (idx) => {
      specDraft.value.splice(idx, 1);
    };
    const saveProduct = async () => {
      if (!form.id)
        return;
      if (!form.name.trim()) {
        common_vendor.index.showToast({ title: "请输入商品名", icon: "none" });
        return;
      }
      const priceNum = Number(form.price);
      if (Number.isNaN(priceNum) || priceNum < 0) {
        common_vendor.index.showToast({ title: "价格格式不正确", icon: "none" });
        return;
      }
      saving.value = true;
      try {
        await common_api_product.updateProduct(form.id, {
          name: form.name.trim(),
          desc: form.desc.trim(),
          price: priceNum,
          image: form.image,
          category_id: form.category_id,
          status: form.status
        });
        await common_api_product.updateProductSpecs(form.id, buildSpecsPayload());
        const target = products.value.find((p) => p.id === form.id);
        if (target) {
          target.name = form.name.trim();
          target.desc = form.desc.trim();
          target.price = priceNum;
          target.image = form.image;
          target.status = form.status;
        }
        common_vendor.index.showToast({ title: "保存成功", icon: "success" });
        closeEditor();
      } catch (e) {
        common_vendor.index.showToast({ title: e.message || "保存失败", icon: "none" });
      } finally {
        saving.value = false;
      }
    };
    common_vendor.onLoad(() => {
      if (!ensureAdminAccess())
        return;
      loadData();
    });
    common_vendor.onShow(() => {
      ensureAdminAccess();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: keyword.value,
        b: common_vendor.o(($event) => keyword.value = $event.detail.value),
        c: selectedCategoryId.value === 0 ? 1 : "",
        d: common_vendor.o(($event) => selectedCategoryId.value = 0),
        e: common_vendor.f(categories.value, (cat, k0, i0) => {
          return {
            a: common_vendor.t(cat.name),
            b: cat.id,
            c: selectedCategoryId.value === cat.id ? 1 : "",
            d: common_vendor.o(($event) => selectedCategoryId.value = cat.id, cat.id)
          };
        }),
        f: common_vendor.f(filteredProducts.value, (item, k0, i0) => {
          return {
            a: item.image || defaultImage,
            b: common_vendor.t(item.name),
            c: common_vendor.t(isOnSale(item) ? "上架中" : "已下架"),
            d: !isOnSale(item) ? 1 : "",
            e: common_vendor.t(item.desc || "暂无描述"),
            f: common_vendor.t(item.price),
            g: common_vendor.t(isOnSale(item) ? "下架" : "上架"),
            h: common_vendor.o(($event) => toggleStatus(item), item.id),
            i: common_vendor.o(($event) => openEditor(item), item.id),
            j: item.id
          };
        }),
        g: !filteredProducts.value.length
      }, !filteredProducts.value.length ? {} : {}, {
        h: showEditor.value
      }, showEditor.value ? {
        i: common_vendor.o(closeEditor),
        j: form.name,
        k: common_vendor.o(($event) => form.name = $event.detail.value),
        l: form.desc,
        m: common_vendor.o(($event) => form.desc = $event.detail.value),
        n: form.price,
        o: common_vendor.o(($event) => form.price = $event.detail.value),
        p: form.image || defaultImage,
        q: common_vendor.t(uploading.value ? "上传中" : "选择并上传"),
        r: uploading.value,
        s: common_vendor.o(chooseAndUploadImage),
        t: common_vendor.o(addSpecGroup),
        v: common_vendor.f(specDraft.value, (group, idx, i0) => {
          return {
            a: group.groupName,
            b: common_vendor.o(($event) => group.groupName = $event.detail.value, idx),
            c: group.groupCode,
            d: common_vendor.o(($event) => group.groupCode = $event.detail.value, idx),
            e: group.optionsText,
            f: common_vendor.o(($event) => group.optionsText = $event.detail.value, idx),
            g: common_vendor.o(($event) => removeSpecGroup(idx), idx),
            h: idx
          };
        }),
        w: common_vendor.o(closeEditor),
        x: saving.value,
        y: common_vendor.o(saveProduct),
        z: common_vendor.o(() => {
        }),
        A: common_vendor.o(closeEditor)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-74bd677b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/product-manage.js.map
