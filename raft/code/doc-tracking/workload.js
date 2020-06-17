const [INPUT_RATE, DURATION_TIME, REPEAT, SLEEP_TIME, SLICE] = process.argv.slice(2, 8).map(it => parseInt(it))
const Web3 = require('web3')
const config = require('../../../configure.json')
const ws_port = config.setting.port.web_socket
const CONSENSUS = config.setting.consensus
const web3 = []
config[CONSENSUS].nodeIp.map((it, index) => {
    web3[index] = new Web3(new Web3.providers.WebsocketProvider(`ws://${it}:${ws_port}`))
})

const sendTx = require(`../../../quorum/lib/api.js`).sendTx
const private_key_list = Object.values(require(config.quorum.path.account)).slice(2,INPUT_RATE+2)
const documentContractConfig = require("../contract/documentContract.json");
const contractAddress = '0x24f2e2a8918F252345163a1a39368E5531EB814C'
const contract = new web3[0].eth.Contract(documentContractConfig.ABI, contractAddress)

const app = {
  log: {},
  max_txs_in_period: INPUT_RATE * DURATION_TIME,
  max_txs_in_round:  INPUT_RATE * DURATION_TIME * REPEAT,
  sent_txs: 0,
  sn: 2,
  err_count: 0,
  nonce: 0,
}
//const txs = (require(config.raft.doc.create_rawTx).slice(0,app.max_txs_in_round/2)).concat((require(config.raft.doc.log_rawTx).slice(0,app.max_txs_in_round/2))).slice(SLICE)
const onePeriodTest = () => {
  let period = setInterval(() => {
    console.log( "sendtx" , app.sent_txs , Date.now())

    for (let i = 0; i < INPUT_RATE/2; i++) {
      app.sent_txs++
      createDocument(web3[i % config[CONSENSUS].urls.length], contract, `${i+2}`, `${app.sn++}`, 'datahash', Date.now(), private_key_list[i], app.nonce)
    }

    let target_SN = 1
    for (let i = INPUT_RATE/2; i < INPUT_RATE; i++) {
      app.sent_txs++
      logDocument(web3[i % config[CONSENSUS].urls.length], contract, `${target_SN}`, 'datahash', Date.now(), 0, private_key_list[i], app.nonce)
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
      console.log("workload close web socket")
      return clearInterval(round)
    }
    onePeriodTest()

  }, (DURATION_TIME + SLEEP_TIME) * 1000)

}

async function createDocument(web3, contract, receiver_EID, SN, dataHash, timestamp, privateKey, nonce) {
  try {
    const abiTransactionData = contract.methods.create(receiver_EID, SN, dataHash, timestamp).encodeABI();
    const rawTx = {
      to: contract.options.address,
      nonce: nonce,
      gas: '0x3d0900',
      //gasPrice: '0x0',
      value: '0x0',
      chainId: '0xa',
      data: abiTransactionData
    }
    let tx = await web3.eth.accounts.signTransaction(rawTx, '0x' + privateKey);

    return sendTx(web3, tx.rawTransaction);
  } catch (error) {
    console.log(error);
    throw (error)
  }
}

async function logDocument(web3, contract, SN, dataHash, timestamp, status, privateKey, nonce) {
  try {
    const abiTransactionData = contract.methods.log(SN, dataHash, timestamp, status).encodeABI();
    //const abiTransactionData = contract.methods.log().encodeABI();
    const rawTx = {
      to: contract.options.address,
      nonce: nonce,
      gas: '0x3d0900',
      //gasPrice: '0x0',
      value: '0x0',
      chainId: '0xa',
      data: abiTransactionData
    }
    let tx = await web3.eth.accounts.signTransaction(rawTx, '0x' + privateKey);
    return sendTx(web3, tx.rawTransaction);
  } catch (error) {
    console.log(error);
    throw (error);
  }
}

;(async function () {
  onePeriodTest()
  oneRoundTest()
})()