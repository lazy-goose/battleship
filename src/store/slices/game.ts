import crypto from 'crypto'
import type { Game, GameSlice, PlayerState, SliceCreator } from '../types.d'

export const createGameSlice: SliceCreator<GameSlice> = (set, get) => ({
    games: [],
    createGame: (roomIndex) => {
        const room = get().rooms.find((r) => r.indexRoom === roomIndex)
        if (!room) {
            return undefined
        }
        const createPlayerState = (userIndex: string) =>
            ({
                inGameIndex: crypto.randomUUID() as string,
                userIndex: userIndex!,
                ships: [],
            }) satisfies PlayerState
        const newGame = {
            gameId: crypto.randomUUID(),
            inGame: false,
            players: [
                createPlayerState(room.host),
                createPlayerState(room.player!),
            ],
        } satisfies Game
        set((state) => {
            state.games.push(newGame)
        })
        return newGame
    },
})
