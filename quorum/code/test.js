const config = require('../../configure.json')
const fs = require('fs')
const consensus = config.setting.consensus
const node_num = config[consensus].nodeIp.length
const ws_port = config.setting.port.web_socket
const api = require("../lib/api.js")
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.WebsocketProvider(`ws://${config[consensus].nodeIp[0]}:${ws_port}`))
const web32 = new Web3(new Web3.providers.WebsocketProvider(`ws://${config[consensus].nodeIp[1]}:${ws_port}`))
const testing_time = 1

;(async function() {
    let transaction_log = []
    let block_log = []
	let block_obj = {}

	// for (let i = 0; i < 100; i ++) {
		let res = await api.getBlock(web3, parseInt( process.argv[2] ))
			console.log(res.timestamp)
		let res2 = await api.getBlock(web32, parseInt( process.argv[2] ))
		// try {
			// let res = await api.getBlock(web3, parseInt(i))
			// console.log(i)
			console.log(res2.timestamp)
		// } catch(err) {
			// console.log(i)
		// }
	// }

})()
