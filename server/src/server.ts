import express,{Request} from 'express';
import connectDB from './utils/db';
import logger from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from "./utils/config"
import { JwtPayload } from 'jsonwebtoken';

dotenv.config({path:"./utils/.env"})

export interface IRequest extends Request{
    userId?:string;
    email?:string;
}

connectDB()

// var options = {
//     allowUpgrades: true,
//     transports: ['websocket', 'file', 'htmlfile', 'xhr-polling', 'jsonp-polling', 'polling'],
//     pingTimeout: 9000,
//     pingInterval: 3000,
//     httpCompression: true,
//     origins: '*:*' 
//   };
  

const app=express()
app.use(json()); // Parse JSON bodies
app.use(urlencoded({ extended: true }));
app.use(logger('dev'))
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true    
}))
app.use(cookieParser())

app.use('/',authRoutes)

app.use(async (req:IRequest, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
      return res.sendStatus(403);
    }
    try {
      const data =await  jwt.verify(token, JWT_SECRET?JWT_SECRET:"Secret") as JwtPayload;
      if(data){
        req.userId = data.id;
        req.email = data.email;
      }
      else{
        return res.status(401).json({msg:"Unauthorized"})
      }
      return next();
    } catch {
      return res.sendStatus(500);
    }
  })

app.get('/health',(req,res)=>{
    res.send("healthy")
})


export default app