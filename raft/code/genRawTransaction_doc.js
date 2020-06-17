const Web3 = require('web3');
const fs = require('fs')
const documentContractConfig = require("./contract/documentContract.json");
const config = require('../../configure.json')
const ws_port = config.setting.port.web_socket
const web3 = new Web3(new Web3.providers.WebsocketProvider(`http://${config['raft'].nodeIp[0]}:${ws_port}`));
const pubKey_list = Object.keys(require(config.quorum.path.account))
const private_key_list = Object.values(require(config.quorum.path.account))
const contractAddress = '0x24f2e2a8918F252345163a1a39368E5531EB814C'
const raw_transaction_number = pubKey_list.length - 1 

;(async function main() {

    let contract = new web3.eth.Contract(documentContractConfig.ABI, contractAddress)
    let pubKey_list_length = pubKey_list.length - 1
    nonce = await web3.eth.getTransactionCount(pubKey_list[0])
    nonce = 1

    let rawTx = []
    let num = 0
    for (let i = 0 ; i < raw_transaction_number ; i ++){
        if(i%2==0) num = (i/2)
        else num = parseInt(i/2)
        let index = ((pubKey_list_length/2)*(i%2))+num
        let EID = `${index+1}`
        let res = await register(contract, EID, pubKey_list[1+index], private_key_list[0], nonce++)
        rawTx.push(res)
        if(i%1000==0) console.log("gen_registerRawTx", i)
    }
    fs.writeFileSync(config.raft.doc.register, JSON.stringify(rawTx))


    rawTx = []
    for (let i = 0 ; i < raw_transaction_number/2 ; i ++){
        let SN = `${i+1}`
        let EID = `${i+(pubKey_list_length/2)+1}`
        let res = await createDocument(contract, EID, SN, 'datahash', Date.now(), private_key_list[i+1]);
        rawTx.push(res)
        if(i%1000==0) console.log("gen_createRawtx", i)
    }
    fs.writeFileSync(config.raft.doc.create_rawTx, JSON.stringify(rawTx))

    rawTx = []
    let target_SN = 1
    for (let i = 0 ; i < raw_transaction_number/2 ; i ++){
      let res = await logDocument(contract, `${target_SN}`, 'datahash', Date.now(), 0, private_key_list[(pubKey_list_length/2)+i+1]);
      rawTx.push(res)
      if(i%1000==0) console.log("gen_logRawtx", i)
    }
    fs.writeFileSync(config.raft.doc.log_rawTx, JSON.stringify(rawTx))
    console.log("done")

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
