const fs = require('fs')
const stats = require("stats-lite") 

const [BLOCK_SIZE,INPUT_RATE, DURATION_TIME] = process.argv.slice(2, 5).map(it => parseInt(it))
const REPEAT = 1
const TEST_TIME = 1
const node_num = 4


for (let i = 1; i <= REPEAT; i++) {
  let latency = [], tps = []

  let post_process = require(`/home/caideyi/report/tendermint${BLOCK_SIZE}/R${INPUT_RATE}-T${DURATION_TIME}/rec_data/report${TEST_TIME}.json`)
  //let post_process = require(`${config[CONSENSUS].path.post_process}/${THREAD_NUM}THREAD-${config.tendermint.urls.length}NODE/Rate${INPUT_RATE}-Sec${DURATION_TIME}-Test${i}.json`)
  let block = Object.keys(post_process).map(it => {
    return parseInt(it.split('_')[1])
  })
  block.sort(function(a, b) {
    return a - b;
  });
  

  for (let j = 1, k = block.length-1; j < k; j++) {  //block.length - 1 for normal situation , block.length for short duration time
    let txs = post_process[`block_${block[j]}`].transactions
    let arr =[]
    for(let l = 0 ; l < node_num ; l ++){
      let time = post_process[`block_${block[j]}`].timestamp[l]
      let time2 = post_process[`block_${block[j - 1]}`].timestamp[l]
      let dtime = time[`node${l}`] - time2[`node${l}`]
      arr.push(time[`node${l}`])
      tps.push(1000 * (txs.length / (dtime)))
    }
    for (let tx of txs) {
      let tx_timestamp = tx.split(',')[1]/1000000
      let time_med = stats.median(arr)
      latency.push(time_med - tx_timestamp) // millisecond
    }
  }

  console.log(`Testing${i} Rate${INPUT_RATE} DurationTime${DURATION_TIME}`)
  console.log(`Tps     , mean:${stats.mean(tps)}, var:${stats.variance(tps)}`)
  console.log(`Latency , mean:${stats.mean(latency)} ms, var:${stats.variance(latency)}\n`)
}
