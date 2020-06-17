const CONSENSUS = process.argv[2]
const [INPUT_RATE, DURATION_TIME, REPEAT, SLEEP_TIME, SLICE, THREAD_NUM] = process.argv.slice(3, 9).map(it => parseInt(it))
const fs = require('fs')
const sendTx = require(`../${CONSENSUS}/lib/rpc.js`).sendTx
const getInfo = require(`../${CONSENSUS}/lib/rpc.js`).tendermintInfo

const config = require('../configure.json')

const txs = Object.keys(require(config[CONSENSUS].path.raw_tx_hash)).slice(SLICE) // SLICE for thread
console.log("read done")
const app = {
  log: {},
  max_txs_in_period: INPUT_RATE * DURATION_TIME,
  max_txs_in_round:  INPUT_RATE * DURATION_TIME * REPEAT,
  sent_txs: 0,
}

const onePeriodTest = () => {
  let period = setInterval(() => {
    console.log( "sendtx" , app.sent_txs , Date.now())
    for (let i = 0; i < INPUT_RATE; i++) {
      sendTx(config[CONSENSUS].urls[i % config[CONSENSUS].urls.length], txs[app.sent_txs++]).then(it => {
        it = JSON.parse(it)
        app.log[it.result.hash] = it.result.time
      })
    }

    if (0 === app.sent_txs % app.max_txs_in_period) {
      console.log( "sendtx" , app.sent_txs )
      clearInterval(period)
    }
  }, 1000)
}

function oneRoundTest(){

  let round = setInterval(() => {

    if (app.sent_txs === app.max_txs_in_round) {
      console.log("clear")
      fs.writeFileSync(`${config.tendermint.path.transaction_log}${THREAD_NUM}.json`, JSON.stringify(app.log, null, 2))  // thread for test
      return clearInterval(round)
    }

    console.log(app.sent_txs, app.max_txs_in_round , Date.now()/1000 )
    onePeriodTest()

  }, (DURATION_TIME + SLEEP_TIME) * 1000)

}

// for test , not necessary
async function forTest() {
  let res = parseInt(JSON.parse(await getInfo(config[CONSENSUS].urls[0])).result.sync_info.latest_block_height)
  return new Promise((resolve , reject) => {
    let interval = setInterval(async() => {
      let res2 = parseInt(JSON.parse(await getInfo(config[CONSENSUS].urls[0])).result.sync_info.latest_block_height)
      console.log(res,res2)
      if(res+1==res2) {
        clearInterval(interval)
        resolve()
      }
    }, 500)
  })
}

;(async function () {
  //await forTest()
  onePeriodTest()
  oneRoundTest()
})()
// for test , not necessary



//oneRoundTest()
