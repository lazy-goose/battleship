import type { MessageHandler } from '../ws-server/types.d'

export const defineHandler = <D, E = unknown>(handler: MessageHandler<D, E>) =>
    handler
