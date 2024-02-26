import { store } from '../../store'
import { MessageResponseType } from '../../utils/constants'
import { defineHandler } from '../../utils/defineHandler'

export default defineHandler((params) => {
    const { sendAll } = params
    const availableRooms = store.rooms
        .filter((r) => r.filled === false)
        .map((r) => {
            const host = store.users.find((u) => u.index === r.host)!
            return {
                roomId: r.indexRoom,
                roomUsers: [host],
            }
        })
    sendAll(MessageResponseType.UpdateRoom, availableRooms)
})
