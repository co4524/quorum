const [INPUT_RATE, DURATION_TIME, REPEAT] = process.argv.slice(2, 7).map(it => parseInt(it))
const fs = require('fs')
const sdk = require(`../lib/sdk.js`)
const config = require('../../configure.json')
const moment = require('moment')
const testing_time = 1

const app = {
    log: {},
    node_num: config.stellar.urls.length, // config.stellar.url2.length
    report: {},
    max_txs_in_period: INPUT_RATE * DURATION_TIME,
    max_txs_in_round:  INPUT_RATE * DURATION_TIME * REPEAT,
    start_ledger_num: 0,
    end_ledger_num: 0,
}

;(async function monitor() {
    let first_ledger = true
    let start_balance = parseInt(JSON.parse(await sdk.getBalance(config.stellar.destination.address[0])).balances[0].balance,10)
    let interval = setInterval(async() => {
        let current_ledger_height = JSON.parse(await sdk.getHorizonInfo()).history_latest_ledger
        let ledger_transactions = JSON.parse(await sdk.getLedgerInfo(config.stellar.urls[0],current_ledger_height)).successful_transaction_count
        let expect_balance = parseInt(JSON.parse(await sdk.getBalance(config.stellar.destination.address[0])).balances[0].balance,10)
        console.log(current_ledger_height,ledger_transactions,expect_balance,start_balance+app.max_txs_in_round)
        if(ledger_transactions!=0){
            if(first_ledger){
                app.start_ledger_num = current_ledger_height
                first_ledger = false
            }
        }
        else if(expect_balance===start_balance+app.max_txs_in_round){
			app.end_ledger_num = current_ledger_height
            for (let i = app.start_ledger_num ; i <= app.end_ledger_num ; i ++){
                let time = []
                for(let j = 0 ; j < app.node_num ; j ++){
                    let obj = {}
                    var ledger_Info = JSON.parse(await sdk.getLedgerInfo(config.stellar.urls[j],i))
                    obj[`node${j}`]=parseInt(moment.utc(ledger_Info.closed_at.replace('Z','.000-00:00')).valueOf())
                    time.push(obj)
                }
                app.report[`block_${i}`] = {
                    num_txs: ledger_Info.successful_transaction_count,
                    timestamp: time,
                    transactions: []
                }
            }
            fs.writeFileSync(`${config.stellar.path.report}/report${testing_time}.json`, JSON.stringify(app.report, null, 2))
            clearInterval(interval)
        }
    },3000)
})()
