import { WebSocket } from 'ws'
import { store } from '../../../store'
import { Game } from '../../../store/types'
import {
    BOARD_SIZE,
    MessageResponseType,
    WS_PORT,
} from '../../../utils/constants'
import { defineHandler } from '../../../utils/defineHandler'
import { parseMessage } from '../../messageParser'
import type { MessageHandlerParams } from '../../types.d'
import add_ships from '../add_ships'
import attack from '../attack'
import create_game from '../create_game'
import generateShips from './generateShips'

const message = <D>(params: MessageHandlerParams<unknown>, data: D) => {
    return {
        ...params,
        message: {
            ...params.message,
            data,
        },
    }
}

export default defineHandler((userParams) => {
    const { sessionId: humanUserIndex } = userParams

    const botIndex = crypto.randomUUID()
    const botParams = { ...userParams, sessionId: botIndex }

    const ws = new WebSocket(`ws://localhost:${WS_PORT}?bot_id=${botIndex}`)

    const human = store.users.find((u) => u.index === humanUserIndex)

    if (!human) return

    const bot = store.registerUser({
        index: botIndex,
        name: `Bot + ${human.name}`,
        password: '@robokot',
    })

    const room = store.createRoom(humanUserIndex)
    store.addToRoom(room.indexRoom, bot.index)

    const game = create_game(userParams, room.indexRoom) as unknown as Game

    // Add ships
    const botPlayer = game.players.find((p) => p.userIndex === botIndex)!
    add_ships(
        message(botParams, {
            gameId: game.gameId,
            ships: generateShips(),
            indexPlayer: botPlayer.inGameIndex,
        }),
        null,
    )

    // An advantage for a pathetic man
    const humanPlayer = game.players.find(
        (p) => p.inGameIndex !== botPlayer.inGameIndex,
    )!
    game.turnUserIndex = humanPlayer.inGameIndex

    ws.on('message', async (buffer) => {
        const { parsed } = parseMessage(buffer.toString())
        const { type } = parsed!

        let index = 0

        switch (type) {
            case MessageResponseType.Turn: {
                while (game.turnUserIndex === botPlayer.inGameIndex) {
                    const x = index % BOARD_SIZE
                    const y = Math.floor(index / BOARD_SIZE)
                    if (index > BOARD_SIZE ** 2) break
                    attack(
                        message(botParams, {
                            gameId: game.gameId,
                            x,
                            y,
                            indexPlayer: botPlayer.inGameIndex,
                        }),
                        null,
                    )
                    index++
                }
                return
            }
            case MessageResponseType.Finish:
                store.rooms.splice(
                    store.rooms.findIndex(
                        (r) => r.indexRoom === room.indexRoom,
                    ),
                    1,
                )
                store.users.splice(
                    store.users.findIndex((u) => u.index === botIndex),
                    1,
                )
                ws.once('close', () => {
                    const bi = store.users.findIndex(
                        (u) => u.index === botIndex,
                    )
                    if (bi === -1) return
                    store.users.splice(bi, 1)
                })
                ws.close()
                return
            default:
                return
        }
    })
})
