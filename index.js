const redis = require('redis')
const client = redis.createClient({host: 'redis'})

client.on('ready', function (error) {
  console.log('redis client is ready.....')
})

client.on('error', function (error) {
  console.error(error)
})

console.log('server started!.....')
