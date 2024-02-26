/* eslint-disable @typescript-eslint/ban-ts-comment */

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
import update_room from './handlers/update_room'
import update_winners from './handlers/update_winners'
import { parseMessage, stringifyMessage } from './messageParser'
import type { MessageHandlerParams } from './types.d'

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
        default:
            return
    }
}

export const wsServer = {
    listen: (port: number, onServerStart?: (ws: Server) => void) => {
        const wsServer = new WebSocketServer({ port })

        if (onServerStart) {
            onServerStart(wsServer)
        }

        wsServer.on('connection', (ws: WebSocket) => {
            const sessionId = crypto.randomUUID()
            const send: MessageHandlerParams['send'] = (type, data) => {
                console.log('Send ' + type)
                const post = stringifyMessage(type, data)
                ws.send(post)
                console.log('<- ' + post)
            }
            const sendAll: MessageHandlerParams['sendAll'] = (type, data) => {
                console.log('SendAll ' + type)
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
                    console.log('Send To ' + type)
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
            ws.on('message', (buffer) => {
                const { error, parsed, data } = parseMessage(buffer.toString())
                if (error) {
                    send(MessageResponseType.ParseError, { error })
                    return
                }
                console.log('-> ' + data)
                ws.sessionId = sessionId
                handleMessageEvent({
                    message: parsed!,
                    send,
                    sendAll,
                    sendTo,
                    _: {
                        wss: wsServer,
                        ws,
                    },
                    sessionId,
                })
            })
            ws.on('close', () => {
                const room = store.rooms.find((r) => r.host === ws.sessionId)
                if (room) {
                    store.removeRoom(room.indexRoom)
                }
                const game = store.games.find((g) =>
                    g.players.find((p) => p.userIndex === ws.sessionId),
                )
                if (game) {
                    game.players.forEach(({ userIndex }) => {
                        sendTo(userIndex)(MessageResponseType.Finish, {
                            winPlayer: '',
                        })
                    })
                    store.removeGame(game.gameId)
                }
            })
        })

        wsServer.on('error', (error) => {
            console.error(error)
        })
    },
}
