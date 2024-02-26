import type { Game } from '../../store/types.d'
import { MessageResponseType } from '../../utils/constants'
import { defineHandler } from '../../utils/defineHandler'

export default defineHandler<unknown, Game>((params, game) => {
    const { sendAll } = params
    sendAll(MessageResponseType.Turn, {
        currentPlayer: game.turnUserIndex,
    })
})
