const fs = require('fs')
var config = require('/home/caideyi/benchmark_v2/configure.json')
const region = {
	"local": {
		"asia-east1-b": "10.140.2",
	},
	"global": {
		"asia-east1-b": "10.140.1",
		"asia-southeast1-b": "10.148.1",
		"europe-west1-b": "10.132.1",
		"us-east1-b": "10.142.1"
	}
}
const consensus = config.setting.consensus
const node_num = parseInt(config.setting.node_num, 10)
const region_setting = config.setting.region  // local , global
const ip = Object.values(region[region_setting]) 

config.region = region[region_setting]
config[consensus].urls = []
config[consensus].nodeIp = []
for (let i = 0 ; i < node_num ; i ++){
	config[consensus].urls.push(`http://${ip[i%ip.length]}.${parseInt(i/ip.length, 10)}:26657`)
	config[consensus].nodeIp.push(`${ip[i%ip.length]}.${parseInt(i/ip.length, 10)}`)
}

fs.writeFileSync('/home/caideyi/benchmark_v2/configure.json', JSON.stringify(config, null, 2))
