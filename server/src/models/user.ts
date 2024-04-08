import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  username: {
    type:String,
    required:true,
    unique:true
    },
  name: {
    type:String,
    required:true},
  passwordHash: {
    type:String,
    required:true},
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