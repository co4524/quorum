const StellarSdk = require('stellar-sdk')
const request = require('request-promise')
const config = require('../../configure.json')
StellarSdk.Network.use(new StellarSdk.Network("stellar"))
server = new StellarSdk.Server(config.stellar.urls[0],{allowHttp: true})

async function createAccount( keypair , amount , operation_count , pub){

    var transaction
    console.log("Create " , operation_count , " Account With" , amount)

    return new Promise((resolve, reject) => { 
      server.loadAccount(keypair.publicKey())
      .then(function(sourceAccount) {
        //console.log(sourceAccount)
        transaction = new StellarSdk.TransactionBuilder(sourceAccount, opts={fee:100})
        return transaction
      })
        .then(function(transaction) {
          for (var i = 0 ; i < operation_count ; i ++){
            transaction = transaction.addOperation(StellarSdk.Operation.createAccount({
              destination: pub[i],
              startingBalance: amount.toString()
            }))
          }
          transaction = transaction.addMemo(StellarSdk.Memo.text('create account'))
          .setTimeout(30)
          .build()
          transaction.sign(keypair)
          return server.submitTransaction(encodeURIComponent(transaction.toEnvelope().toXDR().toString('base64')))
        })
        .then(function(result) {
          console.log('Success! Results:')
          resolve(result);
        })
        .catch(function(error) {
          console.error('Something went wrong!', error)
          resolve(error)
        })
  
      })
        
}

async function genRawTx(_server, from_privateKey, des_publicKey ){
  var transaction;
  var sourceKeys = StellarSdk.Keypair.fromSecret(from_privateKey);
  // First, check to make sure that the destination account exists.
  // You could skip this, but if the account does not exist, you will be charged
  // the transaction fee when the transaction fails.
  return new Promise((resolve, reject) => {

    _server.loadAccount(sourceKeys.publicKey())
      .then(function(sourceAccount) {
//        console.log(typeof(sourceAccount))
        // Start building the transaction.
        transaction = new StellarSdk.TransactionBuilder(sourceAccount , opts={fee:100})
          .addOperation(StellarSdk.Operation.payment({
            destination: des_publicKey,
            // Because Stellar allows transaction in many currencies, you must
            // specify the asset type. The special "native" asset represents Lumens.
            asset: StellarSdk.Asset.native(),
            amount: "1"
          }))
          // A memo allows you to add your own metadata to a transaction. It's
          // optional and does not affect how Stellar treats the transaction.
          //.addMemo(StellarSdk.Memo.text('Test Transaction'))
          .setTimeout(100000)
          .build();
        // Sign the transaction to prove you are actually the person sending it.
        //transaction.tx._attributes.timeBounds._attributes.maxTime.low = 1569300000
//        console.log("seq_h",transaction.tx._attributes.seqNum.high)
        transaction.sign(sourceKeys);
        // And finally, send it off to Stellar!
        return _server.submitTransaction(encodeURIComponent(transaction.toEnvelope().toXDR().toString('base64')))
        //return server[index].submitTransaction(transaction);
      })
      .then(function(result) {
        //console.log('Success! Results:')
        resolve(result)
      })
      .catch(function(error) {
        console.error('Something went wrong!', error);
        resolve(error);
        // If the result is unknown (no response body, timeout etc.) we simply resubmit
        // already built transaction:
        // server.submitTransaction(transaction);
      });

  })
}

async function sendTx(tx){
	return new Promise((resolve, reject) =>{
		return server.submitTransaction(tx)
			.then(function(result){
				console.log('Suc',result)
				resolve(result)
			})
			.catch(function(error){
				console.error('something error',error)
				resolve(error)
			})
	})
}


module.exports = {
    createAccount : createAccount,
    genRawTx : genRawTx,
    getBalance : (address) => request(`${config.stellar.urls[0]}/accounts/${address}`),
    stellarInfo : () => request(`http://${config.stellar.node_ip[0]}:11626/info`),
    sendTransaction: (ip,src,des) => { 
      return request({
        method: 'POST',
        url: `http://${ip}:8006/payment`,
        form: {
          source: src,
          amount: 1,
          destination: des
        }
    })},
    getLedgerInfo : (url, block_height) => request(`${url}/ledgers/${block_height}`),
    getHorizonInfo : () => request(config.stellar.urls[0]),
    getTransactionDetail : (hash) => request(`${config.stellar.urls[0]}/transactions/${hash}`),
	sendTx : sendTx
}
