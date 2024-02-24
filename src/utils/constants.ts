export const HTTP_PORT = 8181
export const WS_PORT = 3000

export enum MessageResponseType {
    Registration = 'reg',
    CreateGame = 'create_game',
    StartGame = 'start_game',
    Turn = 'turn',
    Attack = 'attack',
    Finish = 'finish',
    UpdateRoom = 'update_room',
    UpdateWinners = 'update_winners',
    /* Special */
    ParseError = 'parse_error',
}

export enum MessageRequestType {
    Registration = 'reg',
    CreateRoom = 'create_room',
    AddShips = 'add_ships',
    AddUserToRoom = 'add_user_to_room',
}
