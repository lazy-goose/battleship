import { store } from '../../store'
import type { Game } from '../../store/types.d'
import { MessageResponseType } from '../../utils/constants'
import { defineHandler } from '../../utils/defineHandler'
import { useCall } from '../../utils/useCall'
import update_winners from './update_winners'

export default defineHandler<unknown, Game>((params, game) => {
    const { sendTo } = params
    const { call } = useCall(params)
    const winGame = store.winGame(game.gameId)
    if (!winGame) {
        return
    }
    const winner = winGame.players.find(
        (p) => p.inGameIndex === winGame.turnUserIndex,
    )
    if (!winner) {
        return
    }
    game.players.forEach(({ userIndex }) => {
        sendTo(userIndex)(MessageResponseType.Finish, {
            winPlayer: winner.inGameIndex,
        })
    })
    store.incrementWin(winner.userIndex)
    call(update_winners)
})
