import { httpServer } from './http-server'

const HTTP_PORT = 8181

console.log(`Start static http server: http://localhost:${HTTP_PORT}`)
httpServer.listen(HTTP_PORT)
