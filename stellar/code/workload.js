const [INPUT_RATE, DURATION_TIME, REPEAT, SLEEP_TIME, SLICE] = process.argv.slice(2, 7).map(it => parseInt(it))
const sendTx = require(`../lib/sdk.js`).genRawTx

const config = require('../../configure.json')

const app = {
  log: {},
  max_txs_in_period: INPUT_RATE * DURATION_TIME,
  max_txs_in_round:  INPUT_RATE * DURATION_TIME * REPEAT,
  sent_txs: 0,
}

const privKey = Object.values(require(config.stellar.path.testAccount)).slice(SLICE,SLICE+app.max_txs_in_round)


const StellarSdk = require('stellar-sdk')
var server = []
StellarSdk.Network.use(new StellarSdk.Network("stellar"))
for (let i = 0 ; i < config.stellar.urls.length ; i++){   // 2 for testing
	server[i] = new StellarSdk.Server(config.stellar.urls[i], {allowHttp: true})
}


const onePeriodTest = () => {
  let period = setInterval(() => {
    console.log( "sendtx" , app.sent_txs , Date.now())
    for (let i = 0; i < INPUT_RATE; i++) {
      sendTx(server[i%config.stellar.urls.length], privKey[app.sent_txs++], config.stellar.destination.address[0])   // 2 is urls length, for testing
    }

    if (0 === app.sent_txs % app.max_txs_in_period) {
      console.log( "sendtx" , app.sent_txs )
      clearInterval(period)
    }
  }, 1000)
}

function oneRoundTest(){

  let round = setInterval(async() => {

    if (app.sent_txs === app.max_txs_in_round) {
      console.log("clear")
      return clearInterval(round)
    }

    console.log(app.sent_txs, app.max_txs_in_round , Date.now()/1000 )
    onePeriodTest()

  }, (DURATION_TIME + SLEEP_TIME) * 1000)

}

;(async function () {
  //await forTest()
  onePeriodTest()
  oneRoundTest()
})()
// for test , not necessary



//oneRoundTest()
