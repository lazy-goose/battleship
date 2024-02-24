import { store } from '../../store'
import { MessageResponseType } from '../../utils/constants'
import { defineHandler } from '../../utils/defineHandler'

export default defineHandler<{
    name: string
    password: string
}>((params) => {
    const { message, sessionId, send } = params
    const { name, password } = message.data
    if (name.length <= 5) {
        send(MessageResponseType.Registration, {
            index: '',
            name: '',
            error: true,
            errorText: `Field 'name' must have at least 5 characters`,
        })
        return
    }
    if (password.length <= 5) {
        send(MessageResponseType.Registration, {
            index: '',
            name: '',
            error: true,
            errorText: `Field 'password' must have at least 5 characters`,
        })
        return
    }
    const user = store.registerUser({ index: sessionId, name, password })
    send(MessageResponseType.Registration, {
        ...user,
        error: false,
        errorText: ``,
    })
})
