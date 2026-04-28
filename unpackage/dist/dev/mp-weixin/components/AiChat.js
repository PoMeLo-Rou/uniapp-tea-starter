"use strict";
const common_vendor = require("../common/vendor.js");
const common_ws_socket = require("../common/ws/socket.js");
const common_api_product = require("../common/api/product.js");
const common_api_request = require("../common/api/request.js");
const _sfc_main = {
  __name: "AiChat",
  setup(__props) {
    const showChat = common_vendor.ref(false);
    const messages = common_vendor.ref([]);
    const inputText = common_vendor.ref("");
    const isStreaming = common_vendor.ref(false);
    const scrollTop = common_vendor.ref(0);
    const productCache = common_vendor.ref([]);
    const productCacheLoaded = common_vendor.ref(false);
    const quickTags = ["想喝清爽的", "今天好热", "推荐甜一点的", "有什么新品吗", "适合拍照的饮品"];
    const chatHistory = [];
    const normalizeAiText = (raw) => {
      let text = String(raw || "");
      text = text.replace(/\*\*(.*?)\*\*/g, "$1");
      text = text.replace(/__(.*?)__/g, "$1");
      text = text.replace(/`([^`]*)`/g, "$1");
      text = text.replace(/^#{1,6}\s*/gm, "");
      text = text.replace(/^\s*[-*]\s+/gm, "");
      text = text.replace(/\n{3,}/g, "\n\n");
      return text.trim();
    };
    const getMemberUserId = () => {
      const raw = common_vendor.index.getStorageSync("member");
      if (!raw)
        return 0;
      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw);
          return parsed.userId || parsed.id || 0;
        } catch (_) {
          return 0;
        }
      }
      return raw.userId || raw.id || 0;
    };
    const isProductOnSale = (product) => {
      if ((product == null ? void 0 : product.status) === void 0 || (product == null ? void 0 : product.status) === null)
        return true;
      if (typeof product.status === "number")
        return product.status === 1;
      const status = String(product.status).toLowerCase();
      return status === "1" || status === "on" || status === "onsale" || status === "on_sale" || status === "active";
    };
    const normalizeMatchText = (text) => String(text || "").toLowerCase().replace(/[\s"'“”‘’`~!@#$%^&*()_+\-=[\]{};:：,，.。/<>?？、|\\]/g, "");
    const loadProducts = async () => {
      if (productCacheLoaded.value)
        return productCache.value;
      try {
        const list = await common_api_product.fetchProducts();
        productCache.value = (Array.isArray(list) ? list : []).filter((item) => (item == null ? void 0 : item.id) && (item == null ? void 0 : item.name) && isProductOnSale(item));
        productCacheLoaded.value = true;
        return productCache.value;
      } catch (error) {
        common_vendor.index.__f__("error", "at components/AiChat.vue:144", "[AiChat] 加载商品列表失败:", error);
        return [];
      }
    };
    const findMentionedProducts = async (text) => {
      const products = await loadProducts();
      const normalizedText = normalizeMatchText(text);
      if (!normalizedText)
        return [];
      return products.map((product) => {
        const name = String(product.name || "");
        const normalizedName = normalizeMatchText(name);
        if (!normalizedName || !normalizedText.includes(normalizedName))
          return null;
        return {
          ...product,
          matchIndex: normalizedText.indexOf(normalizedName)
        };
      }).filter(Boolean).sort((a, b) => a.matchIndex - b.matchIndex).slice(0, 4);
    };
    const attachProductsToLastAiMessage = async (messageIndex) => {
      const target = messages.value[messageIndex];
      if (!target || target.role !== "ai" || !target.content)
        return;
      const products = await findMentionedProducts(target.content);
      if (!products.length)
        return;
      messages.value.splice(messageIndex, 1, {
        ...target,
        products
      });
      scrollToBottom();
    };
    const formatPrice = (value) => {
      const amount = Number(value || 0);
      return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
    };
    const scrollToBottom = () => {
      common_vendor.nextTick$1(() => {
        scrollTop.value = scrollTop.value === 99999 ? 1e5 : 99999;
      });
    };
    const openChat = () => {
      showChat.value = true;
      loadProducts();
      if (!common_ws_socket.socketManager.isConnected) {
        const userId = getMemberUserId();
        common_vendor.index.__f__("log", "at components/AiChat.vue:197", "[AiChat] 打开聊天，连接 WS, userId:", userId);
        common_ws_socket.socketManager.connect(userId != null ? userId : 0);
      }
    };
    const closeChat = () => {
      showChat.value = false;
    };
    const onSend = () => {
      const text = inputText.value.trim();
      if (!text || isStreaming.value)
        return;
      sendMessage(text);
    };
    const sendMessage = async (text) => {
      inputText.value = "";
      messages.value.push({ role: "user", content: text });
      chatHistory.push({ role: "user", content: text });
      messages.value.push({ role: "ai", content: "", loading: true, products: [] });
      isStreaming.value = true;
      scrollToBottom();
      try {
        const userId = getMemberUserId();
        if (!common_ws_socket.socketManager.isConnected) {
          common_vendor.index.__f__("log", "at components/AiChat.vue:225", "[AiChat] WS 未连接，正在连接... userId:", userId);
          common_ws_socket.socketManager.connect(userId);
        }
        await common_ws_socket.socketManager.waitForReady();
        common_vendor.index.__f__("log", "at components/AiChat.vue:230", "[AiChat] WS 已就绪，发送 ai_recommend");
        const sent = common_ws_socket.socketManager.send({ type: "ai_recommend", messages: chatHistory });
        if (!sent) {
          throw new Error("消息发送失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at components/AiChat.vue:236", "[AiChat] 发送失败:", error.message);
        const last = messages.value[messages.value.length - 1];
        if (last && last.role === "ai") {
          const msg = error.message || "";
          last.content = msg.includes("超时") || msg.includes("连接失败") ? "连接超时，请确认后端服务已启动，且小程序接口地址配置正确。" : "连接失败: " + msg;
          last.loading = false;
        }
        isStreaming.value = false;
      }
    };
    const openProductSpec = (product) => {
      if (!(product == null ? void 0 : product.id))
        return;
      showChat.value = false;
      common_vendor.index.setStorageSync("pendingOpenSpecProductId", product.id);
      common_vendor.index.switchTab({
        url: "/pages/order/order",
        success: () => {
          setTimeout(() => {
            common_vendor.index.$emit("openSpec", { productId: product.id });
          }, 450);
        }
      });
    };
    const onChunk = (msg) => {
      const last = messages.value[messages.value.length - 1];
      if (last && last.role === "ai" && last.loading) {
        last.content += msg.content;
        scrollToBottom();
      }
    };
    const onDone = async () => {
      const messageIndex = messages.value.length - 1;
      const last = messages.value[messageIndex];
      if (last && last.role === "ai") {
        last.loading = false;
        last.content = normalizeAiText(last.content);
        chatHistory.push({ role: "assistant", content: last.content });
        await attachProductsToLastAiMessage(messageIndex);
      }
      isStreaming.value = false;
    };
    const onError = (msg) => {
      const last = messages.value[messages.value.length - 1];
      if (last && last.role === "ai") {
        last.content = "AI 服务暂不可用: " + msg.message;
        common_vendor.index.__f__("error", "at components/AiChat.vue:287", "[AiChat] AI 错误:", msg.message);
        last.loading = false;
      }
      isStreaming.value = false;
    };
    common_ws_socket.socketManager.on("ai_chunk", onChunk);
    common_ws_socket.socketManager.on("ai_done", onDone);
    common_ws_socket.socketManager.on("ai_error", onError);
    common_vendor.onUnmounted(() => {
      common_ws_socket.socketManager.off("ai_chunk", onChunk);
      common_ws_socket.socketManager.off("ai_done", onDone);
      common_ws_socket.socketManager.off("ai_error", onError);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !showChat.value
      }, !showChat.value ? {
        b: common_vendor.o(openChat)
      } : {}, {
        c: showChat.value
      }, showChat.value ? common_vendor.e({
        d: common_vendor.o(closeChat),
        e: common_vendor.f(messages.value, (msg, idx, i0) => {
          return common_vendor.e({
            a: common_vendor.t(msg.role === "user" ? "我" : "AI"),
            b: common_vendor.t(msg.content),
            c: msg.loading
          }, msg.loading ? {} : {}, {
            d: msg.role === "ai" && msg.products && msg.products.length
          }, msg.role === "ai" && msg.products && msg.products.length ? {
            e: common_vendor.f(msg.products, (product, k1, i1) => {
              return {
                a: common_vendor.unref(common_api_request.normalizeImageUrl)(product.image || "/static/order.png"),
                b: common_vendor.t(product.name),
                c: common_vendor.t(product.desc || product.tag || "AI 推荐饮品"),
                d: common_vendor.t(formatPrice(product.price)),
                e: common_vendor.o(($event) => openProductSpec(product), product.id),
                f: product.id,
                g: common_vendor.o(($event) => openProductSpec(product), product.id)
              };
            })
          } : {}, {
            f: idx,
            g: common_vendor.n(msg.role)
          });
        }),
        f: scrollTop.value,
        g: messages.value.length === 0
      }, messages.value.length === 0 ? {
        h: common_vendor.f(quickTags, (tag, k0, i0) => {
          return {
            a: common_vendor.t(tag),
            b: tag,
            c: common_vendor.o(($event) => sendMessage(tag), tag)
          };
        })
      } : {}, {
        i: isStreaming.value,
        j: common_vendor.o(onSend),
        k: inputText.value,
        l: common_vendor.o(($event) => inputText.value = $event.detail.value),
        m: !inputText.value.trim() || isStreaming.value ? 1 : "",
        n: common_vendor.o(onSend),
        o: common_vendor.o(() => {
        }),
        p: common_vendor.o(closeChat)
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d3c0f1b8"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/AiChat.js.map
