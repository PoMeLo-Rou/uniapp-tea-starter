"use strict";
const common_vendor = require("../common/vendor.js");
const createPersistedState = () => {
  return ({ store }) => {
    var _a;
    const persistOption = (_a = store.$options) == null ? void 0 : _a.persist;
    if (!persistOption)
      return;
    const key = typeof persistOption === "object" ? persistOption.key : store.$id;
    try {
      const saved = common_vendor.index.getStorageSync(key);
      if (saved) {
        store.$patch(saved);
      }
    } catch (e) {
    }
    store.$subscribe((_mutation, state) => {
      try {
        common_vendor.index.setStorageSync(key, JSON.parse(JSON.stringify(state)));
      } catch (e) {
      }
    });
  };
};
exports.createPersistedState = createPersistedState;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/persist.js.map
