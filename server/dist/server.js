"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./utils/config");
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
    origin: "http://localhost:5173",
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
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
app.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.access_token;
    if (!token) {
        return res.sendStatus(403);
    }
    try {
        const data = yield jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET ? config_1.JWT_SECRET : "Secret");
        if (data) {
            req.userId = data.id;
            req.email = data.email;
        }
        else {
            return res.status(401).json({ msg: "Unauthorized" });
        }
        return next();
    }
    catch (_a) {
        return res.sendStatus(500);
    }
}));
app.get('/health', (req, res) => {
    res.send("healthy");
});
server.listen(5000, () => {
    console.log(`Signaling server is open at ${5000}`);
});
exports.default = app;
