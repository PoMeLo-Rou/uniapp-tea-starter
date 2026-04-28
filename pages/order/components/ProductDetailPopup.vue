<template>
	<view class="product-detail-popup-root">
		<uni-popup ref="popupRef" type="bottom" background-color="#fff" @maskClick="close">
			<view class="spec-container">
				<view class="spec-header">
					<text class="spec-title">{{ selectedProd.name }}</text>
				</view>

				<view v-if="displayGroups.length === 0" class="empty-spec-tip">
					<text>当前商品没有绑定规格，确认后会直接加入购物车</text>
				</view>

				<view
					v-for="group in displayGroups"
					v-if="displayGroups.length > 0"
					:key="group.groupKey"
					v-show="isGroupVisible(group)"
					class="spec-group"
				>
					<view class="group-head">
						<text class="label">{{ group.groupName }}</text>
						<text v-if="group.selectionType === 'multi'" class="group-tip">可多选</text>
					</view>
					<view class="tags">
						<view
							v-for="opt in group.options"
							:key="`${group.groupKey}-${opt.id}`"
							:class="['spec-tag', isOptionSelected(group, opt) ? 'active' : '']"
							@click="toggleOption(group, opt)"
						>
							<text>{{ opt.name }}</text>
						</view>
					</view>
				</view>

				<view v-if="selectedAddonNames.length" class="selected-summary">
					<text class="summary-label">已选小料</text>
					<text class="summary-value">{{ selectedAddonNames.join(' / ') }}</text>
				</view>

				<button class="confirm-btn" @click="addToCart">加入购物车</button>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { fetchProductSpecs } from '@/common/api/product.js';
import {
	isAddonGroupCode,
	normalizeOrderSpecs,
	normalizeSpecCode,
} from '@/common/utils/order-spec.js';

const emit = defineEmits(['confirm']);

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
	extras: 60,
};

const popupRef = ref(null);
const selectedProd = reactive({ id: null, name: '', price: 0 });
const specGroups = ref([]);
const selectedSingleMap = ref({});
const selectedMultiMap = ref({});
const pendingPresetSpecs = ref(null);

const normalizeName = (value) =>
	String(value || '')
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '');

const isColdOption = (option) => {
	if (!option) return false;
	if (normalizeSpecCode(option.code) === 'temp_cold') return true;
	return normalizeName(option.name).includes('冰');
};

const normalizeOption = (option, index) => ({
	id: option?.id ?? `${option?.code || 'opt'}-${index}`,
	code: option?.code || '',
	name: String(option?.name || '').trim(),
});

const normalizeGroup = (group, index) => {
	const normalizedCode = normalizeSpecCode(group?.groupCode);
	return {
		id: group?.id ?? null,
		groupName: String(group?.groupName || '规格').trim(),
		groupCode: group?.groupCode || '',
		normalizedCode,
		groupKey: group?.id ? `group-${group.id}` : `${normalizedCode || 'group'}-${index}`,
		selectionType: isAddonGroupCode(normalizedCode) ? 'multi' : 'single',
		options: (Array.isArray(group?.options) ? group.options : [])
			.map((option, optionIndex) => normalizeOption(option, optionIndex))
			.filter((option) => option.name),
	};
};

const sortGroups = (groups) =>
	groups.slice().sort((left, right) => {
		const leftWeight = GROUP_ORDER[left.normalizedCode] ?? 100;
		const rightWeight = GROUP_ORDER[right.normalizedCode] ?? 100;
		if (leftWeight !== rightWeight) return leftWeight - rightWeight;
		return left.groupName.localeCompare(right.groupName);
	});

const displayGroups = computed(() => specGroups.value);
const tempGroup = computed(() =>
	displayGroups.value.find((group) => group.normalizedCode === 'temp') || null,
);
const iceGroup = computed(() =>
	displayGroups.value.find((group) => group.normalizedCode === 'ice') || null,
);

const getSelectedSingleOption = (group) => {
	if (!group) return null;
	const selectedId = selectedSingleMap.value[group.groupKey];
	return group.options.find((option) => option.id === selectedId) || null;
};

const getSelectedMultiOptions = (group) => {
	if (!group) return [];
	const selectedIds = selectedMultiMap.value[group.groupKey] || [];
	return group.options.filter((option) => selectedIds.includes(option.id));
};

const currentTempOption = computed(() => getSelectedSingleOption(tempGroup.value));
const currentIceOption = computed(() => getSelectedSingleOption(iceGroup.value));
const showIceGroup = computed(() => {
	if (!iceGroup.value) return false;
	if (!tempGroup.value) return true;
	return isColdOption(currentTempOption.value);
});

const selectedAddonNames = computed(() => {
	return displayGroups.value
		.filter((group) => group.selectionType === 'multi')
		.flatMap((group) => getSelectedMultiOptions(group).map((option) => option.name));
});

