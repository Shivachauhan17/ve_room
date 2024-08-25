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
            const { name, email, password, mobileNumber } = req.body;
            if (!name || !email || !password || !mobileNumber)
                return res.status(400).json({ msg: null, err: "some of the field missing from the requests" });
            const userExist = yield user_1.default.findOne({ email: email });
            if (userExist)
                return res.status(409).json({ msg: null, err: "user Already exists" });
            const saltRounds = 10;
            const passwordHash = yield bcrypt_1.default.hash(password, 50);
            const user = new user_1.default({
                name,
                email,
                passwordHash,
                mobileNumber
            });
            const savedUser = yield user.save();
            const userForToken = {
                email: savedUser.email,
                id: savedUser.id,
            };
            let token = null;
            if (config_1.JWT_SECRET !== undefined)
                token = jsonwebtoken_1.default.sign(userForToken, config_1.JWT_SECRET);
            if (!token) {
                return res.status(400).json({ msg: null, err: "Authorization Assignment failed." });
            }
            res.status(200).send({ token });
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({});
        }
    }),
    // login:async(req:Request,res:Response,next:NextFunction)=>{
    //     try{
    //         const {username,password}=req.body
    //         if(!username || !password)
    //             return res.status(400).json({msg:null,err:"some of the field missing from the requests"})
    //         const user=await User.findOne({username:username})
    //         const passwordCorrect=user===null?false:await bcrypt.compare(password,user.passwordHash)
    //         if(!(user && passwordCorrect)){
    //             return res.status(401).json({
    //                 error: 'invalid username or password'
    //             })
    //         }
    //         const userForToken = {
    //             username: user.username,
    //             id: user._id,
    //         }
    //         let token=null
    //         if(JWT_SECRET!==undefined )
    //             token = jwt.sign(userForToken, JWT_SECRET)
    //         res
    //         .status(200)
    //         .send({ token, username: user.username, name: user.email })
    //     }
    //     catch(err){
    //         console.log(err)
    //         return res.status(500).json({})
    //     }
    // }
};
exports.default = controller;
