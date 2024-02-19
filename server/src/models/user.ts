import mongoose,{Schema,Document} from 'mongoose';

export interface IUser extends Document{
    email:string,
    password:string,
    salt:string
}


const UserSchema:Schema=new Schema({
    email:{type:String},
    password:{type:String,default:null, unique:true},
    salt:{type:String,default:null, unique:true}
});

export default mongoose.model<IUser>('User',UserSchema);
