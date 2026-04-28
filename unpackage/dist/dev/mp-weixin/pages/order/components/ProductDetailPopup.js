"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_api_product = require("../../../common/api/product.js");
const common_utils_orderSpec = require("../../../common/utils/order-spec.js");
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "../../../node-modules/@dcloudio/uni-ui/lib/uni-popup/uni-popup.js";
if (!Math) {
  _easycom_uni_popup();
}
const _sfc_main = {
  __name: "ProductDetailPopup",
  emits: ["confirm"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const emit = __emit;
    const GROUP_ORDER = {
      size: 10,
      sweet: 20,
      temp: 30,
      ice: 40,
      addon: 50,
      addons: 50,
      topping: 50,
      toppings: 50,
      extra: 60,
      extras: 60
    };
    const popupRef = common_vendor.ref(null);
    const selectedProd = common_vendor.reactive({ id: null, name: "", price: 0 });
    const specGroups = common_vendor.ref([]);
    const selectedSingleMap = common_vendor.ref({});
    const selectedMultiMap = common_vendor.ref({});
    const pendingPresetSpecs = common_vendor.ref(null);
    const normalizeName = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, "");
    const isColdOption = (option) => {
      if (!option)
        return false;
      if (common_utils_orderSpec.normalizeSpecCode(option.code) === "temp_cold")
        return true;
      return normalizeName(option.name).includes("冰");
    };
    const normalizeOption = (option, index) => ({
      id: (option == null ? void 0 : option.id) ?? `${(option == null ? void 0 : option.code) || "opt"}-${index}`,
      code: (option == null ? void 0 : option.code) || "",
      name: String((option == null ? void 0 : option.name) || "").trim()
    });
    const normalizeGroup = (group, index) => {
      const normalizedCode = common_utils_orderSpec.normalizeSpecCode(group == null ? void 0 : group.groupCode);
      return {
        id: (group == null ? void 0 : group.id) ?? null,
        groupName: String((group == null ? void 0 : group.groupName) || "规格").trim(),
        groupCode: (group == null ? void 0 : group.groupCode) || "",
        normalizedCode,
        groupKey: (group == null ? void 0 : group.id) ? `group-${group.id}` : `${normalizedCode || "group"}-${index}`,
        selectionType: common_utils_orderSpec.isAddonGroupCode(normalizedCode) ? "multi" : "single",
        options: (Array.isArray(group == null ? void 0 : group.options) ? group.options : []).map((option, optionIndex) => normalizeOption(option, optionIndex)).filter((option) => option.name)
      };
    };
    const sortGroups = (groups) => groups.slice().sort((left, right) => {
      const leftWeight = GROUP_ORDER[left.normalizedCode] ?? 100;
      const rightWeight = GROUP_ORDER[right.normalizedCode] ?? 100;
      if (leftWeight !== rightWeight)
        return leftWeight - rightWeight;
      return left.groupName.localeCompare(right.groupName);
    });
    const displayGroups = common_vendor.computed(() => specGroups.value);
    const tempGroup = common_vendor.computed(
      () => displayGroups.value.find((group) => group.normalizedCode === "temp") || null
    );
    const iceGroup = common_vendor.computed(
      () => displayGroups.value.find((group) => group.normalizedCode === "ice") || null
    );
    const getSelectedSingleOption = (group) => {
      if (!group)
        return null;
      const selectedId = selectedSingleMap.value[group.groupKey];
      return group.options.find((option) => option.id === selectedId) || null;
    };
    const getSelectedMultiOptions = (group) => {
      if (!group)
        return [];
      const selectedIds = selectedMultiMap.value[group.groupKey] || [];
      return group.options.filter((option) => selectedIds.includes(option.id));
    };
    const currentTempOption = common_vendor.computed(() => getSelectedSingleOption(tempGroup.value));
    const currentIceOption = common_vendor.computed(() => getSelectedSingleOption(iceGroup.value));
    const showIceGroup = common_vendor.computed(() => {
      if (!iceGroup.value)
        return false;
      if (!tempGroup.value)
        return true;
      return isColdOption(currentTempOption.value);
    });
    const selectedAddonNames = common_vendor.computed(() => {
      return displayGroups.value.filter((group) => group.selectionType === "multi").flatMap((group) => getSelectedMultiOptions(group).map((option) => option.name));
    });
    const resetSelections = () => {
      const nextSingleMap = {};
      const nextMultiMap = {};
      displayGroups.value.forEach((group) => {
        if (group.selectionType === "multi") {
          nextMultiMap[group.groupKey] = [];
          return;
        }
        if (group.normalizedCode === "ice") {
          nextSingleMap[group.groupKey] = null;
          return;
        }
        if (!group.options.length) {
          nextSingleMap[group.groupKey] = null;
          return;
        }
        if (group.normalizedCode === "temp") {
          const coldOption = group.options.find((option) => isColdOption(option));
          nextSingleMap[group.groupKey] = (coldOption || group.options[0]).id;
          return;
        }
        nextSingleMap[group.groupKey] = group.options[0].id;
      });
      selectedSingleMap.value = nextSingleMap;
      selectedMultiMap.value = nextMultiMap;
      syncIceSelection();
    };
    const syncIceSelection = () => {
      var _a;
      const group = iceGroup.value;
      if (!group)
        return;
      const nextSingleMap = { ...selectedSingleMap.value };
      if (!showIceGroup.value) {
        nextSingleMap[group.groupKey] = null;
      } else if (!nextSingleMap[group.groupKey]) {
        nextSingleMap[group.groupKey] = ((_a = group.options[0]) == null ? void 0 : _a.id) || null;
      }
      selectedSingleMap.value = nextSingleMap;
    };
    const isGroupVisible = (group) => group.normalizedCode !== "ice" || showIceGroup.value;
    const isOptionSelected = (group, option) => {
      if (group.selectionType === "multi") {
        return (selectedMultiMap.value[group.groupKey] || []).includes(option.id);
      }
      return selectedSingleMap.value[group.groupKey] === option.id;
    };
    const selectSingleOption = (group, option) => {
      selectedSingleMap.value = {
        ...selectedSingleMap.value,
        [group.groupKey]: option.id
      };
      if (group.normalizedCode === "temp") {
        syncIceSelection();
      }
    };
    const toggleMultiOption = (group, option) => {
      const currentIds = selectedMultiMap.value[group.groupKey] || [];
      const nextIds = currentIds.includes(option.id) ? currentIds.filter((id) => id !== option.id) : [...currentIds, option.id];
      selectedMultiMap.value = {
        ...selectedMultiMap.value,
        [group.groupKey]: nextIds
      };
    };
    const toggleOption = (group, option) => {
      if (!option)
        return;
      if (group.selectionType === "multi") {
        toggleMultiOption(group, option);
        return;
      }
      selectSingleOption(group, option);
    };
    const matchOptionByValue = (group, targetValue) => {
      if (!group || !targetValue)
        return null;
      const normalizedTarget = normalizeName(targetValue);
      return group.options.find((option) => normalizeName(option.name) === normalizedTarget) || group.options.find((option) => normalizeName(option.code) === normalizedTarget) || group.options.find((option) => normalizeName(option.name).includes(normalizedTarget)) || null;
    };
    const getPresetSelectionValue = (group, preset) => {
      var _a;
      if (!group || !preset)
        return "";
      switch (group.normalizedCode) {
        case "size":
          return preset.size;
        case "sweet":
          return preset.sweet;
        case "temp":
          if (preset.temp)
            return preset.temp;
          if (preset.ice && group.options.some((option) => isColdOption(option))) {
            return ((_a = group.options.find((option) => isColdOption(option))) == null ? void 0 : _a.name) || "";
          }
          return "";
        case "ice":
          return preset.ice;
        default: {
          const selection = preset.selections.find((item) => {
            if (item.groupId && group.id) {
              return String(item.groupId) === String(group.id);
            }
            return common_utils_orderSpec.normalizeSpecCode(item.groupCode) === group.normalizedCode;
          });
          return Array.isArray(selection == null ? void 0 : selection.value) ? selection.value[0] || "" : (selection == null ? void 0 : selection.value) || "";
        }
      }
    };
    const getPresetMultiValues = (group, preset) => {
      if (!group || !preset)
        return [];
      const values = [];
      if (common_utils_orderSpec.isAddonGroupCode(group.normalizedCode)) {
        values.push(...preset.addons);
      }
      const selection = preset.selections.find((item) => {
        if (item.groupId && group.id) {
          return String(item.groupId) === String(group.id);
        }
        return common_utils_orderSpec.normalizeSpecCode(item.groupCode) === group.normalizedCode;
      });
      if (selection) {
        values.push(...Array.isArray(selection.value) ? selection.value : [selection.value]);
      }
      return values.filter(Boolean);
    };
    const applyPresetSelections = (rawPreset) => {
      const preset = common_utils_orderSpec.normalizeOrderSpecs(rawPreset);
      if (!displayGroups.value.length)
        return;
      const nextSingleMap = { ...selectedSingleMap.value };
      displayGroups.value.forEach((group) => {
        if (group.selectionType === "multi" || group.normalizedCode === "ice")
          return;
        const matched = matchOptionByValue(group, getPresetSelectionValue(group, preset));
        if (matched) {
          nextSingleMap[group.groupKey] = matched.id;
        }
      });
      selectedSingleMap.value = nextSingleMap;
      syncIceSelection();
      if (iceGroup.value && showIceGroup.value) {
        const matchedIce = matchOptionByValue(iceGroup.value, getPresetSelectionValue(iceGroup.value, preset));
        if (matchedIce) {
          selectedSingleMap.value = {
            ...selectedSingleMap.value,
            [iceGroup.value.groupKey]: matchedIce.id
          };
        }
      }
      const nextMultiMap = { ...selectedMultiMap.value };
      displayGroups.value.forEach((group) => {
        if (group.selectionType !== "multi")
          return;
        const targetValues = getPresetMultiValues(group, preset);
        nextMultiMap[group.groupKey] = group.options.filter((option) => targetValues.some((value) => {
          var _a;
          return ((_a = matchOptionByValue(group, value)) == null ? void 0 : _a.id) === option.id;
        })).map((option) => option.id);
      });
      selectedMultiMap.value = nextMultiMap;
    };
    const fetchSpecs = async (productId) => {
      if (!productId)
        return;
      try {
        const data = await common_api_product.fetchProductSpecs(productId);
        specGroups.value = sortGroups(
          (data || []).map((group, index) => normalizeGroup(group, index)).filter((group) => group.options.length)
        );
        resetSelections();
        if (pendingPresetSpecs.value) {
          applyPresetSelections(pendingPresetSpecs.value);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/components/ProductDetailPopup.vue:351", "fetch specs error:", error);
        specGroups.value = [];
        selectedSingleMap.value = {};
        selectedMultiMap.value = {};
      }
    };
    const open = (product, presetSpecs = null) => {
      var _a;
      if (!product)
        return;
      selectedProd.id = product.id;
      selectedProd.name = product.name || "";
      selectedProd.price = product.price ?? 0;
      pendingPresetSpecs.value = presetSpecs ? common_utils_orderSpec.normalizeOrderSpecs(presetSpecs) : null;
      (_a = popupRef.value) == null ? void 0 : _a.open();
      fetchSpecs(product.id);
    };
    const close = () => {
      var _a;
      (_a = popupRef.value) == null ? void 0 : _a.close();
    };
    const buildSelections = () => {
      return displayGroups.value.filter((group) => isGroupVisible(group)).map((group) => {
        if (group.selectionType === "multi") {
          const values = getSelectedMultiOptions(group).map((option2) => option2.name);
          if (!values.length)
            return null;
          return {
            groupId: group.id,
            groupCode: group.normalizedCode,
            groupName: group.groupName,
            value: values
          };
        }
        const option = getSelectedSingleOption(group);
        if (!option)
          return null;
        return {
          groupId: group.id,
          groupCode: group.normalizedCode,
          groupName: group.groupName,
          value: option.name
        };
      }).filter(Boolean);
    };
    const getTemperatureText = () => {
      var _a;
      const temp = currentTempOption.value;
      if (!temp)
        return "";
      if (isColdOption(temp)) {
        return ((_a = currentIceOption.value) == null ? void 0 : _a.name) || temp.name;
      }
      return temp.name;
    };
    const addToCart = () => {
      const selections = buildSelections();
      const findSelectionValue = (code) => {
        const selection = selections.find((item) => item.groupCode === code);
        if (!selection)
          return "";
        return Array.isArray(selection.value) ? selection.value[0] || "" : selection.value;
      };
      emit("confirm", {
        id: selectedProd.id,
        specs: {
          size: findSelectionValue("size"),
          sweet: findSelectionValue("sweet"),
          temp: findSelectionValue("temp"),
          ice: getTemperatureText(),
          addons: selectedAddonNames.value,
          selections
        }
      });
      close();
    };
    __expose({ open, close });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(selectedProd.name),
        b: displayGroups.value.length === 0
      }, displayGroups.value.length === 0 ? {} : {}, {
        c: displayGroups.value.length > 0
      }, displayGroups.value.length > 0 ? {
        d: common_vendor.f(displayGroups.value, (group, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(group.groupName),
            b: group.selectionType === "multi"
          }, group.selectionType === "multi" ? {} : {}, {
            c: common_vendor.f(group.options, (opt, k1, i1) => {
              return {
                a: common_vendor.t(opt.name),
                b: `${group.groupKey}-${opt.id}`,
                c: common_vendor.n(isOptionSelected(group, opt) ? "active" : ""),
                d: common_vendor.o(($event) => toggleOption(group, opt), `${group.groupKey}-${opt.id}`)
              };
            }),
            d: group.groupKey,
            e: isGroupVisible(group)
          });
        })
      } : {}, {
        e: selectedAddonNames.value.length
      }, selectedAddonNames.value.length ? {
        f: common_vendor.t(selectedAddonNames.value.join(" / "))
      } : {}, {
        g: common_vendor.o(addToCart),
        h: common_vendor.sr(popupRef, "6255fdd0-0", {
          "k": "popupRef"
        }),
        i: common_vendor.o(close),
        j: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6255fdd0"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/order/components/ProductDetailPopup.js.map
