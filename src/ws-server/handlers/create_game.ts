import { store } from '../../store'
import { MessageResponseType } from '../../utils/constants'
import { defineHandler } from '../../utils/defineHandler'

export default defineHandler<unknown, string>((params, indexRoom) => {
    const { send, sendTo } = params

    const room = store.rooms.find((r) => r.indexRoom === indexRoom)

    if (!room) {
        send(MessageResponseType.MessageFailed, {
            error: `No room with index: ${indexRoom}`,
        })
        return
    }

    const game = store.createGame(indexRoom)

    if (!game) {
        send(MessageResponseType.MessageFailed, {
            error: `Cannot create game from room with index: ${indexRoom}`,
        })
        return
    }

    ;[room.host, room.player].forEach((userIndex) => {
        if (userIndex) {
            const player = game.players.find((p) => p.userIndex === userIndex)
            const idGame = game.gameId
            const idPlayer = player!.inGameIndex
            sendTo(userIndex)(MessageResponseType.CreateGame, {
                idGame,
                idPlayer,
            })
        }
    })
})
