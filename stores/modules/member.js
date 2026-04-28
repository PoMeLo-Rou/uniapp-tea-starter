import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMemberStore = defineStore(
	'member',
	() => {
		// 本地兜底白名单：后端未返回管理员字段时，可临时按 userId 放行
		// 示例：const ADMIN_USER_ID_WHITELIST = [1, 10001]
		const ADMIN_USER_ID_WHITELIST = []

		const userId = ref(null)
		const username = ref('')
		const nickname = ref('')
		const avatar = ref('')
		const phone = ref('')
		const points = ref(0)
		const coupons = ref(0)
		const balance = ref(0)
		const role = ref('')
		const roles = ref([])
		const permissions = ref([])

		const isLoggedIn = computed(() => !!userId.value)
		const isAdmin = computed(() => {
			if (!userId.value) return false
			if (ADMIN_USER_ID_WHITELIST.includes(Number(userId.value))) return true
			if (role.value === 'admin') return true
			if (Array.isArray(roles.value) && roles.value.includes('admin')) return true
			if (
				Array.isArray(permissions.value) &&
				(permissions.value.includes('product:manage') || permissions.value.includes('admin:*'))
			) {
				return true
			}
			return false
		})

		function setUserInfo(data) {
			userId.value = data.userId || data.id || null
			username.value = data.username || data.account || ''
			nickname.value = data.nickname || data.nickName || username.value || ''
			avatar.value = data.avatar || ''
			phone.value = data.phone || ''
			points.value = Number(data.points || 0)
			coupons.value = Number(data.coupons || 0)
			balance.value = Number(data.balance || 0)
			
			// 后端返回什么就用什么，确保完全覆盖旧值
			const isAdminFlag = data.isAdmin === true || Number(data.isAdmin) === 1
			if (data.role) {
				// 后端明确返回了 role，必须使用它
				role.value = String(data.role).toLowerCase()
			} else if (isAdminFlag) {
				// 没有 role，但有 isAdmin 标志，则设为 admin
				role.value = 'admin'
			} else {
				// 普通用户，明确清空 role
				role.value = 'user'
			}
			
			// 完全覆盖 roles 数组，不允许残留旧值
			roles.value = Array.isArray(data.roles)
				? data.roles.map((item) => String(item).toLowerCase())
				: []
			
			// 完全覆盖 permissions 数组，不允许残留旧值
			permissions.value = Array.isArray(data.permissions)
				? data.permissions.map((item) => String(item))
				: []
		}

		function clearUserInfo() {
			userId.value = null
			username.value = ''
			nickname.value = ''
			avatar.value = ''
			phone.value = ''
			points.value = 0
			coupons.value = 0
			balance.value = 0
			role.value = ''
			roles.value = []
			permissions.value = []
		}

		return {
			userId,
			username,
			nickname,
			avatar,
			phone,
			points,
			coupons,
			balance,
			role,
			roles,
			permissions,
			isLoggedIn,
			isAdmin,
			setUserInfo,
			clearUserInfo,
		}
	},
	{    // 指定小程序兼容的存储方式
		persist: {
            key: 'member',
            storage: {
                getItem: (key) => uni.getStorageSync(key),
                setItem: (key, value) => uni.setStorageSync(key, value),
            },
		}, 
	},
)
