import { store } from '../../store'
import { defineHandler } from '../../utils/defineHandler'

export default defineHandler<''>((params) => {
    const { sessionId: userIndex } = params
    store.createRoom(userIndex)
})
