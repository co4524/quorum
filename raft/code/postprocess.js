const config = require('../../configure.json')
const fs = require('fs')
const consensus = config.setting.consensus
const node_num = config[consensus].nodeIp.length
const ws_port = config.setting.port.web_socket
const api = require(`../../quorum/lib/api.js`)
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.WebsocketProvider(`ws://${config[consensus].nodeIp[0]}:${ws_port}`))
const testing_time = 1

;(async function() {
    let transaction_log = []
    let block_log = []
    let report = require(`${config[consensus].path.rec_data}/report${testing_time}.json`)
    let block = Object.keys(report)
    let blockLogIndex = []
    let total_txs = 0
    for (let i = 0; i < block.length; i++){
        total_txs+=report[block[i]].num_txs
        blockLogIndex.push(block[i].split('_')[1]-1)
    }
    // fliter transaction rec time from log
    let regex = RegExp('Submit')
    let regex2 = RegExp('Mined block')
    for (let i = 0 ; i < node_num ; i ++){
        let log = fs.readFileSync(`${config[consensus].path.rec_data}/node${i}/log`, 'utf-8').split('\n')
        log.map((it) => {
            if(regex.test(it)) transaction_log.push(it)
            if(regex2.test(it)) block_log.push(it)
        })
        if(i==0) transaction_log = transaction_log.slice(total_txs+1)
    }
    console.log(`post_process--block_log_length:${block_log.length} report_total_txs:${total_txs} report_block_length:${block.length} max_block_num:${block[blockLogIndex.length-1]}`)
    // parse transaction hash & transaction rec time in report.json
    let year = config.setting.year
    for (let i = 0 ; i < transaction_log.length ; i ++){
        time = transaction_log[i].slice(5,25).match(/([0-9]{2,3})/g)  // [month, day, hour, minute, sec, ms]
        hash = transaction_log[i].match(/(0x[a-f0-9]{64})/g)[0]
        let block_num = (await api.getTransactionReceipt(web3, hash)).blockNumber
        report[`block_${block_num}`].transactions.push(`${hash},${new Date(`${year}-${time[0]}-${time[1]}T${time[2]}:${time[3]}:${time[4]}.${time[5]}`).valueOf()}000000`)
        if (i%1000===0) console.log(`get ${i} transaction detail`)
    }

    // parse block time in log because block's timestamp from web3 is wrong
    for (let i = 0 ; i < node_num ; i ++){
        for (let j = blockLogIndex[0] ; j < blockLogIndex[blockLogIndex.length-1] ; j ++){
            time = block_log[j].slice(5,25).match(/([0-9]{2,3})/g)  // [month, day, hour, minute, sec, ms]
            report[`block_${j+1}`].timestamp[i][`node${i}`] = new Date(`${year}-${time[0]}-${time[1]}T${time[2]}:${time[3]}:${time[4]}.${time[5]}`).valueOf()
        }
    }

    // delete block which has 0 tx
    Object.keys(report).map((it) => {
        if (report[it].num_txs==0) {
            delete report[it]
        }
    })
    // write file close websocket
    console.log("done")
    web3.currentProvider.connection.close()
    fs.writeFileSync(`${config[consensus].path.rec_data}/report${testing_time}.json`, JSON.stringify(report, null, 2))
})()
