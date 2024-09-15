import mongoose from 'mongoose'

const roomSchema=new mongoose.Schema({
    creatorEmail:{
        type:String,
        required:true
    },
    code:{
        type:String,
        required:true,
        unique:true,
        length:6
    }
})

const Room=mongoose.model("Room",roomSchema)
export default Room