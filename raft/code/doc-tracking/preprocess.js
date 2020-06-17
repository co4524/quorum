const Web3 = require('web3');
const config = require('../../../configure.json')
const api = require(`../../../quorum/lib/api.js`)
const documentContractConfig = require("../contract/documentContract.json");
const ws_port = config.setting.port.web_socket
const web3 = new Web3(new Web3.providers.WebsocketProvider(`http://${config['raft'].nodeIp[0]}:${ws_port}`));
const pubKey_list = Object.keys(require(config.quorum.path.account))
const private_key_list = Object.values(require(config.quorum.path.account))
const register_raw_tx = require(config.raft.doc.register_v2)
const contractAddress = '0x24f2e2a8918F252345163a1a39368E5531EB814C'
const raw_tx_num = parseInt(process.argv[2], 10)
const batch_size = 100


;(async function main() {

    let deployContract = new web3.eth.Contract(documentContractConfig.ABI);
    let contract = new web3.eth.Contract(documentContractConfig.ABI, contractAddress)
    let receipt = await deploy(deployContract, pubKey_list[0] , documentContractConfig.byteCode, private_key_list[0]);
    console.log(receipt)

    await api.sendTx(web3, register_raw_tx[0])

    for (let i = 0 ; i < raw_tx_num/batch_size ; i ++){
        let index = batch_size*i
        let res = []
        for (let j = 0 ; j < batch_size; j ++){
            res[j] = api.sendTx(web3, register_raw_tx[index+j+1])
        }
        await Promise.all(res)
        console.log("register account",batch_size*(i+1))
    }

    await createDocument(contract, '1', '1', 'dataHash', Date.now(), private_key_list[1])
    web3.currentProvider.connection.close()
})()

async function createDocument(contract, receiver_EID, SN, dataHash, timestamp, privateKey) {
    try {
      const abiTransactionData = contract.methods.create(receiver_EID, SN, dataHash, timestamp).encodeABI();
      const rawTx = {
        to: contract.options.address,
        nonce: 0,
        gas: '0x3d0900',
        //gasPrice: '0x0',
        value: '0x0',
        chainId: '0xa',
        data: abiTransactionData
      }
      let tx = await web3.eth.accounts.signTransaction(rawTx, '0x' + privateKey);
  
      return sendSignedTransaction(tx.rawTransaction)
    } catch (error) {
      console.log(error);
      throw (error)
    }
  }

async function deploy(contract, address, byteCode, privateKey) {
    try {
      const rawTx = {
        to: contract.options.address,
        nonce: await web3.eth.getTransactionCount(address),
        gas: '0x3d0900',
        //gasPrice: '0x0',
        value: '0x0',
        chainId: '0xa',
        data: `0x${byteCode}`
      }
      let tx = await web3.eth.accounts.signTransaction(rawTx, '0x' + privateKey);
  
      return (await sendSignedTransaction(tx.rawTransaction));
    } catch (error) {
      console.log(error);
      throw (error)
    }
}

function sendSignedTransaction(rawTransaction) {
    return new Promise((resolve, reject) => {
        web3.eth.sendSignedTransaction(rawTransaction)
        .on('transactionHash', (hash) => {
            console.log(`transaction hash: ${hash}`);
        })
        .on('receipt', (receipt) => {
            console.log(`contract address: ${receipt.contractAddress}`);
            resolve(receipt)
        })
        .on('error', (error) => {
            console.log(error);
            reject(error);
        })
    });
}
