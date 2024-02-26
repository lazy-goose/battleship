import crypto from 'crypto'
import type { RoomSlice, SliceCreator } from '../types.d'

export const createRoomSlice: SliceCreator<RoomSlice> = (set, get) => ({
    rooms: [],
    createRoom: (userIndex) => {
        const newRoom = {
            indexRoom: crypto.randomUUID(),
            host: userIndex,
            player: null,
            filled: false,
        }
        set((state) => {
            state.rooms.push(newRoom)
        })
        return newRoom
    },
    addToRoom: (indexRoom, userIndex) => {
        const room = get().rooms.find((r) => r.indexRoom === indexRoom)
        if (room) {
            room.player = userIndex
            room.filled = true
            return true
        }
        return false
    },
    removeRoom: (indexRoom) => {
        const index = get().rooms.findIndex((r) => r.indexRoom === indexRoom)
        if (index !== -1) {
            set((state) => {
                state.rooms.splice(index, 1)
            })
        }
    },
})
