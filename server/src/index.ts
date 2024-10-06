import server from './server'
import {info,error} from './utils/logger'



server.listen( 8000,()=>{
    info(`Server is running on port ${8000}`)
})