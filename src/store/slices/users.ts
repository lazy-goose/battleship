import type { SliceCreator, UserSlice } from '../types.d'

export const createUsersSlice: SliceCreator<UserSlice> = (set) => ({
    users: [],
    registerUser: (userData) => {
        const newUser = userData
        set((state) => {
            state.users.push(newUser)
        })
        return newUser
    },
})
