const crypto = require('crypto')
const sendTx = require('../lib/rpc.js').sendTx
const ethTx = require('ethereumjs-tx')
const fs = require('fs')

const config = require('../../configure.json')
const DES_ADDRESS = '0x6666666666666666666666666666666666666666' // The address you want to send money

const size = {
  raw_txs: 1600000
}

// reset output data

fs.existsSync(config.tendermint.path.raw_tx_hash) && fs.unlinkSync(config.tendermint.path.raw_tx_hash)

// private keys

const priv_key = fs.readFileSync(config.tendermint.path.private_key, 'utf-8').split('\n').slice(0, -1).map(raw => {
  return Buffer.from(raw.match(/(0x[a-f0-9]+)/g))
})

;(async function () {

  let raw_tx_hashes = {}

  // generate transactions

  while (size.raw_txs--) {
    let transaction = new ethTx({
      nonce: size.raw_txs,
      to: DES_ADDRESS,
      gasLimit: '0x30000',
      value: '0x01'
    })

    // sign transactions

    transaction.sign(priv_key[size.raw_txs % priv_key.length])

    let raw_tx = '0x' + transaction.serialize().toString('hex')

    // get transaction hash and output

    raw_tx_hashes[raw_tx] = crypto.createHash('sha256').update(raw_tx).digest('hex').toUpperCase()
  }

  fs.writeFileSync(config.tendermint.path.raw_tx_hash, JSON.stringify(raw_tx_hashes))

})()
