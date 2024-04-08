import server from './server'
// import {PORT} from './utils/config'
import {info,error} from './utils/logger'



server.listen( 5000,()=>{
    info(`Server is running on port ${5000}`)
})