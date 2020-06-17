const config = require('../../configure.json')
const ws_port = config.setting.port.web_socket
let utils = require('web3-utils');
const Web3 = require('web3')
const txs = Object.keys(require(config["quorum"].path.raw_transaction))
const hash = Object.values(require(config["quorum"].path.raw_transaction))
const api = require("./api.js")
const rpc = require("./rpc.js")
const consensus = config.setting.consensus
const web3 = new Web3(new Web3.providers.WebsocketProvider(`ws://${config[consensus].nodeIp[0]}:${ws_port}`))
const url = `http://${config[consensus].nodeIp[0]}:${config.setting.port.rpc}`

;(async function () {
	// console.log(url, hash[0])
	let res2 = await api.getBlock(web3, 1)
	console.log(res2)
	// let res3 = await api.getTransactionReceipt(web3, hash[0])
	// console.log(res3)
	let res = await rpc.getTransactionReceipt(url, hash[0])
	console.log(parseInt( res.result.blockNumber ))
})()
