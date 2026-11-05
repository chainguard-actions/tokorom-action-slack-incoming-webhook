// Minimal local stand-in for a Slack Incoming Webhook endpoint.
// Records each POST body to $RECEIVED_FILE (one JSON per line) and
// returns 200 "ok", or 500 for any path containing "/fail".
const http = require('http')
const fs = require('fs')

const port = parseInt(process.env.PORT || '18080', 10)
const out = process.env.RECEIVED_FILE || '/tmp/slack-received.jsonl'
fs.writeFileSync(out, '')

http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200)
    res.end('healthy')
    return
  }
  let body = ''
  req.on('data', (c) => { body += c })
  req.on('end', () => {
    fs.appendFileSync(out, JSON.stringify({
      method: req.method,
      url: req.url,
      contentType: req.headers['content-type'] || '',
      body: body
    }) + '\n')
    if (req.url.includes('/fail')) {
      res.writeHead(500)
      res.end('internal error')
    } else {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('ok')
    }
  })
}).listen(port, '127.0.0.1', () => {
  console.log(`mock slack listening on ${port}`)
})
