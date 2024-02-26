import { store } from '../../store'
import { defineHandler } from '../../utils/defineHandler'

export default defineHandler((params) => {
    const { sessionId: userIndex } = params
    return store.createRoom(userIndex)
})
