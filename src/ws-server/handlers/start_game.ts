import { Game } from '../../store/types'
import { MessageResponseType } from '../../utils/constants'
import { defineHandler } from '../../utils/defineHandler'

export default defineHandler<unknown, Game>((params, game) => {
    const { sendTo } = params
    game.players.forEach(({ userIndex, ships, inGameIndex }) => {
        sendTo(userIndex)(MessageResponseType.StartGame, {
            ships,
            currentPlayerIndex: inGameIndex,
        })
    })
})
