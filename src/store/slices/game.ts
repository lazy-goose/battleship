import crypto from 'crypto'
import { BOARD_SIZE } from '../../utils/constants'
import type { Game, GameSlice, PlayerState, SliceCreator } from '../types.d'

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
        console.log(player.board)
        return ships
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

        enemy.board[y][x] = -1

        if (cell > 0) {
            // Shot

            if (enemy.board.flat().some((c) => c === cell)) {
                return {
                    type: 'shot',
                    hits: [{ x, y }],
                }
            }

            // Kill

            const ship = enemy.ships[cell - 1]
            const {
                direction,
                position: { x: sx, y: sy },
                length,
            } = ship

            const hitsSet = new Set<string>()

            const makeHit =
                (cx: number, cy: number) => (ox: number, oy: number) => {
                    const x = cx + ox
                    const y = cy + oy
                    if (x < 0 || x >= BOARD_SIZE) return
                    if (y < 0 || y >= BOARD_SIZE) return
                    hitsSet.add(`${x}.${y}`)
                    enemy.board[y][x] = -1
                }

            for (let i = 0; i < length; i++) {
                const ny = !direction ? sy : sy + i
                const nx = !direction ? sx + i : sx
                const hit = makeHit(nx, ny)
                hit(+0, +0)
                hit(-1, -1)
                hit(-1, +0)
                hit(-1, +1)
                hit(+0, -1)
                hit(+0, +0)
                hit(+0, +1)
                hit(+1, -1)
                hit(+1, +0)
                hit(+1, +1)
            }

            const hits = [...hitsSet]
                .map((h) => h.split('.').map(Number))
                .map(([x, y]) => ({ x, y }))

            return {
                type: 'killed',
                hits,
            }
        }

        // Miss

        return {
            type: 'miss',
            hits: [{ x, y }],
        }
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
})
