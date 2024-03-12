import express from 'express'
import http from 'http'
import {Server, Socket} from 'socket.io'


const app=express()
const server=http.createServer(app)
const io=new Server(server)

interface IMessage{
    channel:string,
    message:string
}


io.on('connection',socket=>{
    socket.on('message',function(message:IMessage){
        socket.broadcast.to(message.channel).emit('message',message.message)
    })

    socket.on('create or join',(room)=>{
        const numClients=io.sockets.adapter.rooms.get(room)?.size || 0
        console.log('number of clients in the socket is',numClients)

        if(numClients===0){
            socket.join(room)
            console.log("added first client")
            socket.emit('created',room)
        }else if (numClients===1){
            io.sockets.in(room).emit('join',room)
            socket.join(room)
            socket.emit('joined',room)
            console.log("added second client")
        }else{
            socket.emit('full',room)
        }
    })
})

app.listen(8181,()=>{
    console.log("server is running on port 8181")
})

server.listen(8001,()=>{
    console.log("socket server is connected to 8001")
})



