import { Request,Response } from 'express'
import User,{IUser} from '../models/user'
import {saltHash,genPassword,validPassword} from '../lib/passwordUtil'
import { Session } from 'express-session'

export interface SignupData{
    email:string,
    password:string,
    confirmPassword:string
}

export interface ILoginData{
    email:string,
    password:string,
}

export interface SessionData  {
    email:string
}

export interface CustomRequest extends Request{
    session:Session & Partial<SessionData>
}



const controller={
    signup:async (req:CustomRequest,res:Response):Promise<Response>=>{
        try{
            const {email,password,confirmPassword}:SignupData=req.body
            if(!email || !password || !confirmPassword ){
                return res.status(404).json({message:null,error:"data has not been sent correctly"})
            }
            const user=await User.findOne({email:email})
            if(user){
                return res.status(203).json({message:null,error:'user Already exists'})
            }
            const saltAndHash:saltHash=genPassword(password)

            const newUser:IUser= new User({
                email:email,
                password:saltAndHash.hash,
                salt:saltAndHash.salt
            })

            await newUser.save()

            req.session.email=email
            req.session.save(err=>{
                if(err){
                    return res.status(500).json({message:null,error:"error in saving the data into session"})
                }
            })
            return res.status(200).json({message:{email:email},error:null})

        }
        catch(err){
            console.log(err)
            return res.status(500).json({message:null,error:'error occured somewhere in process Report it'})
        }
    },
    login:async (req:CustomRequest,res:Response):Promise<Response>=>{
        try{
            const {email,password}:ILoginData=req.body
            if(!email || !password){
                return res.status(404).json({message:null,error:"data has not been sent correctly"})
            }
            
            const user=await User.findOne({email:email})
            if(!user){
                return res.status(203).json({message:null,error:'no user found with this email'})
            }
            
            const compare:boolean=validPassword(password,user.salt,user.password)
            if(compare){
                req.session.email=email
                req.session.save(err=>{
                    if(err){
                        return res.status(500).json({message:null,error:"error in saving the data into session"})
                    }
                })
            }
            else{
                return res.status(203).json({message:null,error:'wrong credentials'})
            }

            
            return res.status(200).json({message:{email:email},error:null})

        }
        catch(err){
            console.log(err)
            return res.status(500).json({message:null,error:'error occured somewhere in process Report it'})
        }
    }
}

export default controller;