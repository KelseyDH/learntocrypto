var fs = require('fs');
var jsonStream = require('duplex-json-stream')
var net = require('net')
var sodium = require('sodium-native')
var genesisHash = Buffer.alloc(32).toString('hex') // e.g. "0000000000000000000000000000000000000000000000000000000000000000"


let data = fs.readFileSync('log.json')
log = JSON.parse(data)
log.reduce(validateLog, [])

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
                appendToTransactionLog(msg)
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
                    appendToTransactionLog(msg)
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
    return balance + entry.value.amount
}

// Verify ledger is valid, otherwise halt and catch fire
function validateLog(acc, entry){
  var prevHash = acc.length ? acc[acc.length - 1].hash : genesisHash
  acc.push(entry)
  if (hashToHex(prevHash + JSON.stringify(entry.value)) === entry.hash) {
    return acc
  } else {
    throw { cmd: 'error', msg: 'Invalid log' }
  }
}

function appendToTransactionLog(entry) {
    log.reduce(validateLog, [])

    // entry is the messages received by the bank. We wrap it in an extra object
    // as this makes verifying the hashes a lot easier
    var prevHash = log.length ? log[log.length - 1].hash : genesisHash

    log.push({
      value: entry,
      hash: hashToHex(prevHash + JSON.stringify(entry))
    })
    writeToFile(log)
}
function writeToFile(log) {
    fs.writeFileSync('log.json', JSON.stringify(log))
}

function hashToHex(input){
  // // Convert input to string and then Buffer
  let inputBuf = Buffer.from(input)
  // // Allocate Buffer for output hash
  let outputBuf = Buffer.alloc(32)
  // // Compute blake2b hash
  sodium.crypto_generichash(outputBuf, inputBuf, input);
  return outputBuf.toString('hex')
}
