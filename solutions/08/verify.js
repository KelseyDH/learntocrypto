sodium = require('sodium-native')
var argv = process.argv.slice(3)
var command = 'verify'
var signature = "4d7d00a8c4113bd96ccaa658eea7d7731479499bcb59aa3b31a45670183c6ea25d63e0b1f8927c4ed8eda5c58b84f00ad35a7f6ee05506529e9be800de0b3002"
var message = "68656c6c6f"
var pubKey = "8ca08441ec112d607f91f05216a427d7b9b31659b04f2855be00844ae9bc2f81"

switch (command) {
    case 'verify':
        verify(signature, message, pubKey);
        break

    case 'help':
    default:
        console.log('node verify.js [CMD]')
}

function verify(signature, message, pubKey) {
    publicKeyBuf = Buffer.from(pubKey, 'hex')
    messageBuf = Buffer.from(message, 'hex')
    signatureBuf = Buffer.from(signature, 'hex')
    var bool = sodium.crypto_sign_verify_detached(signatureBuf, messageBuf, publicKeyBuf)
    console.log(bool)
    return bool
}

pubKey = "198c9b2fa38f82c46488168a19062c2800daea151f24f6ad53b56c83c5219226"

message = "ca11ee7a750baca9b0638017b46e9a3c2629b05e66c134002e93ae59e7aa0233"

signature = "38cbe3bc39d3c847cc9560a6bbffe08fa2b228a8b39db39d49841a4dbe856952e462801bbed873ffdae7ae54448157bf25a1e2bf57d6eca57e1d5419c8b7f700"