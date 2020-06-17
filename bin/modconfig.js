// [ref_node_number, dir, model_name, node_number]
const fs = require('fs')
var config = require('/home/caideyi/benchmark_v2/configure.json')
const ref_node_number = parseInt(process.argv[2], 10)
var dir = process.argv[3]
var model_name = process.argv[4]
var node_number = parseInt(process.argv[5], 10)

if (isNaN(ref_node_number)) ref_dir = config.setting.micro_graph.ref_node
else ref_dir = `node${ref_node_number}/microData`

if (isNaN(node_number)) node_number = config.setting.node_num

if (isNaN(dir)) dir = config.setting.fail_dir

if (isNaN(model_name)) model_name = config.setting.model

console.log(ref_dir,dir,model_name,node_number)

config.setting.micro_graph.ref_node = ref_dir
config.setting.node_num = node_number
config.setting.fail_dir = dir
config.setting.model = model_name

fs.writeFileSync('/home/caideyi/benchmark_v2/configure.json', JSON.stringify(config, null, 2))
