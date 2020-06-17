const API = require('../lib/rpc.js')
const config = require('../../configure.json')
const raw_tx_hash = require(config.tendermint.path.raw_tx_hash)
const fs = require('fs')

const out_put_node = ["node0" , "node1" ,"node2" ,"node3" ]

const [NODE_NUM ,INPUT_RATE , SLICE] = process.argv.slice(2, 5).map(it => parseInt(it))
const raw_txs = Object.keys(raw_tx_hash).slice(SLICE,SLICE+INPUT_RATE) // SLICE for testing
const app = {
	start: 0 ,
	end: INPUT_RATE
}
// ;(async function () {
// 	let time = []
// 	console.log(Date.now(), app.start, app.end, ' STARTED')

// 	for (let i = 0; i < app.end; i++) {
// 		time[i] = API.sendTx(config.tendermint.urls[i%NODE_NUM], raw_txs[app.start++])   // i%config.tendermint.urls.length
// 	}
// 	await Promise.all(time)
// 	console.log(JSON.parse(time[1]))
// 	console.log(Date.now(), app.start, app.end, ' FINISHED')
// })()

//console.log(`Testing ${NODE_NUM}NODE,Rate ${INPUT_RATE}`)
;(async function () {
	console.log(Date.now() , ' STARTED')
	var receipts = await Promise.all(raw_txs.map((txs, i) => {
			if(i==raw_txs.length-1) console.log(Date.now(), ' END')
			return API.sendTx(config.tendermint.urls[i % NODE_NUM], txs)
		}))

	var count=0
	var time = []
	for( let i =0 ; i < NODE_NUM ; i++) {
		count=0
		time = []
		log = ''
		for( let j =i ; j < raw_txs.length ; j+=NODE_NUM) {
			if(j<raw_txs.length){
				let res = JSON.parse(receipts[j])
				time.push(res.result.time)
				log += `${res.result.time}\n`
				if(res.result.hash===raw_tx_hash[raw_txs[j]]) count++
			}
		}
		time.sort(function (a, b) {
			return a - b
		});
		fs.appendFileSync(out_put_node[i], log)
		//console.log(`Node ${i} Same:${count} ${time[0]},${time[time.length-1]}\nDurationTime: ${(parseInt(time[time.length-1])-parseInt(time[0]))/1000} `)
	}
	// for (let i in raw_txs) {
	// 	let res = JSON.parse(receipts[i])
	// 	time.push(res.result.time)
	// 	if(res.result.hash===raw_tx_hash[raw_txs[i]]) count++
	//   }
	// console.log(`Same:${count}`)
	// time.sort(function (a, b) {
	// 	return a - b
	// });
	// console.log(time[0], time[time.length-1])
})()
