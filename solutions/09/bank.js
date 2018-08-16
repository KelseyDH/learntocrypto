var fs = require('fs');
var jsonStream = require('duplex-json-stream')
var net = require('net')
var sodium = require('sodium-native')
var genesisHash = Buffer.alloc(32).toString('hex') // e.g. "0000000000000000000000000000000000000000000000000000000000000000"

// var secretKey = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES)
// var publicKey = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES)
// sodium.crypto_sign_keypair(publicKey, secretKey)


var publicKey = Buffer.from(fs.readFileSync('public.txt'), 'hex') 
var secretKey = Buffer.from(fs.readFileSync('secret.txt'), 'hex' ) 
// sodium.crypto_sign_keypair(publicKey, secretKey)


if ( isEmpty(publicKey) || isEmpty(secretKey) ) {
  var secretKey = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES)
  var publicKey = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES)
  sodium.crypto_sign_keypair(publicKey, secretKey)
  fs.writeFileSync('public.txt', publicKey.toString('hex'))
  fs.writeFileSync('secret.txt', secretKey.toString('hex'))
  console.log('New Public Key:')
  console.log(publicKey.toString('hex'))
  console.log('New private key:')
  console.log(secretKey.toString('hex'))
} else {
  console.log("pub key")
  console.log(publicKey)
  console.log(publicKey.toString('hex'))
  // var publicKey = Buffer.from(pubKey, 'hex')
  // var secretKey = Buffer.from(secKey, 'hex')

}

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
function validateLog(acc, entry) {
  var prevHash = acc.length ? acc[acc.length - 1].hash : genesisHash
  console.log(entry.signature)
  console.log(entry.hash)
  console.log(publicKey.toString('hex'))
  console.log(verify(entry.signature, entry.hash, publicKey))
  var currentHash = hashToHex(prevHash + JSON.stringify(entry.value))
    acc.push(entry)
  if ((currentHash === entry.hash) && verify(entry.signature, entry.hash, publicKey)) {
        return acc
    } else {
        return { cmd: 'error', msg: 'Invalid log' }
    }
}

function appendToTransactionLog(entry) {

    // entry is the messages received by the bank. We wrap it in an extra object
    // as this makes verifying the hashes a lot easier
    var prevHash = log.length ? log[log.length - 1].hash : genesisHash

    log.push({
        value: entry,
        hash: hashToHex(prevHash + JSON.stringify(entry)),
        signature: sign(hashToHex(prevHash + JSON.stringify(entry)), secretKey)
    })
   writeToFile(log)
    log.reduce(validateLog, [])

}

function writeToFile(log) {
    fs.writeFileSync('log.json', JSON.stringify(log))
}


function hashToHex(input) {
    // // Convert input to string and then Buffer
    let inputBuf = Buffer.from(input)
    // // Allocate Buffer for output hash
    let outputBuf = Buffer.alloc(32)
    // // Compute blake2b hash
    sodium.crypto_generichash(outputBuf, inputBuf, input);
    return outputBuf.toString('hex')
}

function isEmpty(str) {
    return (!str || 0 === str.length);
}

function sign(msg, secretKey) {
  message = Buffer.from(msg)
  signature = Buffer.alloc(sodium.crypto_sign_BYTES)
  sodium.crypto_sign_detached(signature, message, secretKey)
  return signature.toString('hex')
}

function verify(signature, message, publicKey) {
  // console.log(publicKey)
  // console.log(message)
  // console.log(signature)
  // publicKeyBuf = Buffer.from(publicKey, 'hex')
  messageBuf = Buffer.from(message)
  signatureBuf = Buffer.from(signature, 'hex')
  var bool = sodium.crypto_sign_verify_detached(signatureBuf, messageBuf, publicKey)
  console.log('Verified: ')
  console.log(bool)
  return bool
}