import { store } from '../../store'
import { MessageResponseType } from '../../utils/constants'
import { defineHandler } from '../../utils/defineHandler'
import { useCall } from '../../utils/useCall'
import type { MessageHandlerParams } from '../types.d'
import attack from './attack'

export default defineHandler<{
    gameId: string
    indexPlayer: string
}>((params) => {
    const { message, send } = params
    const { gameId, indexPlayer } = message.data

    const game = store.games.find((g) => g.gameId === gameId)
    if (!game) {
        send(MessageResponseType.MessageFailed, {
            error: `Skip the randomAttack, no game with id: ${gameId}`,
        })
        return
    }

    const enemy = game.players.find((p) => p.inGameIndex !== indexPlayer)!

    const availableCoords: number[][] = []
    enemy.board.forEach((row, x) => {
        row.forEach((cell, y) => {
            if (cell !== -1) {
                availableCoords.push([x, y])
            }
        })
    })

    const randomAvailableCoord =
        availableCoords[Math.random() * availableCoords.length]

    const attackParams = {
        ...params,
        message: {
            ...params.message,
            type: MessageResponseType.Attack,
            data: {
                gameId,
                indexPlayer,
                x: randomAvailableCoord[0],
                y: randomAvailableCoord[1],
            },
        },
    } satisfies MessageHandlerParams<{
        gameId: string
        x: number
        y: number
        indexPlayer: string
    }>

    const { call } = useCall(attackParams)
    call(attack)
})
