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
const passwordUtil_1 = require("../lib/passwordUtil");
const database_1 = __importDefault(require("../config/database"));
const controller = {
    signup: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password, confirmPassword } = req.body;
            if (!email || !password || !confirmPassword) {
                return res.status(404).json({ message: null, error: "data has not been sent correctly" });
            }
            const [rows, fields] = yield database_1.default.promise().query(`SELECT * FROM user WHERE email='${email}';`);
            if (rows.length > 0) {
                return res.status(203).json({ message: null, error: 'user Already exists' });
            }
            const saltAndHash = (0, passwordUtil_1.genPassword)(password);
            yield database_1.default.promise().query(`INSERT INTO user (email,password,salt) VALUES ('${email}','${saltAndHash.hash}','${saltAndHash.salt}');`);
            req.session.email = email;
            req.session.save(err => {
                if (err) {
                    return res.status(500).json({ message: null, error: "error in saving the data into session" });
                }
            });
            return res.status(200).json({ message: { email: email }, error: null });
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({ message: null, error: 'error occured somewhere in process Report it' });
        }
    }),
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(404).json({ message: null, error: "data has not been sent correctly" });
            }
            const [rows, fields] = yield database_1.default.promise().query(`SELECT * FROM user WHERE email='${email}'`);
            if (rows.length === 0) {
                return res.status(203).json({ message: null, error: 'no user found with this email' });
            }
            const user = rows[0];
            const compare = (0, passwordUtil_1.validPassword)(password, user.salt, user.password);
            if (compare) {
                req.session.email = email;
                req.session.save(err => {
                    if (err) {
                        return res.status(500).json({ message: null, error: "error in saving the data into session" });
                    }
                });
            }
            else {
                return res.status(203).json({ message: null, error: 'wrong credentials' });
            }
            return res.status(200).json({ message: { email: email }, error: null });
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({ message: null, error: 'error occured somewhere in process Report it' });
        }
    })
};
exports.default = controller;
