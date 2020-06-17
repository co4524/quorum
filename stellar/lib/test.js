const StellarSdk = require('stellar-sdk')
const config = require('../../configure.json')
const sdk = require('./sdk.js')
const acc = require(config.stellar.path.keystore)
const pub = Object.keys(acc)
StellarSdk.Network.use(new StellarSdk.Network("stellar"))
server = new StellarSdk.Server(config.stellar.urls[0], {allowHttp: true})


;(async function () {
	let res = await sdk.genRawTx(server, acc[pub[0]], pub[1])
	//let transaction = encodeURIComponent(res.toEnvelope().toXDR().toString('base64'))
	//let result = await sdk.sendTx(transaction)
	//console.log(result)
})()
