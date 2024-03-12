"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
io.on('connection', socket => {
    socket.on('message', function (message) {
        socket.broadcast.to(message.channel).emit('message', message.message);
    });
    socket.on('create or join', (room) => {
        var _a;
        const numClients = ((_a = io.sockets.adapter.rooms.get(room)) === null || _a === void 0 ? void 0 : _a.size) || 0;
        console.log('number of clients in the socket is', numClients);
        if (numClients === 0) {
            socket.join(room);
            console.log("added first client");
            socket.emit('created', room);
        }
        else if (numClients === 1) {
            io.sockets.in(room).emit('join', room);
            socket.join(room);
            socket.emit('joined', room);
            console.log("added second client");
        }
        else {
            socket.emit('full', room);
        }
    });
});
app.listen(8181, () => {
    console.log("server is running on port 8181");
});
server.listen(8001, () => {
    console.log("socket server is connected to 8001");
});
