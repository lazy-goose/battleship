import { store } from '../../store'
import { MessageResponseType } from '../../utils/constants'
import { defineHandler } from '../../utils/defineHandler'

export default defineHandler((params) => {
    const { sendAll } = params
    sendAll(
        MessageResponseType.UpdateWinners,
        store.winners.map((winner) => ({
            name: store.users.find((u) => u.index === winner.userIndex)?.name,
            wins: winner.wins,
        })),
    )
})
