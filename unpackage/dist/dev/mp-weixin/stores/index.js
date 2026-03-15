"use strict";
const common_vendor = require("../common/vendor.js");
const stores_persist = require("./persist.js");
const pinia = common_vendor.createPinia();
pinia.use(stores_persist.createPersistedState());
exports.pinia = pinia;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/index.js.map
