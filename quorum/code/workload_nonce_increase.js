const [INPUT_RATE, DURATION_TIME, REPEAT, SLEEP_TIME] = process.argv.slice(2, 7).map(it => parseInt(it))
const Web3 = require('web3')
const config = require('../../configure.json')
const ws_port = config.setting.port.web_socket
const CONSENSUS = config.setting.consensus
const web3 = []
config[CONSENSUS].nodeIp.map((it, index) => {
    web3[index] = new Web3(new Web3.providers.WebsocketProvider(`ws://${it}:${ws_port}`))
})
const sendTx = require(`../lib/api.js`).sendTx_nonceIncrease
const private_key_list = Object.values(require(config.quorum.path.account)).slice(0,INPUT_RATE)
const des_addr = config.setting.des_address

console.log("read done")
const app = {
  log: {},
  max_txs_in_period: INPUT_RATE * DURATION_TIME,
  max_txs_in_round:  INPUT_RATE * DURATION_TIME * REPEAT,
  sent_txs: 0,
  nonce: 0
}

const onePeriodTest = () => {
  let period = setInterval(() => {
    console.log( "sendtx" , app.sent_txs , Date.now())
    for (let i = 0; i < INPUT_RATE; i++) {
      sendTx(web3[i % config[CONSENSUS].urls.length], private_key_list[i], des_addr, app.nonce.toString(16))   // web3_addr, priv_key, des_acc, nonce 
      app.sent_txs++
    }

    app.nonce++

    if (0 === app.sent_txs % app.max_txs_in_period) {
      console.log( "sendtx" , app.sent_txs )
      clearInterval(period)
    }
  }, 1000)
}

function oneRoundTest(){

  let round = setInterval(() => {

    if (app.sent_txs === app.max_txs_in_round) {
      for (let i = 0; i < config.setting.node_num; i++) {
        web3[i].currentProvider.connection.close()
      }
      console.log("close web socket")
      return clearInterval(round)
    }
    onePeriodTest()

  }, (DURATION_TIME + SLEEP_TIME) * 1000)

}

;(async function () {
  onePeriodTest()
  oneRoundTest()
})()
