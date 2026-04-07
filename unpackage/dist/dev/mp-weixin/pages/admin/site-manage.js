"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_site = require("../../common/api/site.js");
const stores_modules_member = require("../../stores/modules/member.js");
const defaultBanner = "https://dummyimage.com/750x280/f3f4f6/9ca3af&text=Order+Banner";
const _sfc_main = {
  __name: "site-manage",
  setup(__props) {
    const { safeAreaInsets } = common_vendor.index.getSystemInfoSync();
    const memberStore = stores_modules_member.useMemberStore();
    const uploadingHomeBanner = common_vendor.ref(false);
    const uploadingOrderBanner = common_vendor.ref(false);
    const saving = common_vendor.ref(false);
    const form = common_vendor.reactive({
      homeBanners: [],
      orderPageBanner: "",
      orderPageBannerText: "",
      storeName: "",
      storeAddress: "",
      pickupDistanceText: "",
      deliveryAddressText: "",
      deliveryStoreLine: "",
      storeSlogan: ""
    });
    const ensureAdminAccess = () => {
      if (!memberStore.isLoggedIn || !memberStore.isAdmin) {
        common_vendor.index.showToast({ title: "无管理员权限", icon: "none" });
        common_vendor.index.switchTab({ url: "/pages/mine/mine" });
        return false;
      }
      return true;
    };
    const loadConfig = async () => {
      const data = await common_api_site.fetchSiteConfig();
      form.homeBanners = Array.isArray(data.homeBanners) ? data.homeBanners : [];
      form.orderPageBanner = data.orderPageBanner || "";
      form.orderPageBannerText = data.orderPageBannerText || "";
      form.storeName = data.storeName || "";
      form.storeAddress = data.storeAddress || "";
      form.pickupDistanceText = data.pickupDistanceText || "";
      form.deliveryAddressText = data.deliveryAddressText || "";
      form.deliveryStoreLine = data.deliveryStoreLine || "";
      form.storeSlogan = data.storeSlogan || "";
    };
    const chooseOneImage = () => {
      return new Promise((resolve, reject) => {
        common_vendor.index.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          success: (res) => resolve((res.tempFilePaths || [])[0] || ""),
          fail: reject
        });
      });
    };
    const addHomeBanner = async () => {
      uploadingHomeBanner.value = true;
      try {
        const filePath = await chooseOneImage();
        if (!filePath)
          return;
        const url = await common_api_site.uploadSiteImage(filePath);
        form.homeBanners.push(url);
      } catch (e) {
        common_vendor.index.showToast({ title: e.message || "上传失败", icon: "none" });
      } finally {
        uploadingHomeBanner.value = false;
      }
    };
    const removeHomeBanner = async (idx, url) => {
      form.homeBanners.splice(idx, 1);
      try {
        await common_api_site.deleteSiteImage(url);
      } catch (_) {
      }
    };
    const changeOrderBanner = async () => {
      uploadingOrderBanner.value = true;
      try {
        const oldUrl = form.orderPageBanner;
        const filePath = await chooseOneImage();
        if (!filePath)
          return;
        const url = await common_api_site.uploadSiteImage(filePath);
        form.orderPageBanner = url;
        if (oldUrl) {
          try {
            await common_api_site.deleteSiteImage(oldUrl);
          } catch (_) {
          }
        }
      } catch (e) {
        common_vendor.index.showToast({ title: e.message || "上传失败", icon: "none" });
      } finally {
        uploadingOrderBanner.value = false;
      }
    };
    const clearOrderBanner = async () => {
      const oldUrl = form.orderPageBanner;
      form.orderPageBanner = "";
      if (!oldUrl)
        return;
      try {
        await common_api_site.deleteSiteImage(oldUrl);
      } catch (_) {
      }
    };
    const saveAll = async () => {
      saving.value = true;
      try {
        await common_api_site.updateSiteConfig({
          homeBanners: form.homeBanners,
          orderPageBanner: form.orderPageBanner,
          orderPageBannerText: form.orderPageBannerText,
          storeName: form.storeName,
          storeAddress: form.storeAddress,
          pickupDistanceText: form.pickupDistanceText,
          deliveryAddressText: form.deliveryAddressText,
          deliveryStoreLine: form.deliveryStoreLine,
          storeSlogan: form.storeSlogan
        });
        common_vendor.index.showToast({ title: "保存成功", icon: "success" });
      } catch (e) {
        common_vendor.index.showToast({ title: e.message || "保存失败", icon: "none" });
      } finally {
        saving.value = false;
      }
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    common_vendor.onLoad(async () => {
      if (!ensureAdminAccess())
        return;
      try {
        await loadConfig();
      } catch (e) {
        common_vendor.index.showToast({ title: e.message || "配置加载失败", icon: "none" });
      }
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goBack),
        b: common_vendor.f(form.homeBanners, (url, idx, i0) => {
          return {
            a: url,
            b: common_vendor.o(($event) => removeHomeBanner(idx, url), url + idx),
            c: url + idx
          };
        }),
        c: common_vendor.t(uploadingHomeBanner.value ? "上传中" : "新增轮播图"),
        d: uploadingHomeBanner.value,
        e: common_vendor.o(addHomeBanner),
        f: form.orderPageBanner || defaultBanner,
        g: common_vendor.t(uploadingOrderBanner.value ? "上传中" : "上传/替换图片"),
        h: uploadingOrderBanner.value,
        i: common_vendor.o(changeOrderBanner),
        j: common_vendor.o(clearOrderBanner),
        k: form.orderPageBannerText,
        l: common_vendor.o(($event) => form.orderPageBannerText = $event.detail.value),
        m: form.storeName,
        n: common_vendor.o(($event) => form.storeName = $event.detail.value),
        o: form.storeAddress,
        p: common_vendor.o(($event) => form.storeAddress = $event.detail.value),
        q: form.pickupDistanceText,
        r: common_vendor.o(($event) => form.pickupDistanceText = $event.detail.value),
        s: form.deliveryAddressText,
        t: common_vendor.o(($event) => form.deliveryAddressText = $event.detail.value),
        v: form.deliveryStoreLine,
        w: common_vendor.o(($event) => form.deliveryStoreLine = $event.detail.value),
        x: form.storeSlogan,
        y: common_vendor.o(($event) => form.storeSlogan = $event.detail.value),
        z: common_vendor.t(saving.value ? "保存中..." : "保存全部配置"),
        A: saving.value,
        B: common_vendor.o(saveAll),
        C: common_vendor.unref(safeAreaInsets).top + "px"
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-246888e4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/site-manage.js.map
