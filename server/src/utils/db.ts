import mongoose from 'mongoose';
import {DB_STRING} from './config'


const connectDB=async():Promise<void>=>{
    try{
        if(DB_STRING!==undefined){
            await mongoose.connect(DB_STRING);
            console.log("mongo is connected");
        }
        else{
            console.log("mongo not connected");
        }
    }
    catch(error){
        console.log(error)
    }
}

export default connectDB;