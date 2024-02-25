import { MessageRequestType, MessageResponseType } from '../utils/constants'
import { hasValue } from '../utils/hasValue'
import { isRecord } from '../utils/isRecord'
import type { Message } from './types.d'

type Ok<F> = { error: null; parsed: Message; data: F }
type Err<F> = { error: string; parsed: null; data: F }

export const parseMessage = <V = unknown>(value: V): Ok<V> | Err<V> => {
    const err = (error: string) => ({ error, parsed: null, data: value })

    try {
        if (typeof value !== 'string') {
            throw new Error('Jump to catch')
        }

        const parsedMessage = JSON.parse(value)

        if (!isRecord(parsedMessage)) {
            return err('Message is not a Record')
        }

        if (!('type' in parsedMessage)) {
            return err(`Message has no 'type' field`)
        }
        if (!hasValue(MessageRequestType, parsedMessage['type'])) {
            return err(`Unsupported message 'type'`)
        }

        if (!('data' in parsedMessage)) {
            return err(`Message has no 'data' field`)
        }
        let parsedData: unknown
        try {
            const toParse = parsedMessage.data
            if (typeof toParse !== 'string') {
                return err(`Wrong 'data' field format`)
            }
            if (!toParse.trim().length) {
                parsedData = ''
            } else {
                parsedData = JSON.parse(toParse)
            }
        } catch (e) {
            return err(`Unable to parse 'data' field with JSON.parse`)
        }

        if (parsedMessage['id'] !== 0) {
            return err(`Message must have an id=0 field`)
        }

        const ok = () => ({
            error: null,
            parsed: { ...parsedMessage, data: parsedData } as Message,
            data: value,
        })

        return ok()
    } catch (e) {
        return err(`Unable to parse message with JSON.parse`)
    }
}

export const stringifyMessage = (type: MessageResponseType, data: unknown) => {
    return JSON.stringify({
        type,
        data: JSON.stringify(data),
        id: 0,
    })
}
