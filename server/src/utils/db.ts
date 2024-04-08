import mongoose from 'mongoose';
import {MONGODB_URI} from './config'


const connectDB=async():Promise<void>=>{
    try{
        if(MONGODB_URI!==undefined){
            await mongoose.connect(MONGODB_URI);
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