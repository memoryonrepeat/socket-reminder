const redis = require('redis')
const client = redis.createClient({host: 'redis'})
const SERVER_PORT = 8081

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

const moment = require('moment')

io.on('connection', (socket) => {
  socket.emit('welcome', {hello: 'world'})

  socket.on('remindRequest', (data) => {
    const timeUntilRemind = moment(data.time).diff(moment())

    // TODO: Write remind to DB
    socket.emit('remindConfirmation', {name: data.name, time: data.time, timeUntilRemind})

    setTimeout(() => {
      io.emit('incomingRemind', {name: data.name})
      // TODO: Remove remind from DB
    }, timeUntilRemind)
  })
})

client.on('ready', (error) => {
  // TODO: Fetch pending reminds from DB
  console.log('redis client is ready.....')
})

client.on('error', (error) => {
  console.error(error)
})

app.listen(SERVER_PORT)
