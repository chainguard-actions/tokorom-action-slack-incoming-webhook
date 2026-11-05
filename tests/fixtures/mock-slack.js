// Minimal fake Slack Incoming Webhook endpoint used by the tests.
// POST /ok   -> 200 "ok", body saved to $OUT_DIR/last.json
// POST /fail -> 500 "invalid_payload", body saved too
const http = require('http')
const fs = require('fs')
const path = require('path')

const port = parseInt(process.env.PORT || '18080', 10)
const outDir = process.env.OUT_DIR || '/tmp/slack-mock'
fs.mkdirSync(outDir, { recursive: true })

http.createServer((req, res) => {
  let body = ''
  req.on('data', (c) => { body += c })
  req.on('end', () => {
    fs.writeFileSync(path.join(outDir, 'last.json'), body)
    fs.writeFileSync(path.join(outDir, 'last-meta.json'), JSON.stringify({
      method: req.method,
      url: req.url,
      contentType: req.headers['content-type'] || ''
    }))
    if (req.url.startsWith('/fail')) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('invalid_payload')
    } else {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('ok')
    }
  })
}).listen(port, '127.0.0.1', () => {
  fs.writeFileSync(path.join(outDir, 'ready'), '1')
})
