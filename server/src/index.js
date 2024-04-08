"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
// import {PORT} from './utils/config'
const logger_1 = require("./utils/logger");
server_1.default.listen(5000, () => {
    (0, logger_1.info)(`Server is running on port ${5000}`);
});
