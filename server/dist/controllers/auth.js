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
exports.writeBase64Data = void 0;
const user_1 = __importDefault(require("../models/user"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../utils/config");
const crypto_1 = require("../utils/crypto");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function writeBase64Data(image, email, count) {
    return __awaiter(this, void 0, void 0, function* () {
        const matches = image.match(/^data:(image\/(png|jpeg|jpg));base64,(.+)$/);
        if (!matches) {
            throw Error("corrupted image");
        }
        const mimeType = matches[1];
        const fileExtension = mimeType.split('/')[1];
        const rootDir = path_1.default.resolve(__dirname, '../../');
        const dirPath = path_1.default.join(rootDir, "images", email);
        fs_1.default.mkdirSync(dirPath, { recursive: true });
        const filePath = path_1.default.join(dirPath, `${count}.${fileExtension}`);
        console.log("filePath:", filePath);
        const cleanBase64 = matches[3];
        fs_1.default.writeFileSync(filePath, cleanBase64, { encoding: 'base64' });
        return;
    });
}
exports.writeBase64Data = writeBase64Data;
const controller = {
    register: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { name, email, password, mobileNumber, image } = req.body;
            if ((!name || !email || !password || !mobileNumber) || (mobileNumber.length !== 10) || !image)
                return res.status(400).json({ msg: null, err: "some of the field missing from the requests" });
            yield writeBase64Data(image, email, "1");
            const userExist = yield user_1.default.findOne({ email: email });
            if (userExist)
                return res.status(401).json({ msg: null, err: "user Already exists" });
            const { hash, salt } = (0, crypto_1.genPassword)(password);
            const user = new user_1.default({
                name: name,
                email: email,
                passwordHash: hash,
                mobileNumber: mobileNumber,
                salt: salt
            });
            const savedUser = yield user.save();
            const userForToken = {
                email: savedUser.email,
                id: savedUser.id,
            };
            let token = null;
            token = jsonwebtoken_1.default.sign(userForToken, config_1.JWT_SECRET ? config_1.JWT_SECRET : "Secret");
            if (!token) {
                return res.status(500).json({ msg: null, err: "Authorization Assignment failed." });
            }
            res.cookie("access_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            }).status(200).send({ name: name, email: email });
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({});
        }
    }),
    login: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            if (!email || !password)
                return res.status(411).json({ msg: null, err: "some of the field missing from the requests" });
            const user = yield user_1.default.findOne({ email: email });
            if (!user) {
                return res.status(401);
            }
            const passwordCorrect = (0, crypto_1.validPassword)(password, user.passwordHash, user.salt);
            if (!passwordCorrect) {
                return res.status(401).json({
                    error: 'invalid username or password'
                });
            }
            const userForToken = {
                email: user.email,
                id: user.id,
            };
            let token = null;
            token = jsonwebtoken_1.default.sign(userForToken, config_1.JWT_SECRET ? config_1.JWT_SECRET : "Secret");
            if (!token) {
                return res.status(500).json({ msg: null, err: "Authorization Assignment failed." });
            }
            res.cookie("access_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            }).status(200).send({ name: user.name, email: user.email });
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({});
        }
    }),
    uploadImagesTo: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { image, email, imgNo } = req.body;
            if (!email || !email || !imgNo)
                return res.status(411).json({ msg: null, err: "some of the field missing from the requests" });
            yield writeBase64Data(image, email, imgNo);
            res.status(200).json({ mmsg: "image written successfully" });
        }
        catch (e) {
            console.log(e);
            res.status(500).json({ err: "error in sending the images" });
        }
    })
};
exports.default = controller;
