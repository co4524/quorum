const config = require('../../configure.json')
const fs = require('fs')
const consensus = config.setting.consensus
const node_num = config[consensus].nodeIp.length
const ws_port = config.setting.port.web_socket
const api = require("../lib/api.js")
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.WebsocketProvider(`ws://${config[consensus].nodeIp[0]}:${ws_port}`))
const testing_time = 1

;(async function() {
    let transaction_log = []
    let block_log = []
	let block_obj = {}

    // fliter transaction rec time from log
    let regex = RegExp('Submit')
    let regex2 = RegExp('Imported new chain segment')
	let regex3 = RegExp('mined potential block')
    for (let i = 0 ; i < node_num ; i ++){
		block_log = []
        let log = fs.readFileSync(`${config[consensus].path.rec_data}/node${i}/log`, 'utf-8').split('\n')
        log.map((it) => {
            if(regex.test(it)) transaction_log.push(it)
            if(regex2.test(it)) block_log.push(it)
			if(regex3.test(it)) block_log.push(it)
        })
		block_obj[i] = block_log
    }

    let report = require(`${config[consensus].path.rec_data}/report${testing_time}.json`)

    let year = config.setting.year
	for (let i = 0; i< config.setting.node_num; i++) {
		let block_list = block_obj[`${i}`]
		for (let j = 0; j < block_list.length; j++) {
			if(report[`block_${j}`])
			{
				time = block_obj[`${i}`][j-1].slice(5,25).match(/([0-9]{2,3})/g)  // [month, day, hour, minute, sec, ms]
				report[`block_${j}`].timestamp[i][`node${i}`] = new Date(`${year}-${time[0]}-${time[1]}T${time[2]}:${time[3]}:${time[4]}.${time[5]}`).valueOf()
				console.log(j, block_obj[`${i}`][j-1])
			}
		}
	}

    // parse transaction hash & transaction rec time in report.json
    // let report = require(`${config[consensus].path.rec_data}/report${testing_time}.json`)

    for (let i = 0 ; i < transaction_log.length ; i ++){
        time = transaction_log[i].slice(5,25).match(/([0-9]{2,3})/g)  // [month, day, hour, minute, sec, ms]
        hash = transaction_log[i].match(/(0x[a-f0-9]{64})/g)[0]
		try
		{
			let block_num = (await api.getTransactionReceipt(web3, hash)).blockNumber
			report[`block_${block_num}`].transactions.push(`${hash},${new Date(`${year}-${time[0]}-${time[1]}T${time[2]}:${time[3]}:${time[4]}.${time[5]}`).valueOf()}000000`)
		}
		catch (err) {
			console.log(err, hash)
		}
        if (i%1000===0) console.log(`get ${i} transaction detail ${hash} ${time}`)
    }

    // delete block which has 0 tx
    // Object.keys(report).map((it) => {
    //     if (report[it].num_txs==0) {
    //         delete report[it]
    //     }
    // })
    // write file close websocket
    console.log("done")
    web3.currentProvider.connection.close()
    fs.writeFileSync(`${config[consensus].path.rec_data}/report${testing_time}.json`, JSON.stringify(report, null, 2))
})()
