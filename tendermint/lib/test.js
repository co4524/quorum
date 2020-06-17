api = require("./rpc.js")
const sendTx = require('../lib/rpc.js').sendTx
const config = require('../../configure.json')
const node_index = parseInt(process.argv[3], 10)

testAPI()

async function testAPI(){
    // let res = await api.tendermintInfo("http://10.140.4.0:26657")
    // console.log(res)
    //let res = JSON.parse(await api.tendermintInfo("http://10.140.4.0:26657")).result.sync_info.latest_block_height
    //console.log(typeof(res),'\n',res)
<<<<<<< HEAD
	let res = await sendTx(`http://10.140.1.${node_index}:26657`, process.argv[2])
=======
	let res = await sendTx("http://10.140.0.36:26657", process.argv[2])
>>>>>>> 98769baa5ad842bd8ee6488ce1e9109a80760678
	console.log(res)
//	let res = await api.getTransactionReceipt("http://10.140.0.34:26657", process.argv[2])
//	console.log(res)
}
