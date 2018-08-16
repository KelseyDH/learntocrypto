sodium = require('sodium-native')
var bool = sodium.crypto_secretbox_open_easy(message, cipher, nonce, secretKey) 


// Decrypt cipher Buffer into message Buffer using nonce and secretKey.
// Will return a boolean depending on whether the cipher text could be decrypted.