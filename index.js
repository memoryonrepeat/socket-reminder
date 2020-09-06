/* const redis = require('redis')
const client = redis.createClient({host: 'redis'})

client.on('ready', function (error) {
  console.log('redis client is ready.....')
})

client.on('error', function (error) {
  console.error(error)
})

console.log('server started!.....')
*/
const handler = (req, res) => {
  fs.readFile(
    __dirname + '/index.html',
    (err, data) => {
      if (err) {
        res.writeHead(500)
        return res.end('Error loading index.html')
      }

      res.writeHead(200)
      res.end(data)
    }
  )
}
const app = require('http').createServer(handler)
const io = require('socket.io')(app)
const fs = require('fs')

app.listen(8081)

io.on('connection', (socket) => {
  socket.emit('welcome', {hello: 'world'})

  socket.on('newremind', (data) => {
    socket.emit('remind', {name: data.name, time: data.time})
  })
})
