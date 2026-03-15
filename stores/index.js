import { createPinia } from 'pinia'
import { createPersistedState } from './persist'

const pinia = createPinia()
pinia.use(createPersistedState())

export default pinia
