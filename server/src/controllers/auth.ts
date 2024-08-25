import { Request,Response,NextFunction } from "express"
import User from '../models/user'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from "../utils/config"


const controller={
    register:async(req:Request,res:Response,next:NextFunction)=>{
        try{
            const {name,email,password,mobileNumber}=req.body
            if(!name || !email || !password || !mobileNumber) 
                return res.status(400).json({msg:null,err:"some of the field missing from the requests"})

          

            const userExist=await User.findOne({email:email})
            
            if(userExist)
                return res.status(409).json({msg:null,err:"user Already exists"})

            const saltRounds=10
            const passwordHash=await bcrypt.hash(password,50)

            const user=new User({
                name,
                email,
                passwordHash,
                mobileNumber
            })

            const savedUser=await user.save()
            const userForToken = {
                email: savedUser.email,
                id: savedUser.id,
              }
            let token=null
            if(JWT_SECRET!==undefined)
                token=jwt.sign(userForToken,JWT_SECRET)
            if(!token){
                return res.status(400).json({msg:null,err:"Authorization Assignment failed."})
            }
            res.status(200).send({token})
        }
        catch(err){
            console.log(err)
            return res.status(500).json({})
        }
    },
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

}

export default controller