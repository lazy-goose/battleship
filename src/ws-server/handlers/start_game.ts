import { Game } from '../../store/types'
import { MessageResponseType } from '../../utils/constants'
import { defineHandler } from '../../utils/defineHandler'
import { useCall } from '../../utils/useCall'
import turn from './turn'

export default defineHandler<unknown, Game>((params, game) => {
    const { sendTo } = params
    const { callWithData } = useCall(params)
    game.players.forEach(({ userIndex, ships, inGameIndex }) => {
        sendTo(userIndex)(MessageResponseType.StartGame, {
            ships,
            currentPlayerIndex: inGameIndex,
        })
    })
    callWithData(turn, game)
})
