const request = require('request-promise')

module.exports = {

    getTransactionReceipt: (baseURL, tx_hash) => request(`${baseURL}/tx?hash=0x${tx_hash}`),

    sendTx: (baseURL, tx) => request({ method: 'POST', url: `${baseURL}/broadcast_tx_async?tx="${tx}"` }),

    tendermintInfo: (baseURL) => request(`${baseURL}/status`)

}
