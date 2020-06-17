const Tx = require('ethereumjs-tx')
const fs = require('fs')
const config = require('../../configure.json')

const des_addr = config.setting.des_address
const private_key_list = Object.values(require(config.quorum.path.account))

const option = {
  raw_txs_num: config.setting.raw_transaction_num,  //private_key_list.length,
  count: 0,
  data_len: 206
}

;(async function () {

  let raw_tx_hashes = {}
  let data = '0x'
  for (let i = 0; i < option.data_len; i ++) {
	  data = `${data}1`
  }
  // generate transactions

  while (option.count < option.raw_txs_num) {
    let transaction = new Tx({
      nonce: "0x0",
      to: des_addr,
      gasLimit: '0x10000',
      value: '0x01',
      chainId: '0xa',
      data: data
    })

    // sign transactions
    let privateKey = new Buffer(private_key_list[option.count++], 'hex')
    transaction.sign(privateKey)

    let raw_tx = '0x' + transaction.serialize().toString('hex')

    // get transaction hash and output
    raw_tx_hashes[raw_tx] = `0x${Buffer.from(transaction.hash()).toString('hex')}`
	if(option.count%1000==0) console.log("GenRaw",option.count)
  }
  fs.writeFileSync(config.quorum.path.raw_transaction, JSON.stringify(raw_tx_hashes))

})()
