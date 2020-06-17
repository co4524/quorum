const request = require('request-promise')

module.exports = {

    getTransactionReceipt: (baseURL, tx_hash) => {
		return request({
			url: baseURL,
			method: 'POST',
			body: {
				jsonrpc: '2.0',
				method: 'eth_getTransactionReceipt',
				params: [ tx_hash ],
				id: '1'
			},
			json: true
		})
	},

    sendTx: (baseURL, tx) => request({ method: 'POST', url: `${baseURL}/broadcast_tx_async?tx="${tx}"` }),

    tendermintInfo: (baseURL) => request(`${baseURL}/status`)

}
