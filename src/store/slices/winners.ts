import type { SliceCreator, WinnerSlice } from '../types.d'

export const createWinnersSlice: SliceCreator<WinnerSlice> = (set) => ({
    winners: [],
    incrementWin: (userIndex) => {
        set((state) => {
            const player = state.users.find((u) => u.index === userIndex)
            const winner = state.winners.find((w) => w.userIndex === userIndex)
            if (!player) {
                return
            }
            if (!winner) {
                state.winners.push({ userIndex, name: player.name, wins: 1 })
            } else {
                winner.wins++
            }
        })
    },
})
