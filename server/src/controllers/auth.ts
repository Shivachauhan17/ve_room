import { Request,Response,NextFunction } from "express"
import User from '../models/user'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from "../utils/config"
import { validPassword,genPassword } from "../utils/crypto"

export interface JwtPayload {
    id: string;    
    email: string;
}

const controller={
    register:async(req:Request,res:Response)=>{
        try{
            const {name,email,password,mobileNumber}=req.body
            if((!name || !email || !password || !mobileNumber) || (mobileNumber.length!==10)) 
                return res.status(400).json({msg:null,err:"some of the field missing from the requests"})


            const userExist=await User.findOne({email:email})
            
            if(userExist)
                return res.status(401).json({msg:null,err:"user Already exists"})

            const {hash,salt}=genPassword(password)


            const user=new User({
                name:name,
                email:email,
                passwordHash:hash,
                mobileNumber:mobileNumber,
                salt:salt
            })

            const savedUser=await user.save()
            const userForToken:JwtPayload = {
                email: savedUser.email,
                id: savedUser.id,
              }
            let token=null
            
            token=jwt.sign(userForToken,JWT_SECRET?JWT_SECRET:"Secret")
            if(!token){
                return res.status(500).json({msg:null,err:"Authorization Assignment failed."})
            }

            res.cookie("access_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
              }).status(200).send({name:name,email:email})
        }
        catch(err){
            console.log(err)
            return res.status(500).json({})
        }
    },
    login:async(req:Request,res:Response,next:NextFunction)=>{
        try{
            const {email,password}=req.body
            if(!email || !password)
                return res.status(411).json({msg:null,err:"some of the field missing from the requests"})

            const user=await User.findOne({email:email})
            if(!user){
                return res.status(401)
            }
            const passwordCorrect=validPassword(password,user.passwordHash,user.salt)
            if(!passwordCorrect){
                return res.status(401).json({
                    error: 'invalid username or password'
                })
            }

            const userForToken:JwtPayload = {
                email: user.email,
                id: user.id,
              }
            let token=null
            
            token=jwt.sign(userForToken,JWT_SECRET?JWT_SECRET:"Secret")
            if(!token){
                return res.status(500).json({msg:null,err:"Authorization Assignment failed."})
            }
            res.cookie("access_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
              }).status(200).send({name:user.name,email:user.email})
        }
        catch(err){
            console.log(err)
            return res.status(500).json({})

        }
    }

}

export default controller