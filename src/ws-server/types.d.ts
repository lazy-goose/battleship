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
    _: {
        wss: ws.WebSocketServer
        ws: ws.WebSocket
    }
}
export type MessageHandler<D = unknown> = (
    params: MessageHandlerParams<D>,
) => void
