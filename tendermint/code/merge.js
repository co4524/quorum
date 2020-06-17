const fs = require('fs')
const THREAD_NUM = parseInt(process.argv[2])
const config = require('../../configure.json')

var transaction_log = {}
for (let i = 0 ; i < THREAD_NUM ; i++){
    const obj = require(`${config.tendermint.path.transaction_log}${i+1}.json`)
    fs.unlinkSync(`${config.tendermint.path.transaction_log}${i+1}.json`)
    transaction_log = Object.assign(transaction_log,obj);
}

fs.writeFileSync(`${config.tendermint.path.transaction_log}.json`, JSON.stringify(transaction_log, null, 2))