const resetSelections = () => {
	const nextSingleMap = {};
	const nextMultiMap = {};

	displayGroups.value.forEach((group) => {
		if (group.selectionType === 'multi') {
			nextMultiMap[group.groupKey] = [];
			return;
		}

		if (group.normalizedCode === 'ice') {
			nextSingleMap[group.groupKey] = null;
			return;
		}

		if (!group.options.length) {
			nextSingleMap[group.groupKey] = null;
			return;
		}

		if (group.normalizedCode === 'temp') {
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
	const group = iceGroup.value;
	if (!group) return;

	const nextSingleMap = { ...selectedSingleMap.value };
	if (!showIceGroup.value) {
		nextSingleMap[group.groupKey] = null;
	} else if (!nextSingleMap[group.groupKey]) {
		nextSingleMap[group.groupKey] = group.options[0]?.id || null;
	}
	selectedSingleMap.value = nextSingleMap;
};

const isGroupVisible = (group) => group.normalizedCode !== 'ice' || showIceGroup.value;

const isOptionSelected = (group, option) => {
	if (group.selectionType === 'multi') {
		return (selectedMultiMap.value[group.groupKey] || []).includes(option.id);
	}
	return selectedSingleMap.value[group.groupKey] === option.id;
};

const selectSingleOption = (group, option) => {
	selectedSingleMap.value = {
		...selectedSingleMap.value,
		[group.groupKey]: option.id,
	};

	if (group.normalizedCode === 'temp') {
		syncIceSelection();
	}
};

const toggleMultiOption = (group, option) => {
	const currentIds = selectedMultiMap.value[group.groupKey] || [];
	const nextIds = currentIds.includes(option.id)
		? currentIds.filter((id) => id !== option.id)
		: [...currentIds, option.id];

	selectedMultiMap.value = {
		...selectedMultiMap.value,
		[group.groupKey]: nextIds,
	};
};

const toggleOption = (group, option) => {
	if (!option) return;
	if (group.selectionType === 'multi') {
		toggleMultiOption(group, option);
		return;
	}
	selectSingleOption(group, option);
};

const matchOptionByValue = (group, targetValue) => {
	if (!group || !targetValue) return null;
	const normalizedTarget = normalizeName(targetValue);
	return (
		group.options.find((option) => normalizeName(option.name) === normalizedTarget) ||
		group.options.find((option) => normalizeName(option.code) === normalizedTarget) ||
		group.options.find((option) => normalizeName(option.name).includes(normalizedTarget)) ||
		null
	);
};

const getPresetSelectionValue = (group, preset) => {
	if (!group || !preset) return '';

	switch (group.normalizedCode) {
		case 'size':
			return preset.size;
		case 'sweet':
			return preset.sweet;
		case 'temp':
			if (preset.temp) return preset.temp;
			if (preset.ice && group.options.some((option) => isColdOption(option))) {
				return group.options.find((option) => isColdOption(option))?.name || '';
			}
			return '';
		case 'ice':
			return preset.ice;
		default: {
			const selection = preset.selections.find((item) => {
				if (item.groupId && group.id) {
					return String(item.groupId) === String(group.id);
				}
				return normalizeSpecCode(item.groupCode) === group.normalizedCode;
			});
			return Array.isArray(selection?.value) ? selection.value[0] || '' : selection?.value || '';
		}
	}
};

const getPresetMultiValues = (group, preset) => {
	if (!group || !preset) return [];
	const values = [];

	if (isAddonGroupCode(group.normalizedCode)) {
		values.push(...preset.addons);
	}

	const selection = preset.selections.find((item) => {
		if (item.groupId && group.id) {
			return String(item.groupId) === String(group.id);
		}
		return normalizeSpecCode(item.groupCode) === group.normalizedCode;
	});
	if (selection) {
		values.push(...(Array.isArray(selection.value) ? selection.value : [selection.value]));
	}

	return values.filter(Boolean);
};

const applyPresetSelections = (rawPreset) => {
	const preset = normalizeOrderSpecs(rawPreset);
	if (!displayGroups.value.length) return;

	const nextSingleMap = { ...selectedSingleMap.value };
	displayGroups.value.forEach((group) => {
		if (group.selectionType === 'multi' || group.normalizedCode === 'ice') return;
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
				[iceGroup.value.groupKey]: matchedIce.id,
			};
		}
	}

	const nextMultiMap = { ...selectedMultiMap.value };
	displayGroups.value.forEach((group) => {
		if (group.selectionType !== 'multi') return;
		const targetValues = getPresetMultiValues(group, preset);
		nextMultiMap[group.groupKey] = group.options
			.filter((option) => targetValues.some((value) => matchOptionByValue(group, value)?.id === option.id))
			.map((option) => option.id);
	});
	selectedMultiMap.value = nextMultiMap;
};

const fetchSpecs = async (productId) => {
	if (!productId) return;
	try {
		const data = await fetchProductSpecs(productId);
		specGroups.value = sortGroups(
			(data || [])
				.map((group, index) => normalizeGroup(group, index))
				.filter((group) => group.options.length),
		);
		resetSelections();
		if (pendingPresetSpecs.value) {
			applyPresetSelections(pendingPresetSpecs.value);
		}
	} catch (error) {
		console.error('fetch specs error:', error);
		specGroups.value = [];
		selectedSingleMap.value = {};
		selectedMultiMap.value = {};
	}
};

const open = (product, presetSpecs = null) => {
	if (!product) return;
	selectedProd.id = product.id;
	selectedProd.name = product.name || '';
	selectedProd.price = product.price ?? 0;
	pendingPresetSpecs.value = presetSpecs ? normalizeOrderSpecs(presetSpecs) : null;
	popupRef.value?.open();
	fetchSpecs(product.id);
};

const close = () => {
	popupRef.value?.close();
};

const buildSelections = () => {
	return displayGroups.value
		.filter((group) => isGroupVisible(group))
		.map((group) => {
			if (group.selectionType === 'multi') {
				const values = getSelectedMultiOptions(group).map((option) => option.name);
				if (!values.length) return null;
				return {
					groupId: group.id,
					groupCode: group.normalizedCode,
					groupName: group.groupName,
					value: values,
				};
			}

			const option = getSelectedSingleOption(group);
			if (!option) return null;
			return {
				groupId: group.id,
				groupCode: group.normalizedCode,
				groupName: group.groupName,
				value: option.name,
			};
		})
		.filter(Boolean);
};

const getTemperatureText = () => {
	const temp = currentTempOption.value;
	if (!temp) return '';
	if (isColdOption(temp)) {
		return currentIceOption.value?.name || temp.name;
	}
	return temp.name;
};

const addToCart = () => {
	const selections = buildSelections();
	const findSelectionValue = (code) => {
		const selection = selections.find((item) => item.groupCode === code);
		if (!selection) return '';
		return Array.isArray(selection.value) ? selection.value[0] || '' : selection.value;
	};

	emit('confirm', {
		id: selectedProd.id,
		specs: {
			size: findSelectionValue('size'),
			sweet: findSelectionValue('sweet'),
			temp: findSelectionValue('temp'),
			ice: getTemperatureText(),
			addons: selectedAddonNames.value,
			selections,
		},
	});
	close();
};

defineExpose({ open, close });
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.product-detail-popup-root {
	position: relative;
	z-index: 10001;
}

:deep(.uni-popup) {
	z-index: 10001 !important;
}

.spec-container {
	box-sizing: border-box;
	width: 100%;
	padding: 30rpx;
	padding-bottom: calc(30rpx + constant(safe-area-inset-bottom));
	padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
}

.spec-header {
	margin-bottom: 30rpx;

	.spec-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}
}

.empty-spec-tip {
	padding: 20rpx 24rpx;
	border-radius: 16rpx;
	background: #f8fafc;
	color: #6b7280;
	font-size: 24rpx;
	line-height: 1.6;
}

.spec-group {
	margin-top: 30rpx;
}

.group-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.label {
	font-size: 28rpx;
	color: #666;
}

.group-tip {
	font-size: 22rpx;
	color: $uni-color-primary;
}

.tags {
	display: flex;
	flex-wrap: wrap;
	width: 100%;
	min-height: 80rpx;
}

.spec-tag {
	margin-right: 16rpx;
	margin-bottom: 16rpx;
	padding: 12rpx 24rpx;
	min-height: 56rpx;
	font-size: 26rpx;
	color: #666;
	background: #f5f5f5;
	border-radius: 8rpx;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: center;
}

.spec-tag text {
	font-size: 26rpx;
	color: inherit;
}

.spec-tag.active {
	background: $uni-color-primary;
	color: #fff;
}

.spec-tag.active text {
	color: #fff;
}

.selected-summary {
	margin-top: 12rpx;
	padding: 20rpx 24rpx;
	border-radius: 16rpx;
	background: rgba($uni-color-primary, 0.08);
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.summary-label {
	font-size: 24rpx;
	color: $uni-color-primary;
}

.summary-value {
	font-size: 26rpx;
	color: #374151;
	line-height: 1.6;
}

.confirm-btn {
	display: block;
	margin-top: 40rpx;
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	background: $uni-color-primary;
	color: #fff;
	font-size: 30rpx;
	border-radius: 44rpx;
	border: none;
}

.confirm-btn::after {
	border: none;
}
</style>
