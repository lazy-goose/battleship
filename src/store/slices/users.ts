import type { SliceCreator, UserSlice } from '../types.d'

export const createUsersSlice: SliceCreator<UserSlice> = (set, get) => ({
    users: [],
    registerUser: (userData) => {
        const users = get().users
        const entryIndex = users.findIndex((u) => u.name === userData.name)
        if (entryIndex !== -1) {
            return (users[entryIndex] = userData)
        }
        users.push(userData)
        return userData
    },
})
