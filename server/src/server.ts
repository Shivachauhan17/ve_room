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
import roomRoutes from './routes/room'

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
app.use(json({limit: '50mb'})); // Parse JSON bodies
app.use(urlencoded({ extended: true }));
app.use(logger('dev'))
app.use(cors({
    origin:["http://localhost:3000"],
    credentials:true    
}))
app.use(cookieParser())

app.use('/',authRoutes)
app.post('/logout', (req, res) => {
  // Clear the cookie by setting it with an expired date
  res.cookie('access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0) // Set the cookie to expire in the past
  })
  .status(200)
  .send({ message: 'Logged out successfully' });
});

app.use(async (req:IRequest, res, next) => {
    const token = req.cookies.access_token;
    
    if (!token) {
      return res.sendStatus(403);
    }
    try {
      const data =await  jwt.verify(token, JWT_SECRET?JWT_SECRET:"Secret") as JwtPayload;
      console.log(data)
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

app.use("/rooms",roomRoutes);
app.get('/health',(req,res)=>{
    res.send("healthy")
})




export default app