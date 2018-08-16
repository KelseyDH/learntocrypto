sodium = require('sodium-native')
var argv = process.argv.slice(2)
var command = argv[0]

var secretKey = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES)
var publicKey = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES)
sodium.crypto_sign_keypair(publicKey, secretKey)

switch (command) {
  case 'sign':
    var msg = argv[1]

    console.log("Secret Key (hex):")
    console.log(secretKey.toString('hex'))
    console.log("Public key (hex):")
    console.log(publicKey.toString('hex'))

    sign(msg, secretKey);

    console.log("Message:")
    console.log(message.toString('hex'))
    console.log('Signature (hex):')
    console.log(signature.toString('hex'))

    verify(signature, message, publicKey)
    break

  case 'help':
  default:
    console.log('node sign.js sign [message]')
}


function sign(msg, secretKey) {
    message = Buffer.from(msg)
    signature = Buffer.alloc(sodium.crypto_sign_BYTES)
    sodium.crypto_sign_detached(signature, message, secretKey)
    return signature.toString('hex')
}

function verify(signature, message, publicKey) {
    var bool = sodium.crypto_sign_verify_detached(signature, message, publicKey)
    console.log('Verified: ')
    console.log(bool)
    return bool
}