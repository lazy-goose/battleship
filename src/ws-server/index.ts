/* eslint-disable @typescript-eslint/ban-ts-comment */

import { WebSocketServer, type Server, type WebSocket } from 'ws'
import { MessageRequestType, MessageResponseType } from '../utils/constants'
import reg from './handlers/reg'
import update_winners from './handlers/update_winners'
import { parseMessage, stringifyMessage } from './messageParser'
import type { MessageHandler, MessageHandlerParams } from './types.d'

const handleMessageEvent = (params: MessageHandlerParams) => {
    const {
        message: { type },
    } = params
    const call = <T>(handler: MessageHandler<T>) => {
        // @ts-expect-error
        handler(params)
    }
    switch (type) {
        case MessageRequestType.Registration:
            call(reg)
            call(update_winners)
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
                    _: {
                        wss: wsServer,
                        ws,
                    },
                    sessionId,
                })
            })
        })

        wsServer.on('error', (error) => {
            console.error(error)
        })
    },
}
