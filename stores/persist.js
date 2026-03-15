/**
 * Pinia 持久化插件 —— 基于 uni.getStorageSync / uni.setStorageSync
 * 在 defineStore 的 persist 选项中配置 key 即可开启持久化
 */
export const createPersistedState = () => {
	return ({ store }) => {
		const persistOption = store.$options?.persist
		if (!persistOption) return

		const key = typeof persistOption === 'object' ? persistOption.key : store.$id

		// 启动时从本地缓存恢复
		try {
			const saved = uni.getStorageSync(key)
			if (saved) {
				store.$patch(saved)
			}
		} catch (e) {}

		// 状态变更时自动写入缓存
		store.$subscribe((_mutation, state) => {
			try {
				uni.setStorageSync(key, JSON.parse(JSON.stringify(state)))
			} catch (e) {}
		})
	}
}
