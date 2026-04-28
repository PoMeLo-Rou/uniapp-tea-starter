"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api_auth = require("../../common/api/auth.js");
const stores_modules_member = require("../../stores/modules/member.js");
const _sfc_main = {
  __name: "login",
  setup(__props) {
    const memberStore = stores_modules_member.useMemberStore();
    const safeAreaInsets = (() => {
      try {
        const sys = common_vendor.index.getSystemInfoSync();
        return sys.safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 };
      } catch (_) {
        return { top: 0, bottom: 0, left: 0, right: 0 };
      }
    })();
    const mode = common_vendor.ref("login");
    const submitting = common_vendor.ref(false);
    const showPassword = common_vendor.ref(false);
    const showConfirmPassword = common_vendor.ref(false);
    const form = common_vendor.reactive({
      username: "",
      nickname: "",
      password: "",
      confirmPassword: ""
    });
    const setMode = (nextMode) => {
      mode.value = nextMode === "register" ? "register" : "login";
    };
    const normalizeAuthPayload = (payload = {}) => {
      const data = payload.data && typeof payload.data === "object" ? payload.data : payload;
      const user = data.user || data.member || data.userInfo || data;
      return {
        token: data.token || data.accessToken || user.token || "",
        user
      };
    };
    const validate = () => {
      const username = form.username.trim();
      if (!username) {
        common_vendor.index.showToast({ title: "请输入用户名", icon: "none" });
        return false;
      }
      if (username.length < 3) {
        common_vendor.index.showToast({ title: "用户名至少 3 位", icon: "none" });
        return false;
      }
      if (!form.password) {
        common_vendor.index.showToast({ title: "请输入密码", icon: "none" });
        return false;
      }
      if (form.password.length < 6) {
        common_vendor.index.showToast({ title: "密码至少 6 位", icon: "none" });
        return false;
      }
      if (mode.value === "register" && form.password !== form.confirmPassword) {
        common_vendor.index.showToast({ title: "两次密码不一致", icon: "none" });
        return false;
      }
      return true;
    };
    const getAuthErrorMessage = (error) => {
      var _a, _b, _c;
      const statusCode = Number((error == null ? void 0 : error.statusCode) || 0);
      const serverMessage = String((error == null ? void 0 : error.message) || "");
      const serverCode = String(((_a = error == null ? void 0 : error.data) == null ? void 0 : _a.code) || ((_b = error == null ? void 0 : error.data) == null ? void 0 : _b.errorCode) || "").toUpperCase();
      const rawText = String(((_c = error == null ? void 0 : error.data) == null ? void 0 : _c.rawText) || (error == null ? void 0 : error.rawData) || "");
      const lowerText = `${serverMessage} ${serverCode} ${rawText}`.toLowerCase();
      const isRouteMissing = lowerText.includes("cannot post") || lowerText.includes("cannot get") || lowerText.includes("not found") && lowerText.includes("/api/auth/");
      if (mode.value === "login") {
        if (isRouteMissing)
          return "登录接口不存在，请检查后端是否已实现 /api/auth/login";
        if (serverCode.includes("USER_NOT_FOUND") || serverCode.includes("ACCOUNT_NOT_FOUND")) {
          return "账号不存在，请先注册";
        }
        if (serverCode.includes("PASSWORD_ERROR") || serverCode.includes("BAD_CREDENTIALS")) {
          return "密码错误，请重新输入";
        }
        if (statusCode === 404)
          return "账号不存在，请先注册";
        if (statusCode === 401 || statusCode === 403)
          return "用户名或密码错误";
      }
      if (mode.value === "register") {
        if (isRouteMissing)
          return "注册接口不存在，请检查后端是否已实现 /api/auth/register";
        if (statusCode === 409 || serverCode.includes("USER_EXISTS") || serverCode.includes("USERNAME_EXISTS")) {
          return "用户名已存在，请更换后再注册";
        }
        if (statusCode === 400)
          return serverMessage || "注册信息格式不正确";
      }
      if (statusCode >= 500)
        return "服务器异常，请稍后再试";
      if (serverMessage && !serverMessage.includes("<!DOCTYPE"))
        return serverMessage;
      if (error == null ? void 0 : error.errMsg)
        return "网络连接失败，请检查后端服务是否启动";
      return "操作失败，请稍后再试";
    };
    const submit = async () => {
      if (submitting.value || !validate())
        return;
      submitting.value = true;
      try {
        const username = form.username.trim();
        const payload = mode.value === "login" ? await common_api_auth.loginByPassword({ username, password: form.password }) : await common_api_auth.registerByPassword({
          username,
          password: form.password,
          nickname: form.nickname.trim() || username
        });
        const { token, user } = normalizeAuthPayload(payload);
        if (!(user == null ? void 0 : user.id) && !(user == null ? void 0 : user.userId)) {
          throw new Error("登录成功但未返回用户信息");
        }
        memberStore.setUserInfo({
          ...user,
          username: user.username || username,
          nickname: user.nickname || form.nickname.trim() || username
        });
        if (token) {
          common_vendor.index.setStorageSync("token", token);
        }
        common_vendor.index.showToast({ title: mode.value === "login" ? "登录成功" : "注册成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.switchTab({ url: "/pages/mine/mine" });
        }, 600);
      } catch (error) {
        common_vendor.index.showToast({ title: getAuthErrorMessage(error), icon: "none" });
      } finally {
        submitting.value = false;
      }
    };
    const goBack = () => {
      try {
        common_vendor.index.navigateBack();
      } catch (_) {
        common_vendor.index.switchTab({ url: "/pages/mine/mine" });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.unref(safeAreaInsets).top + "px",
        c: common_vendor.n(mode.value === "login" ? "active" : ""),
        d: common_vendor.o(($event) => setMode("login")),
        e: common_vendor.n(mode.value === "register" ? "active" : ""),
        f: common_vendor.o(($event) => setMode("register")),
        g: form.username,
        h: common_vendor.o(($event) => form.username = $event.detail.value),
        i: mode.value === "register"
      }, mode.value === "register" ? {
        j: form.nickname,
        k: common_vendor.o(($event) => form.nickname = $event.detail.value)
      } : {}, {
        l: !showPassword.value,
        m: form.password,
        n: common_vendor.o(($event) => form.password = $event.detail.value),
        o: common_vendor.n(showPassword.value ? "open" : "closed"),
        p: common_vendor.o(($event) => showPassword.value = !showPassword.value),
        q: mode.value === "register"
      }, mode.value === "register" ? {
        r: !showConfirmPassword.value,
        s: form.confirmPassword,
        t: common_vendor.o(($event) => form.confirmPassword = $event.detail.value),
        v: common_vendor.n(showConfirmPassword.value ? "open" : "closed"),
        w: common_vendor.o(($event) => showConfirmPassword.value = !showConfirmPassword.value)
      } : {}, {
        x: common_vendor.t(mode.value === "login" ? "登录" : "注册并登录"),
        y: submitting.value,
        z: submitting.value,
        A: common_vendor.o(submit),
        B: common_vendor.t(mode.value === "login" ? "没有账号时可以切换到注册。" : "普通用户注册后默认为会员，管理员角色由后台数据库分配。")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
