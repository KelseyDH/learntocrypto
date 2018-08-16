var fs = require('fs');
var jsonStream = require('duplex-json-stream')
var net = require('net')

var log = []

let data = fs.readFileSync('log.json')
log = JSON.parse(data)
console.log(log);


var server = net.createServer(function (socket) {
    socket = jsonStream(socket)

    socket.on('data', function (msg) {
        console.log('Bank received:', msg)

        switch (msg.cmd) {
            case 'balance':
                socket.end({ cmd: 'balance', balance: log.reduce(reduceLog, 0) })
                break
            case 'deposit':
                log.push(msg)
                writeToFile(log)
                socket.end({ cmd: 'balance', balance: log.reduce(reduceLog, 0) })
                break
            case 'withdraw':
                if (msg.amount > 0) {
                    console.log(log.reduce(reduceLog, 0))
                    socket.end({ cmd: 'error', msg: 'Cant withdraw positive amount' })
                    break
                } else if ((msg.amount + log.reduce(reduceLog, 0)) < 0) {
                    console.log(log.reduce(reduceLog, 0))
                    socket.end({ cmd: 'error', msg: 'Insufficient funds for withdrawal' })
                    break
                } else {
                    log.push(msg)
                    writeToFile(log)
                    socket.end({ cmd: 'balance', balance: log.reduce(reduceLog, 0) })
                    break
                }
            default:
                socket.end({ cmd: 'error', msg: 'Unknown command' })
                break
        }

    })
})

server.listen(3876)

function reduceLog(balance, entry) {
    return balance + entry.amount
}

function writeToFile(log) {
    fs.writeFileSync('log.json', JSON.stringify(log))
}