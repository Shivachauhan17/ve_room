import express,{Request, Response, NextFunction,Application} from 'express';

import MongoStore from 'connect-mongo';
import cors from 'cors';
import connectDB from './config/database';
import logger from 'morgan';
import session from 'express-session';
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import { CustomRequest } from './controllers/auth';


const app:Application=express()

dotenv.config({path:'./.env'})


app.use(logger('dev'))
app.use(cors({
    origin:'*',
    credentials:true
}))

app.use(express.urlencoded({extended:true}))
app.use(express.json())
// app.set("trust proxy", 1);

if(process.env.DB_STRING!==undefined){

    app.use(session({
        secret:'micky',
        resave:false,
        saveUninitialized:true,
        store:MongoStore.create({
            mongoUrl:process.env.DB_STRING as string,
            collectionName:'sessions'
        }),
        cookie:{
            maxAge:1000*60*60*24,
            // secure:true,
            // sameSite:'none'
        }
    }))
}
app.use('/',(req:CustomRequest,res:Response,next:NextFunction)=>{
    console.log(req.session.email)
    next()
})

app.use('/',authRoutes)

app.listen(8000,()=>{
    console.log('server is running you better catch it')
})

