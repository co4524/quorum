const fs = require('fs')
const StellarSdk = require('stellar-sdk')
const config = require('../../configure.json')
const option = {
    option :　process.argv[2],
    keys_number : 0
}

if(option.option==='testAccount') option.keys_number = 1000000
else if(option.option==='keystore') option.keys_number = 1010
else return console.log('wrong option')

let obj = {}
for (let i = 0 ; i < option.keys_number ; i ++){
    let pair = StellarSdk.Keypair.random();
    obj[pair.publicKey()]=pair.secret()
    if(i%1000===0) console.log("genKey",i)
}

fs.writeFileSync(`${config.stellar.path.data}/${option.option}.json`, JSON.stringify(obj,null,2) )