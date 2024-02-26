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
        if (!room) {
            return false
        }
        if (room.host === userIndex) {
            return false
        }
        room.player = userIndex
        room.filled = true
        return true
    },
    removeFromRoom: (indexRoom, userIndex) => {
        const room = get().rooms.find((r) => r.indexRoom === indexRoom)
        if (!room) {
            return undefined
        }
        if (room.host !== userIndex) return undefined
        if (room.player !== userIndex) return undefined
        if (room.host === userIndex) {
            get().removeRoom(indexRoom)
            return undefined
        } else {
            room.player = null
            return room
        }
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
