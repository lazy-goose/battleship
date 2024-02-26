import { store } from '../../store'
import { Ship } from '../../store/types'
import { MessageResponseType } from '../../utils/constants'
import { defineHandler } from '../../utils/defineHandler'
import { useCall } from '../../utils/useCall'
import start_game from './start_game'

export default defineHandler<{
    gameId: string
    ships: Ship[]
    indexPlayer: string
}>((params) => {
    const { message, send } = params
    const { gameId, ships, indexPlayer } = message.data
    const { callWithData } = useCall(params)

    const game = store.games.find((g) => g.gameId === gameId)

    if (!game) {
        send(MessageResponseType.MessageFailed, {
            error: `No game with id: ${gameId}`,
        })
        return
    }

    const player = game.players.find((p) => p.inGameIndex === indexPlayer)

    if (!player) {
        send(MessageResponseType.MessageFailed, {
            error: `Game '${gameId}' has no player with index: ${indexPlayer}`,
        })
        return
    }

    player.ships = ships

    const isGameReady = () => {
        return game.players.every((p) => p.ships.length > 0)
    }

    if (isGameReady()) {
        callWithData(start_game, game)
    }
})
