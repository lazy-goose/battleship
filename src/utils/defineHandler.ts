import type { MessageHandler } from '../ws-server/types.d'

export const defineHandler = <D>(handler: MessageHandler<D>) => handler
