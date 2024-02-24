type ID = string

export type User = {
    index: ID
    name: string
    password: string
}
export type UserSlice = {
    users: User[]
    registerUser: (user: User) => User
}

export type Winner = {
    userIndex: User['index']
    wins: number
}
export type WinnerSlice = {
    winners: Winner[]
    incrementWin: (userIndex: User['index']) => void
}

export type Room = {
    indexRoom: ID
    inGame: boolean
    host: User['index']
    player: User['index'] | null
}
export type RoomSlice = {
    rooms: Room[]
    createRoom: (hostIndex: User['index']) => Room
    removeRoom: (indexRoom: Room['indexRoom']) => void
    addToRoom: (
        indexRoom: Room['indexRoom'],
        userIndex: User['index'],
    ) => boolean
}

export type Store = UserSlice & WinnerSlice & RoomSlice

type Rec = Record<string, unknown>

export type SetStore<St> = (stateMutator: (state: St) => void) => void
export type GetStore<St> = () => St
export type SliceCreator<Sl extends Rec, St extends Rec = Store> = (
    set: SetStore<St>,
    get: GetStore<St>,
) => Sl
