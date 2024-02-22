"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const express_session_1 = __importDefault(require("express-session"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: 'http://localhost:5173',
    }
});
dotenv_1.default.config({ path: './.env' });
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use((0, morgan_1.default)('dev'));
const rooms = {};
const users = {};
io.on('connection', (socket) => {
    console.log(' a user connected' + socket.id);
    socket.on("join", (params) => {
        const roomId = params.roomId;
        users[socket.id] = {
            roomId: roomId
        };
        if (!rooms[roomId]) {
            rooms[roomId] = {
                roomId,
                users: []
            };
        }
        rooms[roomId].users.push(socket.id);
        console.log("user added to room " + roomId);
    });
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
});
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
// app.set("trust proxy", 1);
if (process.env.DB_STRING !== undefined) {
    app.use((0, express_session_1.default)({
        secret: 'micky',
        resave: false,
        saveUninitialized: true,
        store: connect_mongo_1.default.create({
            mongoUrl: process.env.DB_STRING,
            collectionName: 'sessions'
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            // secure:true,
            // sameSite:'none'
        }
    }));
}
app.use('/', (req, res, next) => {
    console.log(req.session.email);
    next();
});
app.use('/', auth_1.default);
app.listen(3001, () => {
    console.log('server is running you better catch it');
});
