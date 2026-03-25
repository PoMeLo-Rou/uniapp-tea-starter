"use strict";
const common_vendor = require("../common/vendor.js");
const common_ws_socket = require("../common/ws/socket.js");
const _sfc_main = {
  __name: "AiChat",
  setup(__props) {
    const showChat = common_vendor.ref(false);
    const messages = common_vendor.ref([]);
    const inputText = common_vendor.ref("");
    const isStreaming = common_vendor.ref(false);
    const scrollTop = common_vendor.ref(0);
    const quickTags = ["想喝清爽的", "今天好热", "推荐甜一点的", "有什么新品吗", "适合拍照的饮品"];
    const chatHistory = [];
    const scrollToBottom = () => {
      common_vendor.nextTick$1(() => {
        scrollTop.value = scrollTop.value === 99999 ? 1e5 : 99999;
      });
    };
    const openChat = () => {
      showChat.value = true;
      if (!common_ws_socket.socketManager.isConnected) {
        const memberRaw = common_vendor.index.getStorageSync("member");
        const userId = memberRaw ? memberRaw.userId : 0;
        common_vendor.index.__f__("log", "at components/AiChat.vue:80", "[AiChat] 打开聊天，连接 WS, userId:", userId);
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
      messages.value.push({ role: "ai", content: "", loading: true });
      isStreaming.value = true;
      scrollToBottom();
      try {
        const memberRaw = common_vendor.index.getStorageSync("member");
        const userId = memberRaw != null && memberRaw.userId != null ? memberRaw.userId : 0;
        if (!common_ws_socket.socketManager.isConnected) {
          common_vendor.index.__f__("log", "at components/AiChat.vue:109", "[AiChat] WS 未连接，正在连接... userId:", userId);
          common_ws_socket.socketManager.connect(userId);
        }
        await common_ws_socket.socketManager.waitForReady();
        common_vendor.index.__f__("log", "at components/AiChat.vue:114", "[AiChat] WS 已就绪，发送 ai_recommend");
        const sent = common_ws_socket.socketManager.send({ type: "ai_recommend", messages: chatHistory });
        if (!sent) {
          throw new Error("消息发送失败");
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at components/AiChat.vue:120", "[AiChat] 发送失败:", e.message);
        const last = messages.value[messages.value.length - 1];
        if (last && last.role === "ai") {
          const msg = e.message || "";
          last.content = msg.includes("超时") || msg.includes("连接失败") ? "连接超时，请确认：1) 后端服务已启动 2) 微信开发者工具中接口地址为本机 IP（如 192.168.x.x:8080）" : "连接失败: " + msg;
          last.loading = false;
        }
        isStreaming.value = false;
      }
    };
    const onChunk = (msg) => {
      const last = messages.value[messages.value.length - 1];
      if (last && last.role === "ai" && last.loading) {
        last.content += msg.content;
        common_vendor.index.__f__("log", "at components/AiChat.vue:137", "[AiChat] 收到 AI 片段:", msg.content, "当前累计内容:", last.content);
        scrollToBottom();
      }
    };
    const onDone = () => {
      const last = messages.value[messages.value.length - 1];
      if (last && last.role === "ai") {
        last.loading = false;
        chatHistory.push({ role: "assistant", content: last.content });
      }
      isStreaming.value = false;
    };
    const onError = (msg) => {
      const last = messages.value[messages.value.length - 1];
      if (last && last.role === "ai") {
        last.content = "AI 服务暂不可用: " + msg.message;
        common_vendor.index.__f__("error", "at components/AiChat.vue:155", "[AiChat] AI 错误:", msg.message);
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
            d: idx,
            e: common_vendor.n(msg.role)
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
