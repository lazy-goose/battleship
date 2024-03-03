import { store } from '../../store'
import { MessageResponseType } from '../../utils/constants'
import { defineHandler } from '../../utils/defineHandler'

export default defineHandler((params) => {
    const { sendAll } = params
    sendAll(
        MessageResponseType.UpdateWinners,
        store.winners
            .sort((w1, w2) => w2.wins - w1.wins)
            .map(({ name, wins }) => ({ name, wins })),
    )
})
