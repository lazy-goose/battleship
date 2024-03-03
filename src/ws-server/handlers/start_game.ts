import { store } from '../../store'
import type { Game } from '../../store/types.d'
import { MessageResponseType } from '../../utils/constants'
import { defineHandler } from '../../utils/defineHandler'
import { useCall } from '../../utils/useCall'
import turn from './turn'

export default defineHandler<unknown, Game>((params, game) => {
    const { sendTo } = params
    const { callWithData } = useCall(params)
    game.inGame = true
    game.players.forEach(({ userIndex, ships, inGameIndex }) => {
        // Clean up rooms
        store.rooms.forEach(({ indexRoom }) => {
            store.removeFromRoom(indexRoom, userIndex)
        })
        sendTo(userIndex)(MessageResponseType.StartGame, {
            ships,
            currentPlayerIndex: inGameIndex,
        })
    })
    callWithData(turn, game)
})
