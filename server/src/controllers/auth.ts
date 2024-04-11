import { Request,Response,NextFunction } from "express"
import User from '../models/user'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from "../utils/config"


const controller={
    register:async(req:Request,res:Response,next:NextFunction)=>{
        try{
            const {username,name,password,confirmPassword}=req.body
            if(!username || !name || !password || !confirmPassword) 
                return res.status(400).json({msg:null,err:"some of the field missing from the requests"})

            if(password!==confirmPassword)
                return res.status(400).json({msg:null,err:"password and confirmpassword field value is not the same"})

            const userExist=await User.findOne({username:username})
            
            if(userExist)
                return res.status(409).json({msg:null,err:"user Already exists"})

            const saltRounds=10
            const passwordHash=await bcrypt.hash(password,50)

            const user=new User({
                username,
                name,
                passwordHash
            })

            const savedUser=await user.save()
            const userForToken = {
                username: savedUser.username,
                id: savedUser._id,
              }
            let token=null
            if(JWT_SECRET!==undefined)
                token=jwt.sign(userForToken,JWT_SECRET)

            res.status(200).send({token,username: user.username, name: user.name})
        }
        catch(err){
            console.log(err)
            return res.status(500).json({})
        }
    },
    login:async(req:Request,res:Response,next:NextFunction)=>{
        try{
            const {username,password}=req.body
            if(!username || !password)
                return res.status(400).json({msg:null,err:"some of the field missing from the requests"})

            const user=await User.findOne({username:username})
            const passwordCorrect=user===null?false:await bcrypt.compare(password,user.passwordHash)
            if(!(user && passwordCorrect)){
                return res.status(401).json({
                    error: 'invalid username or password'
                })
            }

            const userForToken = {
                username: user.username,
                id: user._id,
            }
            
            let token=null
            if(JWT_SECRET!==undefined )
                token = jwt.sign(userForToken, JWT_SECRET)
            
            res
            .status(200)
            .send({ token, username: user.username, name: user.name })
        }
        catch(err){
            console.log(err)
            return res.status(500).json({})

        }
    }

}

export default controller