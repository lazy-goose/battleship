export const HTTP_PORT = 8181
export const WS_PORT = 3000

export const BOARD_SIZE = 10

export enum MessageResponseType {
    Registration = 'reg',
    UpdateWinners = 'update_winners',
    UpdateRoom = 'update_room',
    CreateGame = 'create_game',
    StartGame = 'start_game',
    Turn = 'turn',
    Attack = 'attack',
    Finish = 'finish',
    /* Special */
    ParseError = 'parse_error',
    MessageFailed = 'message_failed',
}

export enum MessageRequestType {
    Registration = 'reg',
    CreateRoom = 'create_room',
    AddUserToRoom = 'add_user_to_room',
    AddShips = 'add_ships',
    Attack = 'attack',
    RandomAttack = 'randomAttack',
}
