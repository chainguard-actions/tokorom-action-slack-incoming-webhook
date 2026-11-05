// Minimal local stand-in for a Slack Incoming Webhook endpoint.
// Records each POST body to $WEBHOOK_DIR/request-<n>.json (plus last.json).
// Path /fail responds with HTTP 500 to exercise error handling.
const http = require('http')
const fs = require('fs')
const path = require('path')

const dir = process.env.WEBHOOK_DIR || '/tmp/webhook'
const port = parseInt(process.env.WEBHOOK_PORT || '18080', 10)
fs.mkdirSync(dir, { recursive: true })
let count = 0

http.createServer((req, res) => {
  if (req.method === 'GET') {
    res.writeHead(200)
    res.end('ready')
    return
  }
  let body = ''
  req.on('data', (c) => { body += c })
  req.on('end', () => {
    count += 1
    fs.writeFileSync(path.join(dir, `request-${count}.json`), body)
    fs.writeFileSync(path.join(dir, 'last.json'), body)
    fs.writeFileSync(path.join(dir, 'last-meta.json'), JSON.stringify({
      method: req.method,
      url: req.url,
      contentType: req.headers['content-type'] || ''
    }))
    if (req.url.startsWith('/fail')) {
      res.writeHead(500, 'Internal Server Error')
      res.end('error')
      return
    }
    res.writeHead(200, 'OK')
    res.end('ok')
  })
}).listen(port, '127.0.0.1', () => {
  console.log(`webhook server listening on ${port}`)
})
