"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
const config_1 = require("./utils/config");
const logger_1 = require("./utils/logger");
server_1.default.listen(config_1.PORT, () => {
    (0, logger_1.info)(`Server is running on port ${config_1.PORT}`);
});
