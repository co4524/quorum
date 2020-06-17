const Tx = require('ethereumjs-tx')
module.exports = {

    getTransactionReceipt: (web3, tx_hash) => web3.eth.getTransaction(tx_hash),

    sendTx: (web3, raw_tx) => web3.eth.sendSignedTransaction(raw_tx),

    getCurrentBlock: (web3) => web3.eth.getBlockNumber(),

    getBlock: (web3, block_num) => web3.eth.getBlock(block_num),

    getBalance: (web3, address) => web3.eth.getBalance(address),

    sendTx_nonceIncrease: (web3, private_key, des_addr, nonce) => {

        let transaction = new Tx({
            nonce: `0x${nonce}`,
            to: des_addr,
            gas: '0x5208',
            value: '0x01',
            chainId: '0xa',
            data: '0x'
        })

        transaction.sign(new Buffer(private_key, 'hex'))
        let raw_tx = '0x' + transaction.serialize().toString('hex')

        web3.eth.sendSignedTransaction(raw_tx)
    }

}