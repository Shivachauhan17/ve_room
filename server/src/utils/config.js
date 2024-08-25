"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = exports.DB_STRING = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PORT = process.env.PORT;
exports.DB_STRING = process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGO_URI
    : process.env.DB_STRING;
exports.JWT_SECRET = process.env.TOKEN_SECRET;
