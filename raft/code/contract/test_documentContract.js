const Web3 = require('web3');
const documentContractConfig = require("./documentContract.json");
const config = require('../../../configure.json')
const ws_port = config.setting.port.web_socket
const web3 = new Web3(new Web3.providers.WebsocketProvider(`http://${config['raft'].nodeIp}:${ws_port}`));
const pubKey_list = Object.keys(require(config.quorum.path.account))
const private_key_list = Object.values(require(config.quorum.path.account))

;(async function main() {
  let deployContract = new web3.eth.Contract(documentContractConfig.ABI);

  let receipt = await deploy2(deployContract, pubKey_list[0] , documentContractConfig.byteCode, private_key_list[0]);
  console.log(receipt);
  // let contractAddress = receipt.contractAddress;
  let contractAddress = '0x24f2e2a8918F252345163a1a39368E5531EB814C'
  // return true
  let contract = new web3.eth.Contract(documentContractConfig.ABI, contractAddress);
  await register2(contract, 'ABC', '0xfec97232e929de4c52ce58912fb8ebad93d1c470', pubKey_list[0], private_key_list[0]);
  await register2(contract, 'DEF', '0x8d4f5a2724e1f39e9611b19ec1181b099fc798a7', pubKey_list[0], private_key_list[0]);
  return true
  //0xfec97232e929de4c52ce58912fb8ebad93d1c470 (address)
  await createDocument(contract, 'DEF', '0001', '0xwfjweojfepowjf', Date.now(), '0xfec97232e929de4c52ce58912fb8ebad93d1c470', 'd2d688b5db65eec54372bad58e40128bfa624fd7510d2276ee6836cb4fb9df73');
  console.log(await contract.methods.retrieveDocumentLog('0001', 0).call());
  console.log(await contract.methods.retrieveDocumentSNByIndex(0).call());
  //0x129443bc9bf529e5ccf5447b5a2e356fd65d0684 (address)
  await logDocument(contract, '0001', '0xwfjweojfepowjf', Date.now(), 0, '0xfec97232e929de4c52ce58912fb8ebad93d1c470', 'd2d688b5db65eec54372bad58e40128bfa624fd7510d2276ee6836cb4fb9df73');
  console.log(await contract.methods.retrieveDocumentLogLength('0001').call());
  console.log(await contract.methods.retrieveDocumentLog('0001',1).call());

})()

async function deploy2(contract, address, byteCode, privateKey) {
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

async function deploy(contract, address, byteCode) {
  return new Promise((resolve, reject) => {
    contract.deploy({ data: '0x' + byteCode }).send({
      from: address,
      gas: '0x3d0900'
    })
      .on('transactionHash', (hash) => {
        console.log(hash);
      })
      .on('receipt', (receipt) => {
        resolve(receipt);
      })
      .on('error', (error) => {
        reject(error);
      })
  });
}

async function register2(contract, EID, EAddress, address, privateKey) {

  try {
    const abiTransactionData = contract.methods.register(EID, EAddress).encodeABI();
    const rawTx = {
      to: contract.options.address,
      nonce: 1,//await web3.eth.getTransactionCount(address),
      gas: '0x3d0900',
      //gasPrice: '0x0',
      value: '0x0',
      chainId: '0xa',
      data: abiTransactionData
    }
    let tx = await web3.eth.accounts.signTransaction(rawTx, '0x' + privateKey);
    return console.log(tx.rawTransaction)
    //await sendSignedTransaction(tx.rawTransaction)
  } catch (error) {
    console.log(error);
    throw (error)
  }

}

async function register(contract, EID, EAddress, address) {
  return new Promise((resolve, reject) =>
    contract.methods.register(EID, EAddress).send({
      from: address,
      gas: '0x3d0900',
      //gasPrice: '0x0'
    })
      .on('transactionHash', (hash) => {
        console.log(hash);
      })
      .on('receipt', (receipt) => {
        resolve(true);
      })
      .on('error', (error) => {
        reject(error);
      })
  )
}

async function createDocument(contract, receiver_EID, SN, dataHash, timestamp, address, privateKey) {
  try {
    const abiTransactionData = contract.methods.create(receiver_EID, SN, dataHash, timestamp).encodeABI();
    const rawTx = {
      to: contract.options.address,
      nonce: await web3.eth.getTransactionCount(address),
      gas: '0x3d0900',
      //gasPrice: '0x0',
      value: '0x0',
      chainId: '0xa',
      data: abiTransactionData
    }
    let tx = await web3.eth.accounts.signTransaction(rawTx, '0x' + privateKey);

    await sendSignedTransaction(tx.rawTransaction);
  } catch (error) {
    console.log(error);
    throw (error)
  }
}

async function logDocument(contract, SN, dataHash, timestamp, status, address, privateKey) {
  try {
    const abiTransactionData = contract.methods.log(SN, dataHash, timestamp, status).encodeABI();
    //const abiTransactionData = contract.methods.log().encodeABI();
    const rawTx = {
      to: contract.options.address,
      nonce: await web3.eth.getTransactionCount(address),
      gas: '0x3d0900',
      //gasPrice: '0x0',
      value: '0x0',
      chainId: '0xa',
      data: abiTransactionData
    }
    let tx = await web3.eth.accounts.signTransaction(rawTx, '0x' + privateKey);
    await sendSignedTransaction(tx.rawTransaction);
  } catch (error) {
    console.log(error);
    throw (error);
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