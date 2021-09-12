const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000,
});

const sub = redisClient.duplicate();

// Slow @ high indices...
function fib(index) {
    if (index < 2) {
        return 1;
    }
    
    return fib(index - 1) + fib(index - 2);
};

// message == index
sub.on('message', (channel, message) => {
    redisClient.hset('values', message, fib(parseInt(message)));
});

// Not sure how this subscribe is hooked up to message...
// i.e. how does insert trigger the message callback?
sub.subscribe('insert');