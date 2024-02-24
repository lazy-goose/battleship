import type { SliceCreator, WinnerSlice } from '../types.d'

export const createWinnersSlice: SliceCreator<WinnerSlice> = (set) => ({
    winners: [],
    incrementWin: (userIndex) => {
        set((state) => {
            const winner = state.winners.find((w) => w.userIndex === userIndex)
            if (!winner) {
                state.winners.push({ userIndex, wins: 1 })
            } else {
                winner.wins++
            }
        })
    },
})
