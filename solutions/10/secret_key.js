sodium = require('sodium-native')
var argv = process.argv.slice(2)
var command = argv[0]



//message
message = "hello"

//secret key
var secretKeyBuff = Buffer.alloc(sodium.crypto_secretbox_KEYBYTES)

secretKeyBuff.fill(sodium.randombytes_buf)

//nonce
var nonceBuff = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES)

nonceBuff.fill( randomString )

// cipher buffer
message.length + sodium.crypto_secretbox_MACBYTES


sodium.crypto_secretbox_easy(cipher, message, nonce, secretKey)



var secretKey = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES)
var publicKey = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES)
sodium.crypto_sign_keypair(publicKey, secretKey)


var randomString = function (length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}