const ADDON_GROUP_CODES = ['addon', 'addons', 'topping', 'toppings', 'extra', 'extras'];
const DISPLAYED_BASE_CODES = new Set(['size', 'sweet', 'temp', 'ice', ...ADDON_GROUP_CODES]);

export const normalizeSpecCode = (value) => String(value || '').trim().toLowerCase();

const normalizeText = (value) => String(value || '').trim();

const normalizeList = (list) =>
	(Array.isArray(list) ? list : [])
		.map((item) => normalizeText(item))
		.filter(Boolean);

export const isAddonGroupCode = (groupCode) => ADDON_GROUP_CODES.includes(normalizeSpecCode(groupCode));

export const normalizeOrderSpecs = (specs = {}) => {
	const selections = (Array.isArray(specs.selections) ? specs.selections : [])
		.map((item) => {
			const rawValue = item?.value;
			const value = Array.isArray(rawValue) ? normalizeList(rawValue) : normalizeText(rawValue);
			if (!value || (Array.isArray(value) && !value.length)) return null;
			return {
				groupId: item?.groupId ?? null,
				groupCode: normalizeSpecCode(item?.groupCode),
				groupName: normalizeText(item?.groupName),
				value,
			};
		})
		.filter(Boolean);

	return {
		size: normalizeText(specs.size),
		sweet: normalizeText(specs.sweet),
		temp: normalizeText(specs.temp),
		ice: normalizeText(specs.ice),
		addons: normalizeList(specs.addons),
		selections,
	};
};

const getSelectionIdentity = (selection) =>
	normalizeText(selection?.groupId ?? selection?.groupCode ?? selection?.groupName);

export const formatSpecText = (specs = {}) => {
	const normalized = normalizeOrderSpecs(specs);
	const parts = [];

	if (normalized.size) parts.push(normalized.size);
	if (normalized.sweet) parts.push(normalized.sweet);
	if (normalized.ice) parts.push(normalized.ice);
	normalized.addons.forEach((name) => parts.push(name));

	normalized.selections.forEach((selection) => {
		const code = normalizeSpecCode(selection.groupCode);
		if (DISPLAYED_BASE_CODES.has(code)) return;
		if (Array.isArray(selection.value)) {
			selection.value.forEach((value) => parts.push(value));
			return;
		}
		parts.push(selection.value);
	});

	return parts.filter(Boolean).join(' / ');
};

export const buildCartKey = (productId, specs = {}) => {
	const normalized = normalizeOrderSpecs(specs);
	const selectionParts = normalized.selections
		.map((selection) => {
			const identity = getSelectionIdentity(selection);
			const value = Array.isArray(selection.value)
				? selection.value.slice().sort().join('+')
				: normalizeText(selection.value);
			return `${identity}:${value}`;
		})
		.filter(Boolean)
		.sort();

	return [
		String(productId ?? ''),
		normalized.size,
		normalized.sweet,
		normalized.temp,
		normalized.ice,
		normalized.addons.slice().sort().join('+'),
		...selectionParts,
	].join('__');
};
