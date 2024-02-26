import url from 'url'
import { WebSocketServer, type Server, type WebSocket } from 'ws'
import { store } from '../store'
import { MessageRequestType, MessageResponseType } from '../utils/constants'
import { useCall } from '../utils/useCall'
import add_ships from './handlers/add_ships'
import add_user_to_room from './handlers/add_user_to_room'
import attack from './handlers/attack'
import create_room from './handlers/create_room'
import randomAttack from './handlers/randomAttack'
import reg from './handlers/reg'
import single_play from './handlers/single_play/single_play'
import update_room from './handlers/update_room'
import update_winners from './handlers/update_winners'
import { parseMessage, stringifyMessage } from './messageParser'
import type { MessageHandlerParams } from './types.d'

const log = (msg: string) => console.log(`\x1b[36m${msg}\x1b[0m`)

const handleMessageEvent = (params: MessageHandlerParams) => {
    const {
        message: { type },
    } = params
    const { call } = useCall(params)
    switch (type) {
        case MessageRequestType.Registration:
            call(reg)
            call(update_winners)
            call(update_room)
            return
        case MessageRequestType.CreateRoom:
            call(create_room)
            call(update_room)
            return
        case MessageRequestType.AddUserToRoom:
            call(add_user_to_room)
            call(update_room)
            return
        case MessageRequestType.AddShips:
            call(add_ships)
            return
        case MessageRequestType.Attack:
            call(attack)
            return
        case MessageRequestType.RandomAttack:
            call(randomAttack)
            return
        case MessageRequestType.SinglePlay:
            call(single_play)
            return
        default:
            console.log(type)
            return
    }
}

export const wsServer = {
    listen: (port: number, onServerStart?: (ws: Server) => void) => {
        const wsServer = new WebSocketServer({ port })

        if (onServerStart) {
            onServerStart(wsServer)
        }

        wsServer.on('connection', (ws: WebSocket, req) => {
            const parsedUrl = url.parse(req.url as string, true)
            const bot_id = parsedUrl.query.bot_id
            const sessionId =
                typeof bot_id === 'string'
                    ? bot_id
                    : req.headers['sec-websocket-key'] || crypto.randomUUID()

            ws.sessionId = sessionId

            log(`Socket '${ws.sessionId}' was established`)

            const send: MessageHandlerParams['send'] = (type, data) => {
                const post = stringifyMessage(type, data)
                ws.send(post)
                console.log('<- ' + post)
            }
            const sendAll: MessageHandlerParams['sendAll'] = (type, data) => {
                const post = stringifyMessage(type, data)
                const count = wsServer.clients.size
                wsServer.clients.forEach((client) => {
                    client.send(post)
                })
                console.log('<- '.repeat(count) + post)
            }
            const sendTo: MessageHandlerParams['sendTo'] =
                (...sessionIds) =>
                (type, data) => {
                    const post = stringifyMessage(type, data)
                    let count = 0
                    wsServer.clients.forEach((client) => {
                        if (
                            sessionIds.includes((client as WebSocket).sessionId)
                        ) {
                            count++
                            client.send(post)
                        }
                    })
                    console.log('<- '.repeat(count) + post)
                }

            const baseMessage = {
                send,
                sendAll,
                sendTo,
                _: {
                    wss: wsServer,
                    ws,
                },
            }

            ws.on('message', (buffer) => {
                const { error, parsed, data } = parseMessage(buffer.toString())
                if (error) {
                    send(MessageResponseType.ParseError, { error })
                    return
                }
                console.log('-> ' + data)
                handleMessageEvent({
                    ...baseMessage,
                    message: parsed!,
                    sessionId: ws.sessionId,
                })
            })
            ws.on('close', () => {
                const game = store.games.find((g) =>
                    g.players.find((p) => p.userIndex === ws.sessionId),
                )
                if (game) {
                    game.players.forEach(({ userIndex, inGameIndex }) => {
                        if (game.inGame) {
                            if (ws.sessionId !== userIndex) {
                                store.incrementWin(userIndex)
                                sendTo(userIndex)(MessageResponseType.Finish, {
                                    winPlayer: inGameIndex,
                                })
                            }
                        }
                    })
                    store.removeGame(game.gameId)
                }
                store.rooms.forEach(({ indexRoom }) => {
                    const removed = store.removeFromRoom(
                        indexRoom,
                        ws.sessionId,
                    )
                    if (removed) {
                        update_room(
                            baseMessage as MessageHandlerParams<unknown>,
                            null,
                        )
                    }
                })
                log(`Socket '${ws.sessionId}' was closed`)
            })
        })
        wsServer.on('error', (error) => {
            console.error(error)
        })
    },
}
