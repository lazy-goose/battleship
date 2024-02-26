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

export default defineHandler((params) => {
    const { sessionId: userIndex } = params

    // Skip: register bot
    const botIndex = crypto.randomUUID()
    const bot = store.registerUser({
        index: botIndex,
        name: 'Bot',
        password: '@robokot',
    })

    // Skip: create room
    const room = store.createRoom(userIndex)
    store.addToRoom(room.indexRoom, bot.index)

    // Create game
    const game = create_game(params, room.indexRoom) as unknown as Game

    // Add ships
    const botPlayer = game.players.find((p) => p.userIndex === botIndex)!
    add_ships(
        message(params, {
            gameId: game.gameId,
            ships: generateShips(),
            indexPlayer: botPlayer.inGameIndex,
        }),
        null,
    )

    // An advantage for a pathetic man
    const humus = game.players.find(
        (p) => p.inGameIndex !== botPlayer.inGameIndex,
    )!
    game.turnUserIndex = humus.inGameIndex

    // Listen ws events
    const ws = new WebSocket(`ws://localhost:${WS_PORT}`)

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
                        message(params, {
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
                ws.close()
                return
            default:
                return
        }
    })
})
