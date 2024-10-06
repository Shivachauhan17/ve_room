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
const room_1 = __importDefault(require("../models/room"));
function generateUniqueHexCode() {
    // Generate a random number and convert it to a hexadecimal string
    const randomHex = Math.floor(Math.random() * 0xFFFFFF).toString(16);
    // Pad with leading zeros to ensure it is always 6 digits long
    return randomHex.padStart(6, '0').toUpperCase();
}
const controller = {
    createRoom: function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let code = generateUniqueHexCode();
                let isExist = yield room_1.default.find({ code: code });
                if (isExist) {
                    yield room_1.default.updateOne({ code: code }, { $set: { email: req.email } });
                }
                else {
                    const newRoom = new room_1.default({
                        email: req.email,
                        code: code,
                    });
                    yield newRoom.save();
                }
                res.status(200).json({ data: code });
            }
            catch (e) {
                console.log(e);
                res.status(500).json({ err: "error in making a new room." });
            }
        });
    },
    joinCall: function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { code } = req.body;
                if (!code) {
                    return res.status(400).json({ msg: null, err: "some of the field missing from the requests" });
                }
                const isOtp = yield room_1.default.findOne({ code: code, creatorEmail: req.email });
                if (!isOtp) {
                    return res.status(204).json({ msg: false });
                }
                return res.status(200).json({ msg: true });
            }
            catch (e) {
                console.log(e);
                res.status(500).json({ err: "error in joining the room." });
            }
        });
    }
};
exports.default = controller;
