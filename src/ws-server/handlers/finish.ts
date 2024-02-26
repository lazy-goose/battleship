import { store } from '../../store'
import type { Game } from '../../store/types.d'
import { MessageResponseType } from '../../utils/constants'
import { defineHandler } from '../../utils/defineHandler'
import { useCall } from '../../utils/useCall'
import update_winners from './update_winners'

export default defineHandler<unknown, Game>((params, _game) => {
    const { sendTo } = params
    const { call } = useCall(params)
    const game = store.removeGame(_game.gameId)
    if (!game) {
        return
    }
    const room = store.rooms.find((r) => r.host === params._.ws.sessionId)
    if (room) {
        store.removeRoom(room.indexRoom)
    }
    const winner = game.players.find(
        (p) => p.inGameIndex === game.turnUserIndex,
    )
    if (!winner) {
        return
    }
    store.incrementWin(winner.userIndex)
    game.players.forEach(({ userIndex }) => {
        sendTo(userIndex)(MessageResponseType.Finish, {
            winPlayer: winner.inGameIndex,
        })
    })
    call(update_winners)
})
