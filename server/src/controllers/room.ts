import Room from "../models/room";
import { Response } from "express";
import { IRequest } from "../server";

function generateUniqueHexCode() {
    // Generate a random number and convert it to a hexadecimal string
    const randomHex = Math.floor(Math.random() * 0xFFFFFF).toString(16);
  
    // Pad with leading zeros to ensure it is always 6 digits long
    return randomHex.padStart(6, '0').toUpperCase();
  }


const controller={
    createRoom:async function(req:IRequest,res:Response){
        try{
            let code=generateUniqueHexCode()
            let isExist=await Room.find({code:code})

            if(isExist){
                await Room.updateOne({code:code},{$set:{email:req.email}})
            }
            else{
                const newRoom = new Room({
                    email: req.email,
                    code: code,
                });    
                await newRoom.save();
            }
            res.status(200).json({data:code})
        }
        catch(e){
            console.log(e)
            res.status(500).json({err:"error in making a new room."})
        }
    },
    joinCall:async function(req:IRequest,res:Response){
        try{
            const {code}=req.body
            if(!code){
                return res.status(400).json({msg:null,err:"some of the field missing from the requests"})
            }
            const isOtp=await Room.findOne({code:code,creatorEmail:req.email})
            if(!isOtp){
                return res.status(204).json({msg:false})
            }
            return res.status(200).json({msg:true})
        }
        catch(e){
            console.log(e)
            res.status(500).json({err:"error in joining the room."})
        }
    }
}


export default controller