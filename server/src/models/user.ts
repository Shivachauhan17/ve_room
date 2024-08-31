import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  name: {
    type:String,
    required:true,
    },
  email: {
    type:String,
    required:true,
    unique:true
  },
  mobileNumber:{
    type:String,
    required:true
  },
  image:{
    type:[String],
    required:true,
    default:[]
  },
  passwordHash: {
    type:String,
    required:true
  },
  salt:{
    type:String,
    required:true
  }

  })

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

export default User