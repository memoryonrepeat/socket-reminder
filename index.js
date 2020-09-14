const redis = require('redis')
const moment = require('moment')
const fs = require('fs')
const SERVER_PORT = 8081

const redisClient = redis.createClient({host: 'redis'})
const handler = (req, res) => {
  fs.readFile(
    `${__dirname}/index.html`,
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

io.on('connection', (socket) => {
  socket.on('remindRequest', (data) => {
    const timeUntilRemind = moment(data.time).diff(moment())

    if (timeUntilRemind > 0) {
      console.log('Setting reminder', data.name, data.time, timeUntilRemind)

      redisClient.hset('reminders', data.name, data.time, redis.print)

      socket.emit('remindConfirmation', {name: data.name, time: data.time})

      setTimeout(() => {
        io.emit('incomingRemind', {name: data.name})
        redisClient.hdel('reminders', data.name, redis.print)
      }, timeUntilRemind)
    }
  })
})

redisClient.on('ready', () => {
  console.log('Redis client is ready.....')

  redisClient.hgetall('reminders', (err, res) => {
    if (err) {
      console.log('Error while fetching pending reminders', err)

      return
    }

    console.log('Pending reminders', res)

    for (const key in res) {
      const timeUntilRemind = moment(res[key]).diff(moment())

      if (timeUntilRemind > 0) {
        console.log('Setting reminder', key, res[key], timeUntilRemind)

        setTimeout(() => {
          io.emit('incomingRemind', {name: key})
          redisClient.hdel('reminders', key, redis.print)
        }, timeUntilRemind)
      }
    }
  })
})

redisClient.on('error', (error) => {
  console.error('Redis server failure', error)
})

app.listen(SERVER_PORT)

module.exports = app
