import type { SliceCreator, UserSlice } from '../types.d'

export const createUsersSlice: SliceCreator<UserSlice> = (set) => ({
    users: [],
    registerUser: (userData) => {
        set((state) => {
            state.users.push(userData)
        })
        return userData
    },
})
