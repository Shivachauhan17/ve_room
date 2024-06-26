"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const db_1 = __importDefault(require("./utils/db"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const express_2 = require("express");
dotenv_1.default.config({ path: "./utils/.env" });
(0, db_1.default)();
// var options = {
//     allowUpgrades: true,
//     transports: ['websocket', 'file', 'htmlfile', 'xhr-polling', 'jsonp-polling', 'polling'],
//     pingTimeout: 9000,
//     pingInterval: 3000,
//     httpCompression: true,
//     origins: '*:*' 
//   };
const app = (0, express_1.default)();
app.use((0, express_2.json)()); // Parse JSON bodies
app.use((0, express_2.urlencoded)({ extended: true }));
app.use((0, morgan_1.default)('dev'));
app.use((0, cors_1.default)({
    origin: "*"
}));
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
    },
    pingTimeout: 60000
});
const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();
io.on("connection", (socket) => {
    console.log(socket.id);
    socket.on("room:join", (data) => {
        console.log(data);
        const { email, room } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketidToEmailMap.set(socket.id, email);
        io.to(room).emit("user:joined", { email, id: socket.id });
        socket.join(room);
        io.to(socket.id).emit("room:join", data);
    });
    socket.on("user:call", ({ to, offer }) => {
        io.to(to).emit("incomming:call", { from: socket.id, offer });
    });
    socket.on("call:accepted", ({ to, ans }) => {
        io.to(to).emit("call:accepted", { from: socket.id, ans });
    });
    socket.on("peer:nego:needed", ({ to, offer }) => {
        console.log("peer nego needed", offer);
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    });
    socket.on("peer:nego:done", ({ to, ans }) => {
        console.log("peer nego done", ans);
        io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    });
    socket.on("verify", (room) => {
        const initiatorEmail = socketidToEmailMap.get(socket.id);
        let email = null;
        for (const [socketId, emailjoiner] of socketidToEmailMap.entries()) {
            if (socketId !== socket.id) {
                email = emailjoiner;
            }
        }
        io.to(emailToSocketIdMap.get(initiatorEmail)).emit("verify", { email, initiatorEmail });
    });
    socket.on("verifyAudio", (room) => {
        const initiatorEmail = socketidToEmailMap.get(socket.id);
        let email = null;
        for (const [socketId, emailjoiner] of socketidToEmailMap.entries()) {
            if (socketId !== socket.id) {
                email = emailjoiner;
            }
        }
        io.to(emailToSocketIdMap.get(initiatorEmail)).emit("verifyAudio", { email, initiatorEmail });
    });
});
app.use('/', auth_1.default);
exports.default = app;
