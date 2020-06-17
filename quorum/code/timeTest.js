const config = require('../../configure.json')
let year = config.setting.year
let time = []
process.argv.slice(2, 8).map( (it, index ) => {
    time[index] = it
})

console.log(`${new Date(`${year}-${time[0]}-${time[1]}T${time[2]}:${time[3]}:${time[4]}.${time[5]}`).valueOf()}`)