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
    filled: boolean
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

type Ship = {
    position: {
        x: number
        y: number
    }
    direction: boolean
    length: number
    type: 'small' | 'medium' | 'large' | 'huge'
}
type PlayerState = {
    userIndex: User['index']
    inGameIndex: ID
    ships: Ship[]
}
type Game = {
    gameId: ID
    inGame: boolean
    players: [PlayerState, PlayerState]
}
export type GameSlice = {
    games: Game[]
    createGame: (roomIndex: Room['indexRoom']) => Game | undefined
}

export type Store = UserSlice & WinnerSlice & RoomSlice & GameSlice

type Rec = Record<string, unknown>

export type SetStore<St> = (stateMutator: (state: St) => void) => void
export type GetStore<St> = () => St
export type SliceCreator<Sl extends Rec, St extends Rec = Store> = (
    set: SetStore<St>,
    get: GetStore<St>,
) => Sl
