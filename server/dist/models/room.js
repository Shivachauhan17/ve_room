"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const roomSchema = new mongoose_1.default.Schema({
    creatorEmail: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        length: 6
    }
});
const Room = mongoose_1.default.model("Room", roomSchema);
exports.default = Room;
