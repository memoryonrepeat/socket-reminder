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

    client.hset('reminders', data.name, data.time, redis.print)

    socket.emit('remindConfirmation', {name: data.name, time: data.time})

    setTimeout(() => {
      io.emit('incomingRemind', {name: data.name})
      client.hdel('reminders', data.name, redis.print)
    }, timeUntilRemind)
  })
})

client.on('ready', (error) => {
  // TODO: Fetch pending reminds from DB and set time out
  console.log('redis client is ready.....')

  client.hgetall('reminders', (err, res) => {
    console.log(res)
    for (const key in res) {
      const timeUntilRemind = moment(res[key]).diff(moment())

      if (timeUntilRemind > 0) {
        console.log('setting reminder', key, res[key], timeUntilRemind)
        setTimeout(() => {
          io.emit('incomingRemind', {name: key})
          client.hdel('reminders', key, redis.print)
        }, timeUntilRemind)
      }
    }
  })
})

client.on('error', (error) => {
  console.error(error)
})

app.listen(SERVER_PORT)
