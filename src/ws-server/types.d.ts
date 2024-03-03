import type ws from 'ws'

declare module 'ws' {
    export interface WebSocket {
        sessionId: string
    }
}

export type Message<D = unknown> = {
    type: ResponseType
    data: D
    id: 0
}
export type MessageHandlerParams<D = unknown> = {
    message: Message<D>
    send: (type: ResponseType, data: unknown) => void
    sendAll: MessageHandlerParams['send']
    sendTo: (...sessionIds: ID) => MessageHandlerParams['send']
    _: {
        wss: ws.WebSocketServer
        ws: ws.WebSocket
    }
    sessionId: string
}
export type MessageHandler<D = unknown, C = unknown> = (
    params: MessageHandlerParams<D>,
    customData: C,
) => void
