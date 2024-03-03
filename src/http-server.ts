import fs from 'fs'
import http from 'http'
import path from 'path'

export const httpServer = http.createServer((req, res) => {
    const filePath = path.join(
        __dirname,
        req.url === '/' ? 'frontend/index.html' : 'frontend' + req.url,
    )
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404)
            res.end(JSON.stringify(err))
            return
        }
        res.writeHead(200)
        res.end(data)
    })
})
