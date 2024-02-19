"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const cors_1 = __importDefault(require("cors"));
const database_1 = __importDefault(require("./config/database"));
const morgan_1 = __importDefault(require("morgan"));
const express_session_1 = __importDefault(require("express-session"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
(0, database_1.default)();
const app = (0, express_1.default)();
dotenv_1.default.config({ path: './.env' });
app.use((0, morgan_1.default)('dev'));
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true
}));
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
app.listen(8000, () => {
    console.log('server is running you better catch it');
});
