import { Request,Response } from 'express'
import {saltHash,genPassword,validPassword} from '../lib/passwordUtil'
import { Session } from 'express-session'
import con from '../config/database'
import { RowDataPacket, FieldPacket } from 'mysql2/promise';

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

export interface IUser extends RowDataPacket{
    email:string,
    password:string,
    salt:string
}


const controller={
    signup:async (req:CustomRequest,res:Response):Promise<Response>=>{
        try{
            const {email,password,confirmPassword}:SignupData=req.body
            if(!email || !password || !confirmPassword ){
                return res.status(404).json({message:null,error:"data has not been sent correctly"})
            }
            const [rows,fields]:[IUser[], FieldPacket[]]=await con.promise().query(`SELECT * FROM user WHERE email='${email}';`)
            
            if(rows.length>0){
                return res.status(203).json({message:null,error:'user Already exists'})
            }

            const saltAndHash:saltHash=genPassword(password)

            await con.promise().query(`INSERT INTO user (email,password,salt) VALUES ('${email}','${saltAndHash.hash}','${saltAndHash.salt}');`)


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
            
            const [rows,fields]:[IUser[], FieldPacket[]]=await con.promise().query(`SELECT * FROM user WHERE email='${email}'`)

            if(rows.length===0){
                return res.status(203).json({message:null,error:'no user found with this email'})
            }

            const user:IUser=rows[0]

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