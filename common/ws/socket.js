import { getApiBase } from '@/common/api/request.js';

class SocketManager {
  constructor() {
    this.socketTask = null;
    this.isConnected = false;
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
    this.reconnectCount = 0;
    this.maxReconnect = 10;
    this.heartbeatInterval = 25000;
    this.listeners = new Map();
    this._userId = null;
  }

  // 建立连接
  connect(userId) {
    if (this.socketTask) return;
    if (userId == null) {
      console.warn('[WS] userId 为空，跳过连接');
      return;
    }
    this._userId = userId;
    this._authed = false;

    const base = getApiBase().replace(/^http/, 'ws');
    const url = `${base}/ws`;
    console.log('[WS] 正在连接:', url, 'userId:', userId);

    this.socketTask = uni.connectSocket({ url, complete: () => {} });

    this.socketTask.onOpen(() => {
      console.log('[WS] 连接已建立，发送 auth...');
      this.isConnected = true;
      this.reconnectCount = 0;
      this.send({ type: 'auth', userId: this._userId });
      this._startHeartbeat();
    });

    this.socketTask.onMessage((res) => {
      try {
        const msg = JSON.parse(res.data);
        console.log('[WS] 收到消息:', msg.type);
        if (msg.type === 'auth_ok') {
          this._authed = true;
          if (this._onReadyResolve) {
            this._clearReadyTimer();
            this._onReadyResolve();
            this._onReadyResolve = null;
            this._rejectReady = null;
          }
        }
        this._emit(msg.type, msg);
      } catch (e) {
        console.error('[WS] 消息解析失败:', e);
      }
    });

    this.socketTask.onClose(() => {
      console.log('[WS] 连接已关闭');
      this.isConnected = false;
      this._authed = false;
      this.socketTask = null;
      this._stopHeartbeat();
      this._clearReadyTimer();
      if (this._rejectReady) {
        this._rejectReady(new Error('连接已关闭'));
        this._onReadyResolve = null;
        this._rejectReady = null;
      }
      this._scheduleReconnect();
    });

    this.socketTask.onError((err) => {
      console.error('[WS] 连接错误:', err);
      if (!this.isConnected) {
        this.socketTask = null;
        this._clearReadyTimer();
        if (this._rejectReady) {
          this._rejectReady(new Error('WebSocket 连接失败'));
          this._onReadyResolve = null;
          this._rejectReady = null;
        }
      }
    });
  }

  _clearReadyTimer() {
    if (this._readyTimer) {
      clearTimeout(this._readyTimer);
      this._readyTimer = null;
    }
  }

  waitForReady(timeoutMs = 8000) {
    if (this.isConnected && this._authed) return Promise.resolve();
    return new Promise((resolve, reject) => {
      this._onReadyResolve = resolve;
      this._rejectReady = reject;
      this._clearReadyTimer();
      this._readyTimer = setTimeout(() => {
        this._readyTimer = null;
        if (!this._authed && this._rejectReady) {
          const rej = this._rejectReady;
          this._onReadyResolve = null;
          this._rejectReady = null;
          rej(new Error('WebSocket 连接超时，请检查后端是否启动且地址正确'));
        }
      }, timeoutMs);
    });
  }

  // 发送消息
  send(data) {    //发消息给后端
    if (!this.socketTask || !this.isConnected) return false;
    this.socketTask.send({ data: JSON.stringify(data) });
    return true;
  }

  // 主动关闭连接
  close() {
    this._stopHeartbeat();
    this._clearReadyTimer();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectCount = this.maxReconnect;
    if (this.socketTask) {
      this.socketTask.close({});
      this.socketTask = null;
    }
    this.isConnected = false;
    this._authed = false;
    this._onReadyResolve = null;
    this._rejectReady = null;
  }

  // 监听某类消息
  on(type, callback) {     //监听某类消息（比如 order_status）
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(callback);
  }

  // 取消监听
  off(type, callback) {
    if (this.listeners.has(type)) this.listeners.get(type).delete(callback);
  }

  // 分发消息给监听者
  _emit(type, data) {
    const cbs = this.listeners.get(type);
    if (cbs) cbs.forEach((cb) => cb(data));
  }

  // 心跳：每 25 秒发一次 ping
  _startHeartbeat() {
    this._stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) this.send({ type: 'ping' });
    }, this.heartbeatInterval);
  }

  _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // 断线重连：指数退避（1s, 2s, 4s, 8s... 最大30s）
  _scheduleReconnect() {
    if (this.reconnectCount >= this.maxReconnect) {
      console.log('[WS] 达到最大重连次数，停止重连');
      return;
    }
    if (this.reconnectTimer) return;

    const delay = Math.min(1000 * Math.pow(2, this.reconnectCount), 30000);
    this.reconnectCount++;
    console.log(`[WS] ${delay / 1000}s 后尝试第 ${this.reconnectCount} 次重连...`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect(this._userId);
    }, delay);
  }
}

export const socketManager = new SocketManager();