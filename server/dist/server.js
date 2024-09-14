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
app.use((0, express_2.json)({ limit: '50mb' })); // Parse JSON bodies
app.use((0, express_2.urlencoded)({ extended: true }));
app.use((0, morgan_1.default)('dev'));
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use('/', auth_1.default);
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
exports.default = app;
