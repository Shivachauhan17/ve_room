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
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../utils/config");
const controller = {
    register: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { username, name, password, confirmPassword } = req.body;
            if (!username || !name || !password || !confirmPassword)
                return res.status(400).json({ msg: null, err: "some of the field missing from the requests" });
            if (password !== confirmPassword)
                return res.status(400).json({ msg: null, err: "password and confirmpassword field value is not the same" });
            const userExist = yield user_1.default.findOne({ username: username });
            if (userExist)
                return res.status(409).json({ msg: null, err: "user Already exists" });
            const saltRounds = 10;
            const passwordHash = yield bcrypt_1.default.hash(password, 50);
            const user = new user_1.default({
                username,
                name,
                passwordHash
            });
            const savedUser = yield user.save();
            const userForToken = {
                username: savedUser.username,
                id: savedUser._id,
            };
            let token = null;
            if (config_1.JWT_SECRET !== undefined)
                token = jsonwebtoken_1.default.sign(userForToken, config_1.JWT_SECRET);
            res.status(200).send({ token, username: user.username, name: user.name });
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({});
        }
    }),
    login: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { username, password } = req.body;
            if (!username || !password)
                return res.status(400).json({ msg: null, err: "some of the field missing from the requests" });
            const user = yield user_1.default.findOne({ username: username });
            const passwordCorrect = user === null ? false : yield bcrypt_1.default.compare(password, user.passwordHash);
            if (!(user && passwordCorrect)) {
                return res.status(401).json({
                    error: 'invalid username or password'
                });
            }
            const userForToken = {
                username: user.username,
                id: user._id,
            };
            let token = null;
            if (config_1.JWT_SECRET !== undefined)
                token = jsonwebtoken_1.default.sign(userForToken, config_1.JWT_SECRET);
            res
                .status(200)
                .send({ token, username: user.username, name: user.name });
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({});
        }
    })
};
exports.default = controller;
