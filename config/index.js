import configProd from './prod.js'
import configDev from './dev.js'


export var config

console.log('process.env.NODE_ENV', process.env.NODE_ENV)

if ( process.env.NODE_ENV === 'production') {
  config = configProd
  console.log('configProd', configProd)
} else {
  config = configProd
  console.log('configDev', process.env.NODE_ENV )
}
// config.isGuestMode = true


