import mongoose from 'mongoose';
import dotenv from 'dotenv';


dotenv.config({path:'../.env'})

const connectDB=async():Promise<void>=>{
    try{
        if(process.env.DB_STRING!==undefined){
            const conn=await mongoose.connect(process.env.DB_STRING);
            console.log("mongo is connected");
        }
        else{
            console.log("undefined mongo string");
        }
        
    }
    catch(error){
        console.log(error)
    }
}

export default connectDB;