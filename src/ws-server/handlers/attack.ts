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

    const enemy = game.players.find((p) => p.inGameIndex !== indexPlayer)!

    const status = store.getStatusOfCell(gameId)(indexPlayer, { x, y })

    if (status !== 'hide') {
        callWithData(turn, game)
        return
    }

    const hits = store.attack(gameId)(indexPlayer, { x, y })

    if (!hits || !status) {
        send(MessageResponseType.MessageFailed, {
            error: `Skip the attack, check gameId '${gameId}' or indexPlayer '${indexPlayer}'`,
        })
        return
    }

    // Check for a win

    if (!enemy.board.flat().some((c) => c > 0)) {
        callWithData(finish, game)
        return
    }

    // Update hits

    hits.forEach(({ status, pos: { x, y } }) => {
        game.players.forEach(({ userIndex }) => {
            sendTo(userIndex)(MessageResponseType.Attack, {
                currentPlayer: game.turnUserIndex,
                position: { x, y },
                status,
            })
        })
    })

    // Turn

    if (hits.length === 1 && hits[0].status === 'miss') {
        store.turn(gameId)
    }

    callWithData(turn, game)
})
