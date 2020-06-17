const config = require('../../configure.json')
const moment = require('moment')
const getTransactionDetail = require('../lib/sdk.js').getTransactionDetail
const fs = require('fs')
const testing_time = 1

;(async function() {
    let report = require(`${config.stellar.path.report}/report${testing_time}.json`)
	let count = 0
    for (let i = 0 ; i < config.stellar.urls.length ; i ++){ 
        let tx = fs.readFileSync(`${config.stellar.path.transaction_log}${i}/transaction_log`, 'utf-8').split('\n').slice(0,-1)
		for(let j = 0 ; j < tx.length ; j ++){
			let ledger_id = JSON.parse(await getTransactionDetail(tx[j].split(',')[0])).ledger
			report[`block_${ledger_id}`].transactions.push(tx[j])
			if(++count%1000===0) console.log("get transaction", count)
		}
    }
    fs.writeFileSync(`${config.stellar.path.report}/report${testing_time}.json`, JSON.stringify(report, null, 2))
})()
