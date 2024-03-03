import { httpServer } from './http-server'
import { HTTP_PORT, WS_PORT } from './utils/constants'
import { wsServer } from './ws-server'

httpServer.listen(HTTP_PORT, () => {
    console.log(`Start static http server: http://localhost:${HTTP_PORT}`)
})

wsServer.listen(WS_PORT, () => {
    console.log(`Start ws server: ws://localhost:${WS_PORT}`)
})
