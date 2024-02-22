import express,{Request, Response, NextFunction,Application} from 'express';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import connectDB from './config/database';
import logger from 'morgan';
import session from 'express-session';
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import { CustomRequest } from './controllers/auth';
import http from 'http'
import {Server} from 'socket.io'

const app:Application=express()
const server=http.createServer(app)
const io=new Server(server,{
    cors:{
        origin:'http://localhost:5173',
    }
})

dotenv.config({path:'./.env'})

app.use(cors({
    origin:'http://localhost:5173',
        credentials:true
}))
app.use(logger('dev'))

interface Room {
        roomId:string
        users: string[] 
    
}

interface IUser{
    [id:string]:{
        roomId:string
    }
}



interface Rooms {
    [roomId: string]: Room;
}

const rooms:Rooms = {};
const users:IUser = {};

io.on('connection',(socket)=>{
    console.log(' a user connected'+socket.id);
    
    socket.on("join",(params)=>{
        const roomId=params.roomId
        users[socket.id]={
            roomId:roomId
        }
        if(!rooms[roomId]){
            rooms[roomId]={
                roomId,
                users:[]
            }
        }
        rooms[roomId].users.push(socket.id);
        console.log("user added to room " + roomId);
    })

    // socket.on("localDescription",(params)=>{
    //     let roomId=users[socket.id].roomId;
    //     let otherUsers=rooms[roomId].users;
    //     otherUsers.forEach(otherUser=>{
    //         if(otherUser!==socket.id){
    //             io.to(otherUser).emit("localDescription",{
    //                 description:params.description
    //             })
    //         }
    //     })
    // })

    // socket.on("remoteDescription",(params)=>{
    //     let roomId=users[socket.id].roomId;
    //     let otherUsers=rooms[roomId].users
    //     otherUsers.forEach(otherUser=>{
    //         if(otherUser!==socket.id){
    //             io.to(otherUser).emit("remoteDescription",{
    //                 description:params.description
    //             })
    //         }
    //     })
    // })

    // socket.on("iceCandidate",(params)=>{
    //     let roomId=users[socket.id].roomId
    //     let otherUsers=rooms[roomId].users

    //     otherUsers.forEach(otherUser=>{
    //         if(otherUser!==socket.id){
    //             io.to(otherUser).emit("iceCandidate",{
    //                 candidate:params.candidate
    //             })
    //         }
    //     })
    // })

    // socket.on("iceCandidateReply",(params)=>{
    //     let roomId=users[socket.id].roomId
    //     let otherUsers=rooms[roomId].users
    //     otherUsers.forEach(otherUser=>{
    //         if(otherUser!==socket.id){
    //             io.to(otherUser).emit("iceCadidateReply",{
    //                 candidate:params.candidate
    //             })
    //         }
    //     })
    // })

})

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

app.listen(3001,()=>{
    console.log('server is running you better catch it')
})

