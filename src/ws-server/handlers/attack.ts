import { store } from '../../store'
import { MessageResponseType } from '../../utils/constants'
import { defineHandler } from '../../utils/defineHandler'
import { useCall } from '../../utils/useCall'
import finish from './finish'
import turn from './turn'

export default defineHandler<{
    gameId: string
    x: number
    y: number
    indexPlayer: string
}>((params) => {
    const { message, send, sendTo } = params
    const { gameId, x, y, indexPlayer } = message.data
    const { callWithData } = useCall(params)

    const game = store.games.find((g) => g.gameId === gameId)
    if (!game) {
        send(MessageResponseType.MessageFailed, {
            error: `Skip the attack, no game with id: ${gameId}`,
        })
        return
    }

    if (indexPlayer !== game.turnUserIndex) {
        return
    }

    const response = store.attack(gameId)(indexPlayer, { x, y })
    if (!response) {
        send(MessageResponseType.MessageFailed, {
            error: `Skip the attack, check gameId '${gameId}' or indexPlayer '${indexPlayer}'`,
        })
        return
    }

    // Check for a win

    const enemy = game.players.find((p) => p.inGameIndex !== indexPlayer)!

    if (!enemy.board.flat().some((c) => c > 0)) {
        callWithData(finish, game)
        return
    }

    // Update hits

    const { type, hits } = response
    game.players.forEach(({ userIndex }) => {
        hits.forEach(({ x, y }) => {
            sendTo(userIndex)(MessageResponseType.Attack, {
                position: { x, y },
                currentPlayer: game.turnUserIndex,
                type,
            })
        })
    })

    // Turn

    if (type === 'miss') {
        store.turn(gameId)
    }

    callWithData(turn, game)
})
