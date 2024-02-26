import { MessageHandler, MessageHandlerParams } from '../ws-server/types'

export const useCall = (params: MessageHandlerParams) => {
    return {
        call: <D, DC>(handler: MessageHandler<D, DC>) => {
            // @ts-expect-error No runtime params.data validation
            handler(params)
        },
        callWithData: <D, DC, C>(
            handler: MessageHandler<D, DC>,
            customData: C,
        ) => {
            // @ts-expect-error No runtime params.data validation
            handler(params, customData)
        },
    }
}
