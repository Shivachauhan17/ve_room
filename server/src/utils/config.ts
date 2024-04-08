import dotenv from 'dotenv'
dotenv.config()

export const PORT = process.env.PORT
console.log("mongo uri",PORT)

export const MONGODB_URI = process.env.NODE_ENV==='test'
    ?process.env.TEST_MONGO_URI
    :process.env.MONGODB_URI

console.log("mongo uri",MONGODB_URI)

export const JWT_SECRET=process.env.TOKEN_SECRET