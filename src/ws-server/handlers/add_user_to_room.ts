import { store } from '../../store'
import { defineHandler } from '../../utils/defineHandler'
import { useCall } from '../../utils/useCall'
import create_game from './create_game'

export default defineHandler<{ indexRoom: string }>((params) => {
    const { message, sessionId: userIndex } = params
    const { indexRoom } = message.data
    const { callWithData } = useCall(params)
    const wasAdded = store.addToRoom(indexRoom, userIndex)
    if (wasAdded) {
        callWithData(create_game, indexRoom)
    }
})
