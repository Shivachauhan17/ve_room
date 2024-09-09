import { WebSocket, WebSocketServer } from 'ws';
import http from 'http';
import express from 'express'

const app=express()
const PORT=5000
const server = http.createServer(app);



const wss = new WebSocketServer({ server});

let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data: any) {
    const message = JSON.parse(data);
    if (message.type === 'sender') {
      console.log("sender ws:",ws)
      senderSocket = ws;
    } else if (message.type === 'receiver') {
      console.log("receiver ws:",ws)
      receiverSocket = ws;
    } else if (message.type === 'createOffer') {
      console.log("create Offer")
      if (ws !== senderSocket) {
        return;
      }
      receiverSocket?.send(JSON.stringify({ type: 'createOffer', sdp: message.sdp }));
    } else if (message.type === 'createAnswer') {
      console.log("create Answer")
        if (ws !== receiverSocket) {
          return;
        }
        senderSocket?.send(JSON.stringify({ type: 'createAnswer', sdp: message.sdp }));
    } else if (message.type === 'iceCandidate') {
      if (ws === senderSocket) {
        console.log("ice candidate from sender")
        receiverSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
      } else if (ws === receiverSocket) {
        console.log("ice candidate from receiver")
        senderSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
      }
    }
  });
});

server.listen(PORT,()=>{console.log(`web socket server started at ${PORT}`)})