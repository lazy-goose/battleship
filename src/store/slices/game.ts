import crypto from 'crypto'
import { BOARD_SIZE } from '../../utils/constants'
import type {
    AttackResponse,
    Coord,
    Game,
    GameSlice,
    PlayerState,
    Ship,
    SliceCreator,
} from '../types.d'

/**
 * Game board cell statuses:
 *   number >  0 -> unopened, ship (unique ship id)
 *   number =  0 -> unopened, empty
 *   number = -1 -> opened, shot or killed or miss (derived from ships array)
 */

const getShipCoordinates = (ship: Ship): Coord[] => {
    const {
        direction,
        position: { x, y },
        length,
    } = ship
    const list = []
    for (let i = 0; i < length; i++) {
        list.push({
            x: !direction ? x + i : x,
            y: !direction ? y : y + i,
        })
    }
    return list
}

export const createGameSlice: SliceCreator<GameSlice> = (set, get) => ({
    games: [],
    createGame: (roomIndex) => {
        const room = get().rooms.find((r) => r.indexRoom === roomIndex)
        if (!room) {
            return undefined
        }
        const createPlayerState = (userIndex: string): PlayerState => ({
            inGameIndex: crypto.randomUUID() as string,
            userIndex: userIndex!,
            ships: [],
            board: [],
        })
        const players = [
            createPlayerState(room.host),
            createPlayerState(room.player!),
        ] as [PlayerState, PlayerState]
        const turnUserIndex = players[Math.round(Math.random() * 1)].inGameIndex
        const newGame = {
            gameId: crypto.randomUUID(),
            inGame: false,
            turnUserIndex,
            players,
        } satisfies Game
        set((state) => {
            state.games.push(newGame)
        })
        return newGame
    },
    addShips: (gameId) => (userInGameIndex, ships) => {
        const game = get().games.find((g) => g.gameId === gameId)
        if (!game) {
            return undefined
        }
        const player = game.players.find(
            (p) => p.inGameIndex === userInGameIndex,
        )
        if (!player) {
            return undefined
        }
        player.ships = ships

        const createTable = (length: number) =>
            Array.from({ length }).map(() =>
                Array.from({ length }).map(() => 0),
            )

        player.board = createTable(BOARD_SIZE)

        ships.forEach((ship, index) => {
            const shipId = index + 1
            const {
                direction,
                position: { x: sx, y: sy },
                length,
            } = ship
            for (let i = 0; i < length; i++) {
                const ny = !direction ? sy : sy + i
                const nx = !direction ? sx + i : sx
                player.board[ny][nx] = shipId
            }
        })
        return ships
    },
    getStatusOfCell: (gameId) => (userInGameIndex, position) => {
        const { x, y } = position

        const game = get().games.find((g) => g.gameId === gameId)
        if (!game) {
            return undefined
        }

        const enemy = game.players.find(
            (p) => p.inGameIndex !== userInGameIndex,
        )
        if (!enemy) {
            return undefined
        }

        const cell = enemy.board[y][x]

        if (cell !== -1) {
            return 'hide'
        }

        let status: 'killed' | 'shot' | '' = ''

        enemy.ships.forEach((ship) => {
            const coord = getShipCoordinates(ship)
            const isPartOfShip = coord.some(
                ({ x: sx, y: sy }) => sx === x && sy == y,
            )
            const isShipKilled = coord.every(
                ({ x: sx, y: sy }) => enemy.board[sy][sx] === -1,
            )
            if (isPartOfShip) {
                if (isShipKilled) {
                    status = 'killed'
                } else {
                    status = 'shot'
                }
            }
        })

        return status || 'miss'
    },
    attack: (gameId) => (userInGameIndex, position) => {
        const { x, y } = position

        const game = get().games.find((g) => g.gameId === gameId)
        if (!game) {
            return undefined
        }

        const enemy = game.players.find(
            (p) => p.inGameIndex !== userInGameIndex,
        )
        if (!enemy) {
            return undefined
        }

        const cell = enemy.board[y][x]

        if (enemy.board[y][x] === -1) {
            return
        }

        enemy.board[y][x] = -1

        if (cell > 0) {
            // Shot

            if (enemy.board.flat().some((c) => c === cell)) {
                return [{ status: 'shot', pos: { x, y } }]
            }

            // Kill

            const ship = enemy.ships[cell - 1]
            const shipCoords = getShipCoordinates(ship)

            const hitsAround: Coord[] = []

            shipCoords.forEach(({ x, y }) => {
                for (let ox = -1; ox <= +1; ox++) {
                    for (let oy = -1; oy <= +1; oy++) {
                        const nx = x + ox
                        const ny = y + oy
                        if (nx < 0 || nx >= BOARD_SIZE) continue
                        if (ny < 0 || ny >= BOARD_SIZE) continue
                        enemy.board[ny][nx] = -1
                        hitsAround.push({ x: nx, y: ny })
                    }
                }
            })

            return [
                ...hitsAround.map((pos) => ({ status: 'miss', pos })),
                ...shipCoords.map((pos) => ({ status: 'killed', pos })),
            ] as AttackResponse[]
        }

        // Miss

        return [{ status: 'miss', pos: { x, y } }]
    },
    turn: (gameId) => {
        const game = get().games.find((g) => g.gameId === gameId)
        if (!game) {
            return undefined
        }
        const inGameIndex = game.turnUserIndex
        const [player1, player2] = game.players
        return (game.turnUserIndex =
            player1.inGameIndex === inGameIndex
                ? player2.inGameIndex
                : player1.inGameIndex)
    },
    removeGame: (gameId) => {
        const game = get().games.find((g) => g.gameId === gameId)
        if (!game) {
            return undefined
        }

        const games = get().games
        const gameIndex = get().games.indexOf(game)

        return games.splice(gameIndex, 1)[0]
    },
})
