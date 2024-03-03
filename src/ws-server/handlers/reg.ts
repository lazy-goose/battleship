import { WebSocket } from 'ws'
import { store } from '../../store'
import { MessageResponseType } from '../../utils/constants'
import { defineHandler } from '../../utils/defineHandler'

const exclude = <T extends Record<string, unknown>>(
    object: T,
    key: keyof T,
) => {
    const copy = { ...object }
    delete copy[key]
    return copy
}

export default defineHandler<{
    name: string
    password: string
}>((params) => {
    const { message, sessionId, send } = params
    const { name, password } = message.data
    if (name.length < 5) {
        send(MessageResponseType.Registration, {
            index: '',
            name: '',
            error: true,
            errorText: `Field 'name' must have at least 5 characters`,
        })
        return
    }
    if (password.length < 5) {
        send(MessageResponseType.Registration, {
            index: '',
            name: '',
            error: true,
            errorText: `Field 'password' must have at least 5 characters`,
        })
        return
    }
    const existedUser = store.users.find((u) => u.name === name)
    const isUserInUse = [...params._.wss.clients].some(
        (ws) => (ws as WebSocket).sessionId === existedUser?.index,
    )
    if (isUserInUse) {
        send(MessageResponseType.Registration, {
            index: '',
            name: '',
            error: true,
            errorText: `User '${existedUser?.name}' is already logged in`,
        })
        return
    }
    if (existedUser) {
        if (password !== existedUser.password) {
            send(MessageResponseType.Registration, {
                index: '',
                name: '',
                error: true,
                errorText: `User '${existedUser.name}' password incorrect`,
            })
            return
        }
        // Log in current user session
        params._.ws.sessionId = existedUser.index
        send(MessageResponseType.Registration, {
            ...exclude(existedUser, 'password'),
            error: false,
            errorText: ``,
        })
        return
    }
    // Registration
    const user = store.registerUser({ index: sessionId, name, password })
    send(MessageResponseType.Registration, {
        ...exclude(user, 'password'),
        error: false,
        errorText: ``,
    })
})
