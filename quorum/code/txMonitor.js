const [INPUT_RATE, DURATION_TIME, REPEAT] = process.argv.slice(2, 7).map(it => parseInt(it))
const Web3 = require('web3')
let utils = require('web3-utils');
const fs = require('fs')
const api = require(`../lib/api.js`)
const config = require('../../configure.json')
const sleep = require('sleep')
const ws_port = config.setting.port.web_socket
const web3 = []
const consensus = config.setting.consensus
config[consensus].nodeIp.map((it, index) => {
    web3[index] = new Web3(new Web3.providers.WebsocketProvider(`ws://${it}:${ws_port}`))
})
const testing_time = 1

const app = {
    log: {},
    node_num: config[consensus].nodeIp.length,
    report: {},
    max_txs_in_period: INPUT_RATE * DURATION_TIME,
    max_txs_in_round:  INPUT_RATE * DURATION_TIME * REPEAT,
    start_block_num: 0,
    end_block_num: 0,
	stop: 120
}

async function monitor(){
    return new Promise(async function(resolve,reject){
        let first_block = true
        let interval_time = 1000
        let start_balance = parseInt(await api.getBalance(web3[0], config.setting.des_address), 10)
		let con = 0;
		let c = 0;
        let interval = setInterval(async() => {
            let current_block_height = await api.getCurrentBlock(web3[0])
            let block_transactions = parseInt((await api.getBlock(web3[0], current_block_height)).transactions.length, 10)
            let expect_balance = parseInt(await api.getBalance(web3[0], config.setting.des_address), 10)
			if (con == expect_balance) {
				c++
			}
			else {
				c = 0
			}
            console.log(current_block_height,block_transactions,expect_balance,start_balance+app.max_txs_in_round,c)
            if(block_transactions!=0 && first_block && consensus == 'quorum'){
                app.start_block_num = current_block_height
                first_block = false
            }
            if(expect_balance===start_balance+app.max_txs_in_round || c > app.stop){
                app.end_block_num = current_block_height
                clearInterval(interval)
                resolve()
            }
			con = parseInt(await api.getBalance(web3[0], config.setting.des_address), 10)
        },interval_time)
    })
}
;(async function main() {
    if (consensus == "raft") app.start_block_num = 1
    await monitor()
	console.log(app.start_block_num, app.end_block_num)
	console.log("monitor end sleep 30 s")
	sleep.sleep(30)
    for (let i = 0 ; i < config.setting.node_num ; i ++){
        for(let j = app.start_block_num ; j <= app.end_block_num ; j ++){
            let obj = {}
            if (i===0){
            	let block_info = await api.getBlock(web3[i], j)
				console.log(j)
                app.report[`block_${j}`] = {
                    num_txs: block_info.transactions.length,
                    timestamp: [],
                    transactions: []
                }
            }

            if (consensus == "raft") {
                obj[`node${i}`]= ''
            }
            else obj[`node${i}`]= ''

            app.report[`block_${j}`].timestamp.push(obj)
        }
    }
	console.log(app.report)
	console.log(`${config[consensus].path.rec_data}/report${testing_time}.json`)
    fs.writeFileSync(`${config[consensus].path.rec_data}/report${testing_time}.json`, JSON.stringify(app.report, null, 2))
    console.log("write done")
    for (let k = 0; k < config.setting.node_num; k++) {
        web3[k].currentProvider.connection.close()
    }
    console.log("websocket clear")
})()
