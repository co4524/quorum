const Web3 = require('web3');
const fs = require('fs')
const documentContractConfig = require("../contract/documentContract.json");
const config = require('../../../configure.json')
const ws_port = config.setting.port.web_socket
const web3 = new Web3(new Web3.providers.WebsocketProvider(`http://${config['raft'].nodeIp[0]}:${ws_port}`));
const pubKey_list = Object.keys(require(config.quorum.path.account))
const private_key_list = Object.values(require(config.quorum.path.account))
const contractAddress = '0x24f2e2a8918F252345163a1a39368E5531EB814C'
const raw_transaction_number = config.setting.transaction_rate[config.setting.transaction_rate.length-1]+1   //1 for createDoc SN

;(async function main() {

    let contract = new web3.eth.Contract(documentContractConfig.ABI, contractAddress)
    nonce = await web3.eth.getTransactionCount(pubKey_list[0])
    nonce = 1

    let rawTx = []
    for (let i = 0 ; i < raw_transaction_number ; i ++){

        let EID = `${i+1}`
        let res = await register(contract, EID, pubKey_list[1+i], private_key_list[0], nonce++)
        rawTx.push(res)
        if(i%1000==0) console.log("gen_registerRawTx", i)
    }
    fs.writeFileSync(config.raft.doc.register_v2, JSON.stringify(rawTx))

})()

async function register(contract, EID, EAddress, privateKey, nonce) {

    try {
      const abiTransactionData = contract.methods.register(EID, EAddress).encodeABI();
      const rawTx = {
        to: contract.options.address,
        nonce: nonce,//await web3.eth.getTransactionCount(address),
        gas: '0x3d0900',
        //gasPrice: '0x0',
        value: '0x0',
        chainId: '0xa',
        data: abiTransactionData
      }
      let tx = await web3.eth.accounts.signTransaction(rawTx, '0x' + privateKey);
      return tx.rawTransaction
      //await sendSignedTransaction(tx.rawTransaction)
    } catch (error) {
      console.log(error);
      throw (error)
    }
  
  }

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

    return tx.rawTransaction;
  } catch (error) {
    console.log(error);
    throw (error)
  }
}

async function logDocument(contract, SN, dataHash, timestamp, status, privateKey) {
  try {
    const abiTransactionData = contract.methods.log(SN, dataHash, timestamp, status).encodeABI();
    //const abiTransactionData = contract.methods.log().encodeABI();
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
    return tx.rawTransaction
  } catch (error) {
    console.log(error);
    throw (error);
  }
}
