sodium = require('sodium-native')

str = "Hello, World!"

let inputBuf = Buffer.from(str)

let outputBuf = Buffer.alloc(32)

sodium.crypto_generichash(outputBuf, inputBuf, str)

console.log(outputBuf.toString('hex'))