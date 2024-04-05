import server from './server'
import {PORT} from './utils/config'
import {info,error} from './utils/logger'


server.listen( PORT,()=>{
    info(`Server is running on port ${PORT}`)
